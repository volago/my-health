import { ValueType } from './enums/value-type';

export interface ParameterTemplate {
  id: string;
  paramName: string;
  description: string;
  icdCode: string;
  unit: string;
  valueType: ValueType;
  validation?: {
    min?: number;
    max?: number;
    allowedValues?: any[];
  };
} 