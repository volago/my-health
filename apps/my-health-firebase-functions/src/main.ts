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
  { document: 'users/{userId}/reports/{reportId}' },
  async (event) => {
    logger.info(`onReportRequested triggered for users/${event.params.userId}/reports/${event.params.reportId}`, { eventId: event.id });

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

    if (reportData.status === ReportStatus.TO_PROCESS) {
      logger.info(`Report ${reportId} has status TO_PROCESS. Starting processing.`);
      try {
        await processReport(adminFirestore, adminStorage, fieldValue, reportId, event.params.userId, reportData);
        logger.info(`processReport finished for report ${reportId}.`);
      } catch (error) {
        logger.error(`Error calling processReport for ${reportId} from onReportRequested:`, error);
        // Error is already logged and handled within processReport, including setting status to ERROR
      }
    } else {
      logger.info(`Report ${reportId} status is ${reportData.status} (not TO_PROCESS). Skipping processing.`);
    }
  }
);
