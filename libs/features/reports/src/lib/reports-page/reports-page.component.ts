import { Component, inject, ChangeDetectionStrategy, signal, effect } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { ReportSignalStore } from '../store/report.store';
import { ReportListComponent } from '../report-list/report-list.component';
import { ReportDetailViewerComponent } from '../report-detail-viewer/report-detail-viewer.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lib-reports-page',
  standalone: true,
  imports: [
    CommonModule,
    ReportListComponent,
    ReportDetailViewerComponent,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatDialogModule
  ],
  templateUrl: './reports-page.component.html',
  styleUrl: './reports-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportsPageComponent {
  private readonly reportStore = inject(ReportSignalStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly breakpointObserver = inject(BreakpointObserver);

  @ViewChild('reportDetailDialogContent') reportDetailDialogContent?: TemplateRef<any>;

  private readonly routeParamReportId = toSignal(
    this.route.params.pipe(map(params => params['reportId'] || null)),
    { initialValue: null } 
  );

  isMobile = toSignal(
    this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small])
    .pipe(map(result => result.matches)), 
    {initialValue: false}
  );

  reports = this.reportStore.reports;
  selectedReport = this.reportStore.selectedReport;
  isLoadingList = this.reportStore.isLoadingList;
  listError = this.reportStore.listError;
  isLoadingDetail = this.reportStore.isLoadingDetail;
  detailError = this.reportStore.detailError;
  selectedReportHtml = this.reportStore.selectedReportHtml;
  
  private dialogRef: MatDialogRef<any> | null = null;

  constructor() {
    effect(() => {
      const reportIdFromSignal = this.routeParamReportId(); 
      // Wczytanie danych raportu do store JEST już w handleReportSelected,
      // ale ten effect może być potrzebny, jeśli użytkownik wejdzie na URL z ID bezpośrednio
      // lub odświeży stronę. Alternatywnie, selectReport może być wywoływane tylko tutaj.
      // Na razie zostawiam selectReport tutaj, ale trzeba to przemyśleć czy nie ma podwójnego wywołania.
      // Główna rola tego efektu teraz to zamknięcie dialogu, jeśli URL się zmieni na /reports
      this.reportStore.selectReport(reportIdFromSignal);

      if (!reportIdFromSignal && this.dialogRef) {
        this.dialogRef.close();
        this.dialogRef = null;
      }
    });
  }

  handleReportSelected(reportId: string): void {
    this.router.navigate(['/reports', reportId]);
    this.reportStore.selectReport(reportId); // Kluczowe: ładuje dane do store

    if (this.isMobile() && this.reportDetailDialogContent) {
      if (this.dialogRef) { // Close existing dialog before opening a new one for a different report
        this.dialogRef.close();
        this.dialogRef = null;
      }
      this.dialogRef = this.dialog.open(this.reportDetailDialogContent, {
        width: '100vw',
        height: '100vh',
        maxWidth: '100vw',
        panelClass: 'full-screen-dialog' 
      });
      this.dialogRef.afterClosed().subscribe(() => {
        this.dialogRef = null; 
        // Jeśli dialog został zamknięty (np. Escape) a URL nadal ma ID, nawiguj do /reports
        if (this.routeParamReportId() !== null) { 
             this.router.navigate(['/reports']);
        }
      });
    }
  }

  // Dla widoku desktop - zamyka panel po prawej (nawigując)
  handleCloseViewer(): void {
    this.router.navigate(['/reports']); 
  }

  // Dla widoku mobile - zamyka dialog i nawiguje
  handleCloseDialogAndNavigate(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
      this.dialogRef = null; // Upewnij się, że jest resetowane
    }
    this.router.navigate(['/reports']);
  }

  async createNewReport(): Promise<void> {
    const newReportId = await this.reportStore.createReportRequest('Nowy Raport (automatyczny)');
    if (newReportId) {
      this.router.navigate(['/reports', newReportId]);
      // Na mobilnych, po utworzeniu, handleReportSelected (przez nawigację i effect) powinno otworzyć dialog
    }
  }
} 