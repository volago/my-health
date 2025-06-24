import { TestParameter } from './test-parameter.model';

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

export interface Test {
  id: string;
  icdCode: string;
  name: string;
  description: string;
  tags: TestTag[];
  parameters: TestParameter[];
} 