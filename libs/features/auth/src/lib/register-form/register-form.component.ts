import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule } from '@angular/router'; // For navigation to login page

// import { AuthService } from '../services/auth.service'; // Will be created later
// import { UserProfileData, UserRegistrationData } from '../models'; // Will be created later

interface RegisterFormControls {
  password: FormControl<string>;
  confirmPassword: FormControl<string>;
  yearOfBirth: FormControl<number | null>;
  gender: FormControl<string>;
  detailPackage: FormControl<string>;
}

// Custom Validator for password match
export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): { [key: string]: boolean } | null => {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  if (password && confirmPassword && password.value !== confirmPassword.value) {
    return { 'passwordMismatch': true };
  }
  return null;
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
  ],
  templateUrl: './register-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  // private readonly authService = inject(AuthService); // Will be used later

  // Signal for the generated identifier
  generatedIdentifier = signal<string>('');
  readonly currentYear = new Date().getFullYear(); // Moved here

  registerForm: FormGroup<RegisterFormControls>;

  constructor() {
    this.registerForm = this.fb.group({
      password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(6)] }),
      confirmPassword: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      yearOfBirth: new FormControl<number | null>(null, [Validators.required, Validators.min(1900), Validators.max(this.currentYear)]),
      gender: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      detailPackage: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    }, { validators: passwordMatchValidator });
  }

  // isLoading = this.authService.isLoading; // Will be used later
  // authError = this.authService.error; // Will be used later

  // TODO: Get these from a configuration or a shared place
  readonly genders = [{value: 'female', viewValue: 'Kobieta'}, {value: 'male', viewValue: 'Mężczyzna'}];
  readonly detailPackages = [{value: 'basic', viewValue: 'Podstawowy'}, {value: 'recommended', viewValue: 'Zalecany'}, {value: 'detailed', viewValue: 'Szczegółowy'}];

  ngOnInit(): void {
    this.generateNewIdentifier();
  }

  generateNewIdentifier(): void {
    // this.generatedIdentifier.set(this.authService.generateUserIdentifier());
    // Placeholder until AuthService is implemented:
    const adj = ['happy', 'silly', 'lucky', 'clever', 'brave', 'fast', 'shiny', 'wise'];
    const nouns = ['cat', 'dog', 'fox', 'bear', 'lion', 'bird', 'fish', 'wolf'];
    const randomAdj = adj[Math.floor(Math.random() * adj.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNumber = Math.floor(Math.random() * 1000);
    this.generatedIdentifier.set(`${randomAdj}-${randomNoun}-${randomNumber}`);
    console.log('New identifier generated:', this.generatedIdentifier());
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched(); // Mark all fields as touched to display errors
      return;
    }

    const formValue = this.registerForm.getRawValue();
    const identifierWithDomain = `${this.generatedIdentifier()}@my-health.com`;

    // const registrationData: UserRegistrationData = {
    //   identifier: identifierWithDomain,
    //   password_DO_USUNIECIA_PO_REFAKTORZE_TYMCZASOWE: formValue.password,
    //   profile: {
    //     yearOfBirth: formValue.yearOfBirth as number,
    //     gender: formValue.gender as UserProfileData['gender'],
    //     detailPackage: formValue.detailPackage as UserProfileData['detailPackage'],
    //   }
    // };
    // this.authService.register(registrationData);
    console.log('Register form submitted. Identifier with domain:', identifierWithDomain, 'Form value:', formValue);
  }
} 