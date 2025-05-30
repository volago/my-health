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

@Component({
  selector: 'lib-reports-page',
  standalone: true,
  imports: [
    ReportListComponent,
    ReportDetailViewerComponent,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
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

  private readonly routeParamReportId = toSignal(
    this.route.params.pipe(map(params => params['reportId'] || null)),
    { initialValue: null } 
  );

  reports = this.reportStore.reports;
  selectedReport = this.reportStore.selectedReport;
  isLoadingList = this.reportStore.isLoadingList;
  listError = this.reportStore.listError;
  isLoadingDetail = this.reportStore.isLoadingDetail;
  detailError = this.reportStore.detailError;
  selectedReportHtml = this.reportStore.selectedReportHtml;

  constructor() {
    effect(() => {
      const reportIdFromSignal = this.routeParamReportId(); 
      this.reportStore.selectReport(reportIdFromSignal);
    });
  }

  handleReportSelected(reportId: string): void {
    this.router.navigate(['/reports', reportId]);
    this.reportStore.selectReport(reportId);
  }

  handleCloseViewer(): void {
    this.router.navigate(['/reports']);
  }

  async createNewReport(): Promise<void> {
    const newReportId = await this.reportStore.createReportRequest('Nowy Raport (automatyczny)');
    if (newReportId) {
      this.router.navigate(['/reports', newReportId]);
    }
  }
} 