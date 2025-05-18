import { ParameterTemplate } from './parameter-template.model';

export interface TestCatalog {
  testId: string;
  name: string;
  description: string;
  tags: string[];
  parametersTemplate: ParameterTemplate[];
} 