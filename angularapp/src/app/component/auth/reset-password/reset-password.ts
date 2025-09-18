import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../../service/auth';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.css']
})
export class ResetPasswordComponent {
  token: string | null = null;
  password: string = '';
  confirmPassword: string = '';
  message: string = '';
  isError: boolean = false;

  constructor(private auth: AuthService, private route: ActivatedRoute) {
    // Token will come from query param: /reset-password?token=xyz
    this.token = this.route.snapshot.queryParamMap.get('token');
  }

  onSubmit() {
    if (!this.password || !this.confirmPassword) {
      this.isError = true;
      this.message = '⚠️ Both fields are required';
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.isError = true;
      this.message = '⚠️ Passwords do not match';
      return;
    }
    if (!this.token) {
      this.isError = true;
      this.message = '⚠️ Reset token is missing';
      return;
    }

    this.auth.reset(this.token, this.password).subscribe({
      next: () => {
        this.isError = false;
        this.message = '✅ Password reset successful! You can now log in.';
      },
      error: (err) => {
        this.isError = true;
        this.message = err?.error || '❌ Failed to reset password';
      }
    });
  }
}
