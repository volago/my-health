import { Timestamp } from 'firebase/firestore';
import { SafeHtml } from '@angular/platform-browser';

export type ReportStatus = 'to-process' | 'processing' | 'success' | 'error';

export interface Report {
  reportId: string;        // Firestore document ID - dodawany po stronie klienta przy odczycie
  userId: string;
  createdAt: Timestamp;    // Firestore Timestamp
  updatedAt?: Timestamp;   // Firestore Timestamp
  status: ReportStatus;
  title: string;
  reportUrl?: string;
  storagePath?: string;
  errorDetails?: string;
}

export interface DisplayReport {
  reportId: string;
  userId: string;
  createdAtFormatted: string;
  updatedAtFormatted?: string;
  status: ReportStatus;
  title: string;
  reportUrl?: string;
  storagePath?: string;
  errorDetails?: string;
  originalReport: Report; // Przechowuje oryginalny obiekt z Firestore
} 