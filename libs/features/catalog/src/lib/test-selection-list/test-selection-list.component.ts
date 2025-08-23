import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectionListChange } from '@angular/material/list';
import { Test } from '@my-health/domain';

@Component({
  selector: 'my-health-test-selection-list',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatChipsModule,
    MatIconModule
  ],
  templateUrl: './test-selection-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestSelectionListComponent {
  /**
   * List of tests to display for selection
   */
  tests = input.required<Test[]>();

  /**
   * List of currently selected test IDs
   */
  selectedTestIds = input<string[]>([]);

  /**
   * Event emitted when test selection changes
   */
  selectionChange = output<string[]>();

  /**
   * Handles selection change from mat-selection-list
   */
  onSelectionChange(event: MatSelectionListChange): void {
    const selectedValues = event.source.selectedOptions.selected.map(option => option.value);
    this.selectionChange.emit(selectedValues);
  }

  /**
   * Checks if a test is currently selected
   */
  isTestSelected(testId: string): boolean {
    return this.selectedTestIds().includes(testId);
  }

  /**
   * Gets formatted parameters preview for a test
   */
  getParametersPreview(test: Test): string {
    const firstThree = test.parameters.slice(0, 3).map(p => p.paramName || 'Nieznany parametr');
    const preview = firstThree.join(', ');
    
    if (test.parameters.length > 3) {
      return `${preview} i ${test.parameters.length - 3} więcej`;
    }
    
    return preview;
  }
}
