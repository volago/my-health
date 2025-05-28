import { computed, inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState, withHooks, withComputed } from '@ngrx/signals';
import { TestResultsService } from '@my-health/domain';
import { AuthService } from '@my-health/features/auth';
import { DashboardState, initialState, TestResultItemData, ScoreCardData, UpcomingTestMockData } from './dashboard.models';
import { TestResult } from '@my-health/domain';

export const DashboardStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((state) => ({
    recentTestResultsForView: computed(() => state.recentTestResults()),
    healthScoreMockComputed: computed(() => state.healthScoreMock()),
    complianceScoreMockComputed: computed(() => state.complianceScoreMock()),
    upcomingTestsMockComputed: computed(() => state.upcomingTestsMock()),
    isLoadingResultsComputed: computed(() => state.isLoadingResults()),
    resultsErrorComputed: computed(() => state.resultsError()),
  })),
  withMethods((store, testResultsService = inject(TestResultsService), authService = inject(AuthService)) => ({
    async loadRecentTestResults(): Promise<void> {
      const currentUser = authService.currentUser();
      const userId = currentUser?.uid;

      if (!userId) {
        patchState(store, { recentTestResults: [], resultsError: 'Użytkownik nie jest uwierzytelniony.', isLoadingResults: false });
        return;
      }

      patchState(store, { isLoadingResults: true, resultsError: null });
      try {
        const domainResults: TestResult[] = await testResultsService.fetchRecentResults(userId, 5);
        const viewData: TestResultItemData[] = domainResults.map(r => {
          const summary = r.parameters.map(p => {
            if (r.parameters.length === 1 && p.paramId === r.testId) {
              return `${p.value}`;
            }
            return `${p.paramId}: ${p.value}`;
          }).join(', ');

          return {
            id: r.resultId,
            testIdentifier: r.testId,
            date: new Date(r.createdAt).toISOString().split('T')[0],
            resultsSummary: summary
          };
        });
        patchState(store, { recentTestResults: viewData, isLoadingResults: false });
      } catch (error) {
        console.error('Błąd podczas ładowania ostatnich wyników badań:', error);
        patchState(store, { resultsError: error, isLoadingResults: false, recentTestResults: [] });
      }
    },
    initializeMockData(): void {
      const hsMock: ScoreCardData = { title: 'Health Score', value: 85, displayValue: '85%', color: this.determineScoreColor(85) };
      const csMock: ScoreCardData = { title: 'Compliance Score', value: 92, displayValue: '92%', color: this.determineScoreColor(92) };
      const upcomingMock: UpcomingTestMockData[] = [
          { testName: 'Badanie krwi', date: '2026-08-15'},
          { testName: 'Kontrola dentystyczna', date: '2026-09-01'},
      ];
      patchState(store, {
          healthScoreMock: hsMock,
          complianceScoreMock: csMock,
          upcomingTestsMock: upcomingMock,
      });
    },
    determineScoreColor(value: number): 'green' | 'yellow' | 'red' | 'grey' {
      if (value === 0 && store.healthScoreMock().value === 0 && store.complianceScoreMock().value === 0) return 'grey';
      if (value >= 90) return 'green';
      if (value >= 70) return 'yellow';
      if (value > 0 && value < 70) return 'red';
      return 'grey';
    }
  })),
  withHooks({
      onInit(store) {
          store.initializeMockData();
          store.loadRecentTestResults();
      }
  })
); 