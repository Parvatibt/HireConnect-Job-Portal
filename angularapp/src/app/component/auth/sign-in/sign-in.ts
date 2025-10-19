// src/app/component/auth/sign-in/sign-in.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../service/auth.service';
import { AuthRequest } from '../../../model/auth-request.model';
import { AuthResponse } from '../../../model/auth-response.model';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sign-in.html',
  styleUrls: ['./sign-in.css']
})
export class SignIn {
  username: string = '';
  password: string = '';
  remember: boolean = false;

  // role picker on the page
  role: 'candidate' | 'recruiter' = 'candidate';

  isLoading = false;
  isError = false;
  message = '';

  private returnUrl: string | null = null;

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    const remembered = localStorage.getItem('rememberedUsername');
    if (remembered) {
      this.username = remembered;
      this.remember = true;
    }
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
  }

  setRole(r: 'candidate' | 'recruiter') {
    this.role = r;
  }

  onSubmit() {
    if (!this.username || !this.password) {
      this.isError = true;
      this.message = 'Please enter username and password.';
      return;
    }

    this.isLoading = true;
    this.isError = false;
    this.message = '';

    const payload: AuthRequest = {
      username: this.username,
      password: this.password,
      email: undefined,
      extra: undefined
    };

    this.auth.login(payload).subscribe({
      next: (res: AuthResponse) => {
        this.isLoading = false;

        if (!res || !res.token) {
          this.isError = true;
          this.message = 'Login failed: invalid server response';
          return;
        }

        // Persist token / username / role / profileComplete
        this.auth.setUserFromResponse(res);

        // ---- ENFORCE ROLE MATCH ----
        const storedRole = (this.auth.getRole() || '').toUpperCase();
        const picked = this.role.toUpperCase(); // 'CANDIDATE' or 'RECRUITER'

        const isCandidateAccount = storedRole.includes('CANDIDATE');
        const isRecruiterAccount = storedRole.includes('RECRUITER');
        const pickedCandidate = picked === 'CANDIDATE';
        const pickedRecruiter = picked === 'RECRUITER';

        if (
          (pickedCandidate && !isCandidateAccount) ||
          (pickedRecruiter && !isRecruiterAccount)
        ) {
          // Clear any saved auth because the role doesn’t match the picker
          this.auth.logout();
          this.isError = true;
          this.message = `This account is not a ${this.role}. Please choose the correct role or sign in with a ${this.role} account.`;
          return;
        }
        // ---- END ROLE ENFORCEMENT ----

        // remember username optionally
        if (this.remember) {
          localStorage.setItem('rememberedUsername', this.username);
        } else {
          localStorage.removeItem('rememberedUsername');
        }

        // If returnUrl exists, use it (guards will validate)
        if (this.returnUrl) {
          this.router.navigateByUrl(this.returnUrl);
          return;
        }

        // Route by role
        if (isCandidateAccount) {
          const profileComplete = this.auth.isProfileComplete();
          if (profileComplete) {
            this.router.navigate(['/candidate/profile']);
          } else {
            this.router.navigate(['/candidate/onboarding']);
          }
          return;
        }

        if (isRecruiterAccount) {
          // Your recruiter flow entry (guarded routes)
          this.router.navigate(['/recruiter']);
          return;
        }

        // Fallbacks for other roles (e.g., admin)
        if (this.auth.isAdmin()) {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        let serverMsg = 'Server error';
        if (err?.error) {
          if (typeof err.error === 'string') serverMsg = err.error;
          else if (err.error?.message) serverMsg = err.error.message;
          else serverMsg = JSON.stringify(err.error);
        } else if (err?.message) {
          serverMsg = err.message;
        }
        this.isError = true;
        this.message = `Login failed: ${serverMsg}`;
      }
    });
  }
}
