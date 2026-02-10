import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.css',
})
export class SignUp {
  isLoginMode = true;

  // Form Data
  loginData = {
    email: '',
    password: ''
  };

  signupData = {
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  message: string | null = null;
  messageType: 'success' | 'error' | null = null;
  isLoading = false;

  constructor(private authService: AuthService, private router: Router) { }

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.message = null; // Clear message on toggle
    this.messageType = null;
  }

  onSubmit() {
    if (this.isLoading) return;

    this.message = null;
    this.messageType = null;
    this.isLoading = true;

    if (this.isLoginMode) {
      this.authService.login(this.loginData.email, this.loginData.password).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/home']);
        },
        error: (err) => {
          console.error(err);
          this.isLoading = false;
          this.message = 'Login failed! Please check your credentials.';
          this.messageType = 'error';
        }
      });
    } else {
      if (this.signupData.password !== this.signupData.confirmPassword) {
        this.isLoading = false;
        this.message = 'Passwords do not match!';
        this.messageType = 'error';
        return;
      }

      this.authService.signup(this.signupData.username, this.signupData.email, this.signupData.password).subscribe({
        next: (res: any) => {
          console.log('Registro exitoso', res);
          this.isLoading = false;
          this.message = 'Account created successfully!';
          this.messageType = 'success';
          // Optionally redirect after a delay or clear form
          this.signupData = { username: '', email: '', password: '', confirmPassword: '' };
        },
        error: (err: any) => {
          console.error('Error en registro', err);
          this.isLoading = false;
          this.message = 'Error creating account. Please try again.';
          this.messageType = 'error';
        }
      });
    }
  }
}
