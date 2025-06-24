import { ValueType } from './enums/value-type';

export interface ParameterTemplate {
  id: string;
  paramName: string;
  description: string;
  icdCode: string;
  unit: string;
  valueType: ValueType;
  allowedValues?: any[];
  validation?: {
    min?: number;
    max?: number;
    normalValues?: any[];
  };
} 