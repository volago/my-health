import { Sex } from './enums/sex';
import { DetailLevel } from './enums/detail-level';

export interface UserProfile {
  userId: string;
  createdAt: Date;
  lastLogin: Date;
  birthYear: number;
  sex: Sex;
  detailLevel: DetailLevel;
} 