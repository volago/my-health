import { Firestore, Timestamp, FieldValue } from 'firebase-admin/firestore';
import { Storage } from 'firebase-admin/storage';
import * as logger from 'firebase-functions/logger';

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
  requestDate: Timestamp | Date;
  status: ReportStatus;
  data?: any;
  reportUrl?: string;
  errorMessage?: string;
}

/**
 * Processes a single report: generates HTML, uploads to Storage, updates Firestore.
 * @param {Firestore} db Firestore admin instance.
 * @param {Storage} storage Storage admin instance.
 * @param {typeof FieldValue} fieldValueUtil Firestore FieldValue class for server timestamps etc.
 * @param {string} reportId The ID of the report document.
 * @param {Report} reportData The data of the report.
 * @returns {Promise<void>}
 */
export async function processReport(
  db: Firestore,
  storage: Storage,
  fieldValueUtil: typeof FieldValue,
  reportId: string,
  reportData: Report
): Promise<void> {
  logger.info(`Processing report ${reportId} for user ${reportData.userId}`, { reportId, userId: reportData.userId });

  const reportDocRef = db.collection('reports').doc(reportId);

  try {
    // 1. Update status to PROCESSING
    await reportDocRef.update({
      status: ReportStatus.PROCESSING,
      processingDate: fieldValueUtil.serverTimestamp(), // Add a processing start timestamp
    });

    // 2. Simulate HTML generation (replace with actual HTML generation logic)
    // This should use reportData.data to create the HTML content.
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Report ${reportId}</title>
        <style>
          body { font-family: sans-serif; margin: 20px; }
          h1 { color: #333; }
          p { color: #555; }
          pre { background-color: #f4f4f4; padding: 10px; border-radius: 5px; }
        </style>
      </head>
      <body>
        <h1>Report Details</h1>
        <p><strong>Report ID:</strong> ${reportId}</p>
        <p><strong>User ID:</strong> ${reportData.userId}</p>
        <p><strong>Requested Date:</strong> ${new Date( (reportData.requestDate as Timestamp).toDate().toDateString() ).toISOString()}</p>
        <h2>Report Data:</h2>
        <pre>${JSON.stringify(reportData.data, null, 2)}</pre>
        <p><em>Generated on: ${new Date().toISOString()}</em></p>
      </body>
      </html>
    `;
    logger.info(`Generated HTML for report ${reportId}`);

    // 3. Upload HTML to Cloud Storage
    const bucket = storage.bucket(); // Uses the default bucket
    const filePath = `reports/${reportId}/report.html`;
    const file = bucket.file(filePath);

    await file.save(htmlContent, {
      metadata: {
        contentType: 'text/html',
      },
    });
    logger.info(`Uploaded HTML to gs://${bucket.name}/${filePath}`);

    // 4. Make the file public (or use signed URLs for more security)
    await file.makePublic();
    const publicUrl = file.publicUrl();
    logger.info(`Public URL for report ${reportId}: ${publicUrl}`);

    // 5. Update Firestore with PROCESSED status and URL
    await reportDocRef.update({
      status: ReportStatus.SUCCESS,
      reportUrl: publicUrl,
      processedDate: fieldValueUtil.serverTimestamp(), // Add a completion timestamp
      errorMessage: fieldValueUtil.delete(), // Remove any previous error message
    });

    logger.info(`Report ${reportId} processed successfully.`);

  } catch (error: any) {
    logger.error(`Error processing report ${reportId}:`, error);
    await reportDocRef.update({
      status: ReportStatus.ERROR,
      errorMessage: error.message || 'An unknown error occurred during processing.',
      errorDate: fieldValueUtil.serverTimestamp(),
    }).catch(updateError => {
        // Log if updating the error status itself fails
        logger.error(`Failed to update report ${reportId} with error status:`, updateError);
    });
  }
} 