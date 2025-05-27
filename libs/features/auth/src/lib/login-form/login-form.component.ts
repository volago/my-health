import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router'; // For navigation to register page

// import { AuthService } from '../services/auth.service'; // Will be created later

interface LoginForm {
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
  ],
  templateUrl: './login-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginFormComponent {
  private readonly fb = inject(FormBuilder);
  // private readonly authService = inject(AuthService); // Will be used later

  loginForm = this.fb.group({
    identifier: ['', [Validators.required]], // Removed Validators.email
    password: ['', [Validators.required]],
  });

  // isLoading = this.authService.isLoading; // Will be used later
  // authError = this.authService.error; // Will be used later

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }
    const formValue = this.loginForm.getRawValue() as LoginForm;
    const credentials = {
      identifier: `${formValue.identifier}@my-health.com`,
      password: formValue.password
    };
    // this.authService.login(credentials);
    console.log('Login form submitted with modified identifier:', credentials);
  }
} 