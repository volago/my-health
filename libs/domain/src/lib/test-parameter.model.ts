import { DetailLevel, ValueType } from './enums';

export interface TestParameter {
  id?: string;
  paramName?: string;
  description?: string;
  icdCode?: string;
  unit: string;
  valueType: ValueType;
  allowedValues?: any[];
  validation?: {
    min?: number;
    max?: number;
    normalValues?: any[];
  };
} 