export interface ScoreCardData {
  title: string;
  value: number;
  displayValue: string;
  color: 'green' | 'yellow' | 'red' | 'grey';
}

export interface TestResultItemData {
  id: string;          // z TestResult.resultId
  testIdentifier: string; // z TestResult.testId (docelowo nazwa badania)
  date: string;        // sformatowana TestResult.createdAt
}

export interface UpcomingTestMockData {
  testName: string;
  date: string;
}

export interface DashboardState {
  recentTestResults: TestResultItemData[] | null;
  isLoadingResults: boolean;
  resultsError: any | null;
  healthScoreMock: ScoreCardData;
  complianceScoreMock: ScoreCardData;
  upcomingTestsMock: UpcomingTestMockData[];
}

export const initialState: DashboardState = {
  recentTestResults: null,
  isLoadingResults: false,
  resultsError: null,
  healthScoreMock: { title: 'Health Score', value: 0, displayValue: '0%', color: 'grey' },
  complianceScoreMock: { title: 'Compliance Score', value: 0, displayValue: '0%', color: 'grey' },
  upcomingTestsMock: [],
}; 