import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../service/auth';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css']
})
export class ForgotPasswordComponent {
  email: string = '';
  message: string = '';
  isError: boolean = false;
  isLoading: boolean = false;

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit() {
    this.message = '';
    this.isError = false;

    if (!this.email || !this.email.includes('@')) {
      this.isError = true;
      this.message = '⚠️ Please enter a valid email address.';
      return;
    }

    this.isLoading = true;

    // Call backend to create reset token
    this.auth.forgot(this.email.trim()).subscribe({
      next: (res) => {
        this.isLoading = false;

        // Backend may return:
        // 1) plain string: "Reset token (dev): <token>"
        // 2) JSON: { token: "<token>" } or similar
        let token: string | null = null;

        if (typeof res === 'string') {
          // try to extract token after the last space or after colon
          // match UUID-like token or any long token
          const m = res.match(/([A-Za-z0-9\-]{8,})$/);
          if (m && m[1]) token = m[1];
          else {
            const colonIdx = res.lastIndexOf(':');
            if (colonIdx !== -1) token = res.substring(colonIdx + 1).trim();
          }
        } else if (res && typeof res === 'object') {
          // try common shapes
          if ((res as any).token) token = (res as any).token;
          else if ((res as any).data && (res as any).data.token) token = (res as any).data.token;
          else {
            // stringified object fallback
            const str = JSON.stringify(res);
            const m = str.match(/([A-Za-z0-9\-]{8,})/);
            if (m && m[1]) token = m[1];
          }
        }

        if (token) {
          // Automatically navigate to reset-password with token in query params
          this.message = '✅ Reset token generated. Redirecting to password reset...';
          // small delay so user sees message (optional)
          setTimeout(() => {
            this.router.navigate(['/reset-password'], { queryParams: { token } });
          }, 700);
        } else {
          // Token not found in response: show response so developer can debug
          this.message = 'Reset request processed. (Dev) Response: ' + (typeof res === 'string' ? res : JSON.stringify(res));
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Forgot password error', err);
        this.isError = true;
        // show backend message if available
        this.message = err?.error || 'Failed to request reset link. Try again later.';
      }
    });
  }
}
