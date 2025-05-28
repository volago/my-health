import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; // Dla @if, @for, async pipe etc.
import { DashboardStore } from './dashboard.store';
import { ScoreCardComponent } from './components/score-card/score-card.component';
import { RecentTestResultsListComponent } from './components/recent-test-results-list/recent-test-results-list.component';
import { UpcomingTestsSummaryComponent } from './components/upcoming-tests-summary/upcoming-tests-summary.component';
// Importy dla komponentów dzieci (zostaną utworzone później)
// import { ScoreCardComponent } from './components/score-card/score-card.component';
// import { RecentTestResultsListComponent } from './components/recent-test-results-list/recent-test-results-list.component';
// import { UpcomingTestsSummaryComponent } from './components/upcoming-tests-summary/upcoming-tests-summary.component';

@Component({
  selector: 'lib-dashboard-view',
  standalone: true,
  imports: [
    CommonModule,
    ScoreCardComponent,
    RecentTestResultsListComponent,
    UpcomingTestsSummaryComponent
  ],
  templateUrl: './dashboard-view.component.html',
  // styleUrls: ['./dashboard-view.component.scss'] // Jeśli potrzebne
})
export class DashboardViewComponent {
  readonly store = inject(DashboardStore);

  constructor() {
    // Logika inicjalizacyjna, jeśli potrzebna, chociaż store.onInit() już działa
    // console.log('DashboardViewComponent initialized');
    // console.log('Initial Health Score:', this.store.healthScoreMockComputed());
  }
} 