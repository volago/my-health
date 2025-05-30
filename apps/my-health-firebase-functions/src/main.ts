/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { onRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';

// Inicjalizacja Firebase Admin SDK (tylko raz)
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();
const storage = admin.storage();

interface ReportData {
  reportId?: string; // Dodawany przez klienta lub funkcję triggera
  userId: string;
  createdAt: admin.firestore.Timestamp;
  updatedAt?: admin.firestore.Timestamp;
  status: 'to-process' | 'processing' | 'success' | 'error';
  title: string;
  reportHtmlUrl?: string;
  storagePath?: string;
  errorDetails?: string;
}

export const processReportRequest = onDocumentWritten(
  "users/{userId}/reports/{reportId}", 
  async (event) => {
    logger.info('processReportRequest triggered', { eventId: event.id });

    const snap = event.data;
    if (!snap) {
      logger.info('No data associated with the event', { eventId: event.id });
      return;
    }

    const reportId = event.params.reportId;
    const userId = event.params.userId;

    // Pobierz dane przed i po zmianie
    const dataBefore = snap.before.data() as ReportData | undefined;
    const dataAfter = snap.after.data() as ReportData | undefined;

    // Sprawdź, czy dokument został właśnie utworzony ze statusem 'to-process'
    // lub czy status zmienił się na 'to-process'
    const isNewToProcess = !dataBefore && dataAfter && dataAfter.status === 'to-process';
    const statusChangedToProcess = 
      dataBefore && dataAfter && 
      dataBefore.status !== 'to-process' && 
      dataAfter.status === 'to-process';

    if (!dataAfter) { // Dokument został usunięty
        logger.info(`Report ${reportId} deleted for user ${userId}. No action needed.`);
        return;
    }

    if (!isNewToProcess && !statusChangedToProcess) {
      logger.info(
        `Report ${reportId} for user ${userId} - status is '${dataAfter.status}' or no relevant change. No action needed.`, 
        { dataBeforeStatus: dataBefore?.status, dataAfterStatus: dataAfter.status }
      );
      return;
    }

    logger.info(`Processing report ${reportId} for user ${userId}. Current status: ${dataAfter.status}`);

    const reportRef = db.collection('users').doc(userId).collection('reports').doc(reportId);

    try {
      // 1. Zaktualizuj status na 'processing'
      await reportRef.update({
        status: 'processing',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      logger.info(`Report ${reportId} status updated to 'processing'.`);

      // 2. Symuluj pracę (np. generowanie HTML)
      // W rzeczywistej aplikacji tutaj byłaby logika generowania raportu
      await new Promise(resolve => setTimeout(resolve, 5000)); // Symulacja 5s pracy
      const reportHtmlContent = `<h1>Raport dla ${dataAfter.title}</h1><p>Wygenerowano: ${new Date().toLocaleString()}</p><p>ID Raportu: ${reportId}</p>`;
      logger.info(`Report ${reportId} HTML content generated.`);

      // 3. Zapisz HTML do Cloud Storage
      const filePath = `users/${userId}/reports/${reportId}/report.html`;
      const file = storage.bucket().file(filePath);
      await file.save(reportHtmlContent, {
        contentType: 'text/html',
        // Można dodać metadata, np. ACL jeśli potrzebne, ale domyślnie dostęp jest przez URL
      });
      logger.info(`Report ${reportId} HTML saved to Storage at ${filePath}.`);

      // 4. Pobierz URL do pobrania pliku
      // Używamy getSignedUrl dla uproszczenia, można też ustawić plik jako publiczny i użyć publicUrl
      // Ważne: getSignedUrl generuje URL z ograniczonym czasem życia.
      // Dla trwałego dostępu, plik powinien być publiczny lub obsłużony przez inną logikę autoryzacji.
      // Zgodnie z planem, oczekujemy reportHtmlUrl, który jest stabilny.
      // Aby to osiągnąć, ustawimy plik jako publiczny do odczytu.
      await file.makePublic();
      const downloadURL = file.publicUrl();
      logger.info(`Report ${reportId} public URL: ${downloadURL}`);

      // 5. Zaktualizuj dokument raportu w Firestore
      await reportRef.update({
        status: 'success',
        reportHtmlUrl: downloadURL,
        storagePath: filePath,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        errorDetails: admin.firestore.FieldValue.delete() // Usuń ewentualne wcześniejsze błędy
      });
      logger.info(`Report ${reportId} successfully processed. Status updated to 'success'.`);

    } catch (error: any) {
      logger.error(`Error processing report ${reportId} for user ${userId}:`, error);
      try {
        await reportRef.update({
          status: 'error',
          errorDetails: error.message || 'Unknown error during processing',
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      } catch (updateError) {
        logger.error(`Failed to update report ${reportId} status to 'error':`, updateError);
      }
    }
  }
);

// Przykładowa funkcja helloWorld pozostawiona dla referencji, jeśli potrzebna
// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
