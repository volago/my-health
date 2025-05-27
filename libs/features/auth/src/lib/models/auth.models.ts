import { Sex, DetailLevel } from '@my-health/domain'; // Assuming these enums are exported from domain lib

export interface AuthCredentials {
  identifier: string; // Używany jako email w Firebase Auth
  password?: string; 
}

export interface UserRegistrationProfileData {
  birthYear: number;
  sex: Sex;
  detailLevel: DetailLevel;
}

export interface UserRegistrationData extends AuthCredentials {
  identifier: string; 
  password_DO_USUNIECIA_PO_REFAKTORZE_TYMCZASOWE: string; 
  profile: UserRegistrationProfileData;
} 