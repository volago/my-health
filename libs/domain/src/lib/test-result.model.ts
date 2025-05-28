export interface TestResultParameter {
  paramId: string;
  value: number | string | boolean;
}

export interface TestResult {
  resultId: string;
  testId: string;
  createdAt: Date;
  parameters: TestResultParameter[];
} 