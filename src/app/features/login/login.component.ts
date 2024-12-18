import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private cookieService: CookieService
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.email]], // Still using email validator
      password: ['', [Validators.required]],
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      // Create the payload with username instead of email
      const payload = {
        username: this.loginForm.value.username, // Send as username to match DTO
        password: this.loginForm.value.password,
      };

      this.apiService.post('/api/auth/authenticate', payload).subscribe({
        next: (response: any) => {
          // Save token in cookie
          this.cookieService.set('token', response.access_token);
          // Navigate to dashboard or home
          this.router.navigate(['/pharmacy']);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error
            ? JSON.stringify(error.error)
            : 'Login failed. Please try again.';
        },
        complete: () => {
          this.isLoading = false;
        },
      });
    } else {
      Object.keys(this.loginForm.controls).forEach((key) => {
        const control = this.loginForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }
}
