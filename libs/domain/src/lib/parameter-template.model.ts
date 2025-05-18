import { ValueType } from './enums/value-type';

export interface ParameterTemplate {
  paramName: string;
  icdCode: string;
  unit: string;
  valueType: ValueType;
  validation?: {
    min?: number;
    max?: number;
    allowedValues?: any[];
  };
} 