// src/app/component/auth/forgot-password/forgot-password.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../service/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css']
})
export class ForgotPasswordComponent {
  username = '';
  newPassword = '';
  confirmPassword = '';

  isLoading = false;
  message = '';
  isError = false;

  constructor(private auth: AuthService, private router: Router) {}

  submit() {
    // quick guard to ensure submit is fired
    console.log('submit() called', { username: this.username, newPassword: !!this.newPassword, confirmPassword: !!this.confirmPassword });

    this.isError = false;
    this.message = '';

    const uname = (this.username || '').trim();
    if (!uname) {
      this.isError = true;
      this.message = 'Please enter your username.';
      return;
    }

    if (!this.newPassword || !this.confirmPassword) {
      this.isError = true;
      this.message = 'Enter and confirm the new password.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.isError = true;
      this.message = 'Passwords do not match.';
      return;
    }

    if (this.newPassword.length < 6) {
      this.isError = true;
      this.message = 'Password must be at least 6 characters long.';
      return;
    }

    const payload = {
      username: uname,
      newPassword: this.newPassword
    };

    this.isLoading = true;

    // debug: print payload
    console.log('Calling API with payload:', payload);

    this.auth.forgotPasswordByUsername(payload).subscribe({
      next: (res: any) => {
        console.log('forgot-password success', res);
        this.isLoading = false;
        this.isError = false;
        this.message = res?.message ?? 'Password updated successfully!';
        // redirect after short delay
        setTimeout(() => this.router.navigate(['/sign-in']), 1000);
      },
      error: (err) => {
        console.error('forgot-password error', err);
        this.isLoading = false;
        this.isError = true;
        this.message =
          err?.error?.message ??
          err?.message ??
          'Failed to update password.';
      }
    });
  }

  goToSignIn() {
    this.router.navigate(['/sign-in']);
  }
}
