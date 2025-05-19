import { Sex } from './enums/sex';
import { DetailLevel } from './enums/detail-level';

export type AgeRange = '18-39' | '40-59' | '60+';

export interface TestFrequency {
  testId: string;
  frequencyMonths: number;
}

export type ScheduleRecommendations = {
  [sex in Sex]: {
    [age in AgeRange]: {
      [level in DetailLevel]: TestFrequency[];
    };
  };
}; 