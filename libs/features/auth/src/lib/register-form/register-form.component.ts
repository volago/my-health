import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule } from '@angular/router'; // For navigation to login page
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService } from '../services/auth.service';
import { UserRegistrationData } from '../models/auth.models'; // UserRegistrationProfileData is implicitly used via UserRegistrationData
import { Sex, DetailLevel } from '@my-health/domain';

// import { AuthService } from '../services/auth.service'; // Will be created later
// import { UserProfileData, UserRegistrationData } from '../models'; // Will be created later

// Define the shape of the form controls for strong typing
interface RegisterFormControls {
  password: FormControl<string>;
  confirmPassword: FormControl<string>;
  yearOfBirth: FormControl<number | null>;
  gender: FormControl<Sex | null>; // Allow null for initial empty state if needed, or ensure default value
  detailPackage: FormControl<DetailLevel | null>; // Allow null for initial empty state
}

// Custom Validator for password match
export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): { [key: string]: boolean } | null => {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  // console.log('PasswordMatchValidator executing:', password?.value, confirmPassword?.value);

  // Jeśli kontrolki nie istnieją, nie rób nic (defensywne programowanie)
  if (!password || !confirmPassword) {
    return null;
  }

  // Jeśli hasła są różne
  if (password.value !== confirmPassword.value) {
    // console.log('PasswordMismatch: true on confirmPassword');
    confirmPassword.setErrors({ ...(confirmPassword.errors || {}), 'passwordMismatch': true });
    return { 'passwordMismatchGlobal': true }; // Zwracamy globalny błąd dla formy, jeśli potrzebne
  } else {
    // Jeśli hasła są zgodne, usuń błąd passwordMismatch z confirmPassword, jeśli istnieje
    const errors = { ...confirmPassword.errors };
    if (errors['passwordMismatch']) {
      delete errors['passwordMismatch'];
      // console.log('PasswordMismatch: false, clearing error from confirmPassword');
      confirmPassword.setErrors(Object.keys(errors).length > 0 ? errors : null);
    }
    return null; // Brak globalnego błędu dla formy
  }
};

@Component({
  selector: 'lib-register-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    RouterModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './register-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  // Signal for the generated identifier
  generatedIdentifier = signal<string>('');
  readonly currentYear = new Date().getFullYear(); // Moved here

  // Explicitly type the FormGroup with the interface
  registerForm: FormGroup<RegisterFormControls>;

  constructor() {
    this.registerForm = this.fb.group({
      password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(6)] }),
      confirmPassword: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      yearOfBirth: new FormControl<number | null>(null, [Validators.required, Validators.min(1900), Validators.max(this.currentYear)]),
      gender: new FormControl<Sex | null>(null, [Validators.required]), // Initialize with null, or a default Sex value
      detailPackage: new FormControl<DetailLevel | null>(null, [Validators.required]), // Initialize with null or default
    } as RegisterFormControls, { validators: passwordMatchValidator });
  }

  readonly isLoading = this.authService.isLoading;
  readonly authError = this.authService.error;

  // TODO: Get these from a configuration or a shared place
  readonly genders: {value: Sex, viewValue: string}[] = [
    {value: 'female' as Sex, viewValue: 'Kobieta'},
    {value: 'male' as Sex, viewValue: 'Mężczyzna'}
  ];
  readonly detailPackages: {value: DetailLevel, viewValue: string}[] = [
    {value: 'basic' as DetailLevel, viewValue: 'Podstawowy'},
    {value: 'recommended' as DetailLevel, viewValue: 'Zalecany'},
    {value: 'detailed' as DetailLevel, viewValue: 'Szczegółowy'}
  ];

  ngOnInit(): void {
    this.generateNewIdentifier();
  }

  generateNewIdentifier(): void {
    this.generatedIdentifier.set(this.authService.generateUserIdentifier());
  }

  async onSubmit(): Promise<void> {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched(); // Mark all fields as touched to display errors
      return;
    }

    const formValue = this.registerForm.getRawValue();
    const identifierWithDomain = `${this.generatedIdentifier()}@my-health.com`;

    if (formValue.yearOfBirth === null || formValue.gender === null || formValue.detailPackage === null) {
        console.error('Form has null values where enums are expected');
        this.authService.error.set('Proszę wypełnić wszystkie pola.');
        return;
    }

    const registrationData: UserRegistrationData = {
      identifier: identifierWithDomain,
      password_DO_USUNIECIA_PO_REFAKTORZE_TYMCZASOWE: formValue.password,
      profile: {
        birthYear: formValue.yearOfBirth, 
        sex: formValue.gender as Sex, 
        detailLevel: formValue.detailPackage as DetailLevel, 
      }
    };
    
    try {
      await this.authService.register(registrationData);
      // Navigation is handled by AuthService
    } catch (error) {
      // Error is set in AuthService
      console.error('Register component error:', error);
    }
  }
} 