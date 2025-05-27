import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router'; // For navigation to register page
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // Import for spinner

import { AuthService } from '../services/auth.service'; 

interface LoginFormValues {
  identifier: string;
  password: string;
}

@Component({
  selector: 'lib-login-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    MatProgressSpinnerModule, // Add to imports
  ],
  templateUrl: './login-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService); 

  loginForm = this.fb.group({
    identifier: ['', [Validators.required]], // Removed Validators.email
    password: ['', [Validators.required]],
  });

  readonly isLoading = this.authService.isLoading;
  readonly authError = this.authService.error; 

  async onSubmit(): Promise<void> {
    console.log('LoginFormComponent: onSubmit called');
    console.log('LoginFormComponent: loginForm.invalid:', this.loginForm.invalid);
    console.log('LoginFormComponent: isLoading():', this.isLoading());

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      console.log('LoginFormComponent: Form is invalid, returning.');
      return;
    }
    const formValue = this.loginForm.getRawValue() as LoginFormValues;
    const credentials = {
      identifier: `${formValue.identifier}@my-health.com`,
      password: formValue.password
    };
    
    try {
      await this.authService.login(credentials);
      // Navigation is handled by AuthService upon successful login
    } catch (error) {
      // Error is set in AuthService, no need to set it here unless specific component handling is needed
      // Form remains as is for user to correct
      console.error('Login component error:', error); // Optional: log for component-specific debugging
    }
  }
} 