// src/app/component/admin/admin-login/admin-login.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../service/auth.service';
import { AuthRequest } from '../../../model/auth-request.model';
import { AuthResponse } from '../../../model/auth-response.model';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-login.html',
  styleUrls: ['./admin-login.css']
})
export class AdminLogin {
  username: string = '';
  password: string = '';
  isLoading = false;
  message = '';
  isError = false;

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  onLogin() {
    // Clear previous messages
    this.message = '';
    this.isError = false;

    // Local guard: prevents empty API calls and gives immediate feedback.
    if (!this.username || !this.password) {
      this.isError = true;
      this.message = 'Please enter username and password.';
      return;
    }

    this.isLoading = true;
    const payload: AuthRequest = { username: this.username, password: this.password };

    this.auth.login(payload).subscribe({
      next: (res: AuthResponse) => {
        this.isLoading = false;

        // normalize role and check admin access
        const roleRaw = (res.role ?? '').toString().toUpperCase();
        const normalizedRole = roleRaw.startsWith('ROLE_') ? roleRaw : `ROLE_${roleRaw}`;

        if (normalizedRole === 'ROLE_ADMIN') {
          if (res.token) this.auth.saveToken(res.token);
          this.auth.saveUserInfo(res.username ?? this.username, normalizedRole);

          this.message = 'Login successful — redirecting...';
          this.isError = false;

          // short delay for UX, then navigate to admin dashboard
          setTimeout(() => {
            // use navigateByUrl to go to admin dashboard
            this.router.navigateByUrl('/admin/dashboard');
          }, 300);
        } else {
          this.isError = true;
          this.message = 'Access denied — admin only.';
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        this.isError = true;

        if (err?.error?.message) {
          this.message = err.error.message;
        } else if (err?.status === 401) {
          this.message = 'Invalid credentials.';
        } else {
          this.message = 'Login failed. Please try again later.';
        }
      }
    });
  }
}
