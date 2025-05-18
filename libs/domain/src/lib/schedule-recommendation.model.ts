import { Sex } from './enums/sex';
import { DetailLevel } from './enums/detail-level';

export interface ScheduleRecommendation {
  recommendationId: string;
  testId: string;
  sex: Sex;
  age: number;
  detailLevel: DetailLevel;
} 