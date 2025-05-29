import { signalStore, withState, withMethods, patchState, withComputed } from '@ngrx/signals';
import { computed, effect, inject, Signal } from '@angular/core';
import { Firestore, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, Timestamp, collectionData, doc } from '@angular/fire/firestore';
import { Storage } from '@angular/fire/storage';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Report, DisplayReport, ReportStatus } from '../models/report.models';
import { AuthService } from '@my-health/features/auth-api';
import { Observable, from, of } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';

type ReportsState = {
  reports: DisplayReport[];
  selectedReportId: string | null;
  isLoadingList: boolean;
  listError: string | null;
  isLoadingDetail: boolean;
  detailError: string | null;
  selectedReportHtml: SafeHtml | null;
  currentUserId: string | null;
};

const initialState: ReportsState = {
  reports: [],
  selectedReportId: null,
  isLoadingList: false,
  listError: null,
  isLoadingDetail: false,
  detailError: null,
  selectedReportHtml: null,
  currentUserId: null,
};

export const ReportSignalStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, firestore = inject(Firestore), storage = inject(Storage), sanitizer = inject(DomSanitizer), authService = inject(AuthService)) => {

    effect(() => {
      const user = authService.currentUser();
      patchState(store, { currentUserId: user ? user.uid : null });
      if (user) {
        loadReportsInternal(user.uid);
      }
    });

    function toDisplayReport(reportDoc: Report & { reportId: string }): DisplayReport {
      return {
        ...reportDoc,
        createdAtFormatted: reportDoc.createdAt instanceof Timestamp ? reportDoc.createdAt.toDate().toLocaleString() : 'N/A',
        updatedAtFormatted: reportDoc.updatedAt instanceof Timestamp ? reportDoc.updatedAt.toDate().toLocaleString() : undefined,
        originalReport: reportDoc,
      };
    }
    
    function loadReportsInternal(userId: string): void {
        if (!userId) return;
        patchState(store, { isLoadingList: true, listError: null });
        const reportsCol = collection(firestore, `users/${userId}/reports`);
        const q = query(reportsCol, orderBy('createdAt', 'desc'));

        (collectionData(q, { idField: 'reportId' }) as Observable<Report[] | undefined>)
          .pipe(
            map(reports => reports?.map(r => toDisplayReport(r as Report & { reportId: string })) || []),
            tap(displayReports => patchState(store, { reports: displayReports, isLoadingList: false })),
            catchError(err => {
              patchState(store, { listError: err.message, isLoadingList: false });
              return of([]);
            })
          ).subscribe(); 
    }

    return {
      loadReports(): void {
        const userId = store.currentUserId();
        if (userId) loadReportsInternal(userId);
      },

      async createReportRequest(title: string): Promise<string | null> {
        const userId = store.currentUserId();
        if (!userId) {
          console.error("User not logged in");
          return null;
        }
        try {
          const reportsCol = collection(firestore, `users/${userId}/reports`);
          const newReportDoc = await addDoc(reportsCol, {
            userId,
            title,
            status: 'to-process' as ReportStatus,
            createdAt: serverTimestamp(),
          });
          return newReportDoc.id;
        } catch (error: any) {
          console.error("Error creating report request:", error);
          return null;
        }
      },

      selectReport(reportId: string | null): void {
        patchState(store, { selectedReportId: reportId, selectedReportHtml: null, detailError: null });
        if (reportId) {
          const selected = store.reports().find(r => r.reportId === reportId);
          if (selected?.status === 'success' && selected.reportHtmlUrl) {
            (this as any).loadReportHtml(selected.reportHtmlUrl);
          } else if (selected?.status !== 'success' && selected?.status !== 'processing' && selected?.status !== 'to-process') {
            patchState(store, { selectedReportHtml: null, detailError: selected?.errorDetails || 'Raport zawiera błędy lub nie jest jeszcze gotowy.' });
          } else {
             patchState(store, { selectedReportHtml: null, detailError: null });
          }
        }
      },

      async loadReportHtml(url: string): Promise<void> {
        patchState(store, { isLoadingDetail: true, detailError: null, selectedReportHtml: null });
        try {
          const response = await fetch(url);
          if (!response.ok) throw new Error(`Nie udało się pobrać raportu HTML: ${response.statusText}`);
          const htmlString = await response.text();
          patchState(store, { selectedReportHtml: sanitizer.bypassSecurityTrustHtml(htmlString), isLoadingDetail: false });
        } catch (error: any) {
          patchState(store, { detailError: error.message, isLoadingDetail: false });
        }
      },
    };
  }),
  withComputed((store) => ({
    selectedReport: computed(() => {
      const reports = store.reports();
      const id = store.selectedReportId();
      return id ? reports.find(r => r.reportId === id) : null;
    }),
  }))
); 