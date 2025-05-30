/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import admin from 'firebase-admin';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import * as logger from 'firebase-functions/logger';
import { processReport, Report, ReportStatus } from './report-processor';

// Initialize Firebase Admin SDK
// This needs to be done only once per function deployment.
// Ensure your GOOGLE_APPLICATION_CREDENTIALS environment variable is set
// when running locally or that the Functions service account has permissions in GCP.
if (admin.apps.length === 0) {
  admin.initializeApp();
  logger.info('Firebase Admin SDK initialized in main.ts');
} else {
  logger.info('Firebase Admin SDK already initialized in main.ts');
}

const adminFirestore = admin.firestore();
const adminStorage = admin.storage();
const fieldValue = admin.firestore.FieldValue;

// No longer needed as helloWorld was just for testing
// export const helloWorld = onRequest((request, response) => {
//   logger.info('Hello logs!', { structuredData: true });
//   response.send('Hello from Firebase!');
// });

/**
 * Triggered when a new report document is created with status PENDING_GENERATION.
 */
export const onReportRequested = onDocumentWritten(
  { document: 'reports/{reportId}', region: 'europe-west1' }, // Adjust region as needed
  async (event) => {
    logger.info(`onReportRequested triggered for ${event.params.reportId}`, { eventId: event.id });

    // We are only interested in 'create' events for new reports
    // or 'update' events if a report was re-submitted (though current logic focuses on 'create')
    if (!event.data) {
      logger.info('Event data is undefined (document deleted or no after state), skipping.');
      return;
    }

    const snapshot = event.data.after;
    if (!snapshot) {
      logger.info('No snapshot data found in event.data.after, skipping.');
      return;
    }

    const reportId = snapshot.id;
    const reportData = snapshot.data() as Report; // Cast to our Report interface

    logger.info(`Received report ${reportId} with status: ${reportData.status}`, { reportId, status: reportData.status });

    // Only process if the status is PENDING_GENERATION
    // This check is also to prevent infinite loops if the function itself updates the document
    // and causes another trigger (though onDocumentWritten is usually smarter about this)
    if (reportData.status === ReportStatus.TO_PROCESS) {
      logger.info(`Calling processReport for report ${reportId}.`);
      try {
        await processReport(adminFirestore, adminStorage, fieldValue, reportId, reportData);
        logger.info(`processReport finished for report ${reportId}.`);
      } catch (error) {
        logger.error(`Error calling processReport for ${reportId} from onReportRequested:`, error);
        // Error is already logged and handled within processReport, including setting status to ERROR
      }
    } else {
      logger.info(`Report ${reportId} status is not ${ReportStatus.TO_PROCESS} (it is ${reportData.status}), skipping processing.`);
    }
  }
);
