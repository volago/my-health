import { Firestore, Timestamp, FieldValue } from 'firebase-admin/firestore';
import { Storage } from 'firebase-admin/storage';
import * as logger from 'firebase-functions/logger';
import { UserProfile, TestResult, TestCatalog } from '@my-health/domain';
import { OpenRouterService } from './services/openrouter.service';
import { TestResultWithCatalog } from './services/openrouter.types';

// Ideally, these models would be imported from a shared library (e.g., libs/domain)
export enum ReportStatus {
    TO_PROCESS = 'to-process',       // Formerly PENDING_GENERATION
    PROCESSING = 'processing',       // Value changed to lowercase
    SUCCESS = 'success',         // Formerly PROCESSED
    ERROR = 'error',             // Value changed to lowercase
    VIEWED = 'viewed',           // Value changed to lowercase
}

export interface Report {
    id: string;
    userId: string;
    createdAt: Timestamp | Date;
    status: ReportStatus;
    data?: {
        includedTestResultIds: string[];
        userProfile: UserProfile;
    };
    reportUrl?: string;
    errorMessage?: string;
    tokensUsed?: number;
    generationTimeMs?: number;
}

/**
 * Processes a single report: generates HTML using OpenRouter AI, uploads to Storage, updates Firestore.
 * @param {Firestore} db Firestore admin instance.
 * @param {Storage} storage Storage admin instance.
 * @param {typeof FieldValue} fieldValueUtil Firestore FieldValue class for server timestamps etc.
 * @param {string} reportId The ID of the report document.
 * @param {string} userId The ID of the user who owns the report.
 * @param {Report} reportData The data of the report.
 * @param {string} openRouterApiKey The OpenRouter API key for AI generation.
 * @returns {Promise<void>}
 */
export async function processReport(
    db: Firestore,
    storage: Storage,
    fieldValueUtil: typeof FieldValue,
    reportId: string,
    userId: string,
    reportData: Report,
    openRouterApiKey: string
): Promise<void> {
    logger.info(`Processing report ${reportId} for user ${userId}`, { reportId, userId });

    // Dodajemy szczegółowe logowanie struktury danych
    logger.info(`Report data structure:`, {
        reportId,
        userId: reportData.userId,
        status: reportData.status,
        hasData: !!reportData.data,
        dataKeys: reportData.data ? Object.keys(reportData.data) : 'N/A',
        fullData: reportData.data
    });

    const reportDocRef = db.collection('users').doc(userId).collection('reports').doc(reportId);
    const startTime = Date.now();

    try {
        // 1. Update status to PROCESSING
        await reportDocRef.update({
            status: ReportStatus.PROCESSING,
            processingDate: fieldValueUtil.serverTimestamp(),
        });

        // 2. Pobierz dane potrzebne do generowania raportu
        const reportInput = await gatherReportData(db, userId, reportData.data);
        
        // 3. Generuj raport używając OpenRouter
        const openRouterService = new OpenRouterService(openRouterApiKey);
        const htmlContent = await openRouterService.generateHealthReport(
            reportInput.userProfile,
            reportInput.testResults
        );

        logger.info(`Generated AI report for ${reportId}, length: ${htmlContent.length} characters`);

        // 4. Upload HTML to Cloud Storage
        const bucket = storage.bucket();
        const filePath = `reports/${reportId}/report.html`;
        const file = bucket.file(filePath);

        await file.save(htmlContent, {
            metadata: {
                contentType: 'text/html',
                customMetadata: {
                    userId: userId,
                    reportId: reportId,
                    generatedAt: new Date().toISOString()
                }
            },
        });

        await file.makePublic();
        const publicUrl = file.publicUrl();
        logger.info(`Public URL for report ${reportId}: ${publicUrl}`);

        // 5. Update Firestore with SUCCESS status
        const processingTime = Date.now() - startTime;
        await reportDocRef.update({
            status: ReportStatus.SUCCESS,
            reportUrl: publicUrl,
            processedDate: fieldValueUtil.serverTimestamp(),
            generationTimeMs: processingTime,
            errorMessage: fieldValueUtil.delete(),
        });

        logger.info(`Report ${reportId} processed successfully in ${processingTime}ms`);

    } catch (error: any) {
        logger.error(`Error processing report ${reportId}:`, error);
        
        await reportDocRef.update({
            status: ReportStatus.ERROR,
            errorMessage: error.message || 'Wystąpił nieoczekiwany błąd podczas generowania raportu.',
            errorDate: fieldValueUtil.serverTimestamp(),
            generationTimeMs: Date.now() - startTime,
        }).catch(updateError => {
            logger.error(`Failed to update report ${reportId} with error status:`, updateError);
        });
    }
}

