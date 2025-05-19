import { ParameterTemplate } from './parameter-template.model';

export const TEST_TAGS = [
  'hematologia',
  'biochemia',
  'hormonalne',
  'metaboliczne',
  'zapalne',
  'nerkowe',
  'wątrobowe',
  'kardiologiczne',
  'moczowe',
  'kostne'
] as const;

export type TestTag = typeof TEST_TAGS[number];

export interface TestCatalog {
  testId: string;
  icdCode: string;
  name: string;
  description: string;
  tags: TestTag[];
  parametersTemplate: ParameterTemplate[];
} 