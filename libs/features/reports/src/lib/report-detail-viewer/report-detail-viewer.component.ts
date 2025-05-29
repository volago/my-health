import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common'; // Dla @if w szablonie standalone

@Component({
  selector: 'lib-report-detail-viewer',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './report-detail-viewer.component.html',
  styleUrl: './report-detail-viewer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportDetailViewerComponent {
  reportHtmlContent = input<SafeHtml | null>(null);
  isLoading = input<boolean>(false);
  error = input<string | null>(null);
  closeViewer = output<void>();

  onCloseClick(): void {
    this.closeViewer.emit();
  }
} 