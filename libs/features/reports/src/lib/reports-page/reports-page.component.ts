import { Component, inject, ChangeDetectionStrategy, signal, effect } from '@angular/core';
import { ReportSignalStore } from '../store/report.store';
import { ReportListComponent } from '../report-list/report-list.component';
import { ReportDetailViewerComponent } from '../report-detail-viewer/report-detail-viewer.component';
import { MatSidenavModule } from '@angular/material/sidenav'; // Dla MatDrawer
import { MatButtonModule } from '@angular/material/button'; // Dla MatFab
import { MatIconModule } from '@angular/material/icon'; // Dla ikony w MatFab
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // Dodano import
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'lib-reports-page',
  standalone: true,
  imports: [
    ReportListComponent,
    ReportDetailViewerComponent,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule, // Dodano do imports
    MatCardModule
  ],
  templateUrl: './reports-page.component.html',
  styleUrl: './reports-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportsPageComponent {
  private readonly reportStore = inject(ReportSignalStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  reports = this.reportStore.reports;
  selectedReport = this.reportStore.selectedReport;
  isLoadingList = this.reportStore.isLoadingList;
  listError = this.reportStore.listError;
  isLoadingDetail = this.reportStore.isLoadingDetail;
  detailError = this.reportStore.detailError;
  selectedReportHtml = this.reportStore.selectedReportHtml;

  isDrawerOpen = signal(false);

  constructor() {
    effect(() => {
      const reportId = this.route.snapshot.paramMap.get('reportId');
      this.reportStore.selectReport(reportId);
      this.isDrawerOpen.set(!!reportId);
    });
  }

  handleReportSelected(reportId: string): void {
    this.router.navigate(['/reports', reportId]);
  }

  handleCloseViewer(): void {
    this.isDrawerOpen.set(false);
    this.router.navigate(['/reports']);
  }

  async createNewReport(): Promise<void> {
    // TODO: Dodać logikę pytania o tytuł, jeśli potrzebne
    const newReportId = await this.reportStore.createReportRequest('Nowy Raport (automatyczny)');
    if (newReportId) {
      this.router.navigate(['/reports', newReportId]);
    }
  }
} 