/**
 * Gathers all necessary data for report generation from Firestore.
 * @param {Firestore} db Firestore admin instance.
 * @param {string} userId The ID of the user.
 * @param {object} reportRequestData Optional report request data - if not provided, will fetch all user data.
 * @returns {Promise<object>} Object containing user profile and test results with catalog data.
 */
async function gatherReportData(
    db: Firestore,
    userId: string,
    reportRequestData?: { includedTestResultIds: string[]; userProfile: UserProfile }
): Promise<{
    userProfile: UserProfile;
    testResults: TestResultWithCatalog[];
}> {
    logger.info(`Gathering report data for user ${userId}`);

    // Jeśli nie ma danych w dokumencie raportu, pobierz wszystko z Firestore
    if (!reportRequestData) {
        logger.info('No report request data provided - fetching all user data from Firestore');
        
        // Pobierz profil użytkownika
        const userProfileDoc = await db.collection('users').doc(userId).get();
        if (!userProfileDoc.exists) {
            throw new Error(`User profile not found for userId: ${userId}`);
        }
        
        const userProfile = userProfileDoc.data() as UserProfile;
        logger.info(`Loaded user profile for user ${userId}`, {
            birthYear: userProfile.birthYear,
            sex: userProfile.sex,
            detailLevel: userProfile.detailLevel
        });

        // Pobierz wszystkie wyniki badań użytkownika
        const testResultsSnapshot = await db.collection('users').doc(userId).collection('results').get();
        const allTestResultIds = testResultsSnapshot.docs.map(doc => doc.id);
        
        logger.info(`Found ${allTestResultIds.length} test results for user ${userId}`);
        
        // Utwórz strukturę danych jak w oryginalnym reportRequestData
        reportRequestData = {
            includedTestResultIds: allTestResultIds,
            userProfile: userProfile
        };
    }

    logger.info(`Using report data:`, {
        userId,
        testResultIds: reportRequestData.includedTestResultIds,
        testResultsCount: reportRequestData.includedTestResultIds.length
    });

    // Pobierz katalog badań
    const catalogSnapshot = await db.collection('tests-catalog').get();
    const testCatalogMap = new Map<string, TestCatalog>();
    
    catalogSnapshot.docs.forEach(doc => {
        const catalog = doc.data() as TestCatalog;
        testCatalogMap.set(catalog.testId, catalog);
    });

    logger.info(`Loaded ${testCatalogMap.size} test catalog entries`);

    // Pobierz wyniki badań
    const testResults: TestResultWithCatalog[] = [];
    const resultsCollection = db.collection('users').doc(userId).collection('results');
    
    for (const resultId of reportRequestData.includedTestResultIds) {
        const resultDoc = await resultsCollection.doc(resultId).get();
        
        if (resultDoc.exists) {
            const resultData = resultDoc.data();
            const testResult: TestResult = { 
                resultId: resultDoc.id, 
                testId: resultData.testId,
                createdAt: resultData.createdAt instanceof Timestamp ? resultData.createdAt.toDate() : resultData.createdAt,
                parameters: resultData.parameters
            };
            const catalog = testCatalogMap.get(testResult.testId);
            
            if (catalog) {
                testResults.push({
                    ...testResult,
                    catalog
                });
                logger.info(`Added test result: ${catalog.name} for report generation`);
            } else {
                logger.warn(`Catalog not found for test ID: ${testResult.testId}`);
            }
        } else {
            logger.warn(`Test result document not found: ${resultId}`);
        }
    }

    if (testResults.length === 0) {
        logger.warn('No test results found - generating general health report based on user profile only');
        
        return {
            userProfile: reportRequestData.userProfile,
            testResults: [] // Pusty array - raport będzie bazować tylko na profilu użytkownika
        };
    }

    logger.info(`Successfully gathered ${testResults.length} test results for report generation`);

    return {
        userProfile: reportRequestData.userProfile,
        testResults
    };
} 