// src/app/component/auth/sign-up/sign-up.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router'; // <- add RouterModule
import { AuthService } from '../../../service/auth.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule], // <- include RouterModule so routerLink works
  templateUrl: './sign-up.html',
  styleUrls: ['./sign-up.css']
})
export class SignUp {
  // Form fields
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  phone: string = '';
  password: string = '';
  confirmPassword: string = '';

  // Role selector
  role: 'candidate' | 'recruiter' = 'candidate';

  // UI state
  successMessage: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  // shows short redirecting state so user sees confirmation spinner
  isRedirecting: boolean = false;

  // return url from query param (optional)
  private returnUrl: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
  }

  setRole(r: 'candidate' | 'recruiter') {
    this.role = r;
    // clear messages when user toggles role
    this.successMessage = '';
    this.errorMessage = '';
  }

  onSubmit() {
    this.successMessage = '';
    this.errorMessage = '';

    if (!this.firstName || !this.lastName || !this.email || !this.phone || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Please fill all fields.';
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    // build payload (use role property)
    const payload: any = {
      username: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      phone: this.phone,
      password: this.password,
      confirmPassword: this.confirmPassword,
      extra: this.role // backend-compatible field (adjust if backend expects `role`)
    };

    this.isLoading = true;
    // call register
    this.authService.register(payload)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (res: any) => {
          // successful registration — backend may return token/username/role/profileComplete
          this.successMessage = res?.message || 'Registered successfully';
          this.errorMessage = '';

          // Attempt to persist token & user info if present
          const token = res?.token;
          const username = res?.username ?? payload.username;
          const roleFromRes = res?.role ?? res?.extra ?? this.role;
          const profileComplete = typeof res?.profileComplete === 'boolean' ? res.profileComplete : undefined;

          if (token) {
            // save token & user info and route appropriately
            this.authService.saveToken(token);
            this.authService.saveUserInfo(username, roleFromRes);
            this.afterAuthNavigate(roleFromRes, profileComplete);
            return;
          }

          // If backend didn't provide token on register, attempt login automatically
          this.isLoading = true;
          this.authService.login({ username: payload.username, password: payload.password })
            .pipe(finalize(() => (this.isLoading = false)))
            .subscribe({
              next: (loginRes: any) => {
                // typical login response should provide token + role/username
                const t = loginRes?.token ?? loginRes?.accessToken ?? loginRes?.jwt;
                const uname = loginRes?.username ?? username;
                const r = loginRes?.role ?? roleFromRes;
                const profComplete = typeof loginRes?.profileComplete === 'boolean' ? loginRes.profileComplete : profileComplete;

                if (t) this.authService.saveToken(t);
                this.authService.saveUserInfo(uname, r);

                this.afterAuthNavigate(r, profComplete);
              },
              error: (loginErr) => {
                // login after register failed — still show message but let user go to sign-in or onboarding
                const msg = loginErr?.error?.message ?? loginErr?.message ?? 'Registered but auto-login failed. Please sign in.';
                this.errorMessage = typeof msg === 'string' ? msg : JSON.stringify(msg);

                // best-effort navigation: if candidate -> onboarding; else home
                const r = roleFromRes ?? this.role;
                this.afterAuthNavigate(r, profileComplete, /*suppressGuard=*/true);
              }
            });
        },
        error: (err) => {
          // registration failed
          const msg = err?.error?.message ?? err?.error ?? (err?.message || 'Registration failed');
          this.errorMessage = typeof msg === 'string' ? msg : JSON.stringify(msg);
          this.successMessage = '';
        }
      });
  }

  /**
   * Decide where to navigate after we have authenticated (or on fallback).
   * - If returnUrl is present -> navigate there.
   * - If role is candidate:
   *    - if profileComplete === true -> /candidate/profile
   *    - else -> /candidate/onboarding
   * - Else navigate to home '/'
   *
   * suppressGuard flag used when auto-login failed but we still want to navigate; default false.
   *
   * This method will set `isRedirecting` true and delay navigation ~900ms so UI spinner is visible.
   */
  private afterAuthNavigate(roleRaw: any, profileComplete?: boolean, suppressGuard = false) {
    const role = (roleRaw ?? '').toString().toLowerCase();

    // show redirecting UI briefly so user sees confirmation spinner
    const doNavigate = (target: string) => {
      this.isRedirecting = true;
      // small delay to show "redirecting" indicator
      setTimeout(() => {
        this.isRedirecting = false;
        // final navigation (guards will run if present)
        this.router.navigateByUrl(target);
      }, 900);
    };

    // If returnUrl provided by caller (e.g., candidate guard), prefer it.
    if (this.returnUrl) {
      doNavigate(this.returnUrl);
      return;
    }

    if (role === 'candidate' || role === 'role_candidate' || role === 'role-candidate') {
      // if backend says profileComplete === true then go to profile otherwise onboarding
      if (profileComplete === true) {
        doNavigate('/candidate/profile');
      } else {
        doNavigate('/candidate/onboarding');
      }
      return;
    }

    // For recruiters / others just go home
    doNavigate('/');
  }
}
