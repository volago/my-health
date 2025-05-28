import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { TestResultItemData } from '../../dashboard.models';
// Import dla TestResultItemComponent (zostanie utworzony później)
import { TestResultItemComponent } from '../test-result-item/test-result-item.component';

@Component({
  selector: 'lib-recent-test-results-list',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatCardModule,
    // TestResultItemComponent // Odkomentuj, gdy komponent będzie gotowy
    TestResultItemComponent
  ],
  templateUrl: './recent-test-results-list.component.html',
  styleUrls: ['./recent-test-results-list.component.scss']
})
export class RecentTestResultsListComponent {
  results = input<TestResultItemData[] | null>(null);
  isLoading = input<boolean>(false);
  error = input<any | null>(null);
} 