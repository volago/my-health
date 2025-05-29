import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { DisplayReport, ReportStatus } from '../models/report.models';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lib-report-list',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './report-list.component.html',
  styleUrl: './report-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportListComponent {
  reports = input.required<DisplayReport[]>();
  reportSelected = output<string>(); // Emituje reportId

  onReportClick(reportId: string): void {
    this.reportSelected.emit(reportId);
  }

  // Funkcja pomocnicza do określania koloru chipa na podstawie statusu
  getChipColor(status: ReportStatus): string | undefined {
    switch (status) {
      case 'success':
        return 'primary';
      case 'error':
        return 'warn';
      case 'processing':
      case 'to-process':
        return undefined; // Domyślny kolor chipa (neutralny)
      default:
        return undefined;
    }
  }

  // Funkcja pomocnicza do określania ikony na podstawie statusu
  getReportIcon(status: ReportStatus): string {
    switch (status) {
      case 'success': return 'check_circle';
      case 'error': return 'error';
      case 'processing': return 'sync'; // Lub użyjemy spinnera bezpośrednio w szablonie
      case 'to-process': return 'hourglass_empty';
      default: return 'help_outline';
    }
  }

  // Funkcja pomocnicza do określania koloru ikony na podstawie statusu (jeśli konieczne)
  getIconColor(status: ReportStatus): string | undefined {
    switch (status) {
      case 'success':
        return 'primary';
      case 'error':
        return 'warn';
      // Dla processing i to-process kolor może być domyślny lub specyficzny
      default:
        return undefined; // Domyślny kolor ikony (zazwyczaj dziedziczony lub czarny/biały)
    }
  }
} 