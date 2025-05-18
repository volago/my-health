export interface TestResult {
  resultId: string;
  testId: string;
  createdAt: Date;
  parameters: { [paramName: string]: number | string | boolean };
} 