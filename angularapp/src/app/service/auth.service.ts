import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, firstValueFrom, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthRequest } from '../model/auth-request.model';
import { AuthResponse } from '../model/auth-response.model';
import { environment } from '../../environments/environment';

type RegisterResponse = {
  message?: string;
  username?: string;
  role?: string;
  token?: string;
  profileComplete?: boolean;
};
type ForgotResponse = { message?: string; resetTokenDev?: string };
type ResetResponse = { message?: string };

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiBase = (environment.apiUrl && environment.apiUrl.length > 0)
    ? `${environment.apiUrl}/auth`
    : `/api/auth`;

  private readonly apiRoot = this.apiBase.replace(/\/auth$/, '');

  private readonly TOKEN_KEY = 'token';
  private readonly USERNAME_KEY = 'username';
  private readonly ROLE_KEY = 'role';
  private readonly PROFILE_COMPLETE_KEY = 'profileComplete';

  // Reactive flag for UI subscriptions
  private _profileComplete$ = new BehaviorSubject<boolean>(this._readProfileCompleteFromStorage());

  constructor(private http: HttpClient) {}

  // --------------------
  // HTTP Calls
  // --------------------
  login(data: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiBase}/login`, data);
  }

  register(data: any): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiBase}/register`, data);
  }

  forgotPassword(email: string): Observable<ForgotResponse> {
    return this.http.post<ForgotResponse>(`${this.apiBase}/forgot`, { email });
  }

  reset(token: string, newPassword: string): Observable<ResetResponse> {
    return this.http.post<ResetResponse>(`${this.apiBase}/reset`, {
      password: newPassword,
      extra: token
    });
  }

  forgotPasswordByUsername(payload: { username: string; newPassword: string; currentPassword?: string }): Observable<ResetResponse> {
    return this.http.post<ResetResponse>(`${this.apiBase}/forgot-password`, payload);
  }

  // --------------------
  // Token Helpers
  // --------------------
  saveToken(token?: string | null): void {
    try {
      if (token) localStorage.setItem(this.TOKEN_KEY, token);
      else localStorage.removeItem(this.TOKEN_KEY);
    } catch {}
  }

  getToken(): string | null {
    try {
      return localStorage.getItem(this.TOKEN_KEY);
    } catch {
      return null;
    }
  }

  setTokenAndRefresh(token?: string | null): void {
    this.saveToken(token ?? null);
    if (token) {
      this.refreshProfileFlag().catch(() => {});
    } else {
      this.setProfileComplete(false);
    }
  }

  // --------------------
  // Username / Role Helpers
  // --------------------
  saveUserInfo(username?: string | null, role?: string | null): void {
    try {
      if (username) localStorage.setItem(this.USERNAME_KEY, username);
      if (role) {
        const r = role.toString().trim().toUpperCase();
        const normalized = r.startsWith('ROLE_') ? r : `ROLE_${r.replace(/\s+/g, '_')}`;
        localStorage.setItem(this.ROLE_KEY, normalized);
      }
    } catch {}
  }

  getUsername(): string | null {
    try {
      return localStorage.getItem(this.USERNAME_KEY);
    } catch {
      return null;
    }
  }

  getRole(): string | null {
    try {
      return localStorage.getItem(this.ROLE_KEY);
    } catch {
      return null;
    }
  }

  // --------------------
  // Profile Complete Helpers
  // --------------------
  private _readProfileCompleteFromStorage(): boolean {
    try {
      const v = localStorage.getItem(this.PROFILE_COMPLETE_KEY);
      return v === 'true';
    } catch {
      return false;
    }
  }

  /**
   * Persist and emit the profileComplete flag
   */
  saveProfileComplete(flag: boolean | null): void {
    try {
      if (flag === null || flag === undefined) {
        localStorage.removeItem(this.PROFILE_COMPLETE_KEY);
        this._profileComplete$.next(false);
      } else {
        localStorage.setItem(this.PROFILE_COMPLETE_KEY, flag ? 'true' : 'false');
        this._profileComplete$.next(flag);
      }
    } catch {
      this._profileComplete$.next(!!flag);
    }
  }

  setProfileComplete(flag: boolean): void {
    this.saveProfileComplete(flag);
  }

  isProfileComplete(): boolean {
    return this._profileComplete$.getValue();
  }

  profileComplete$() {
    return this._profileComplete$.asObservable();
  }

  /**
   * Refreshes the candidate/recruiter profile status from the backend.
   * You can adapt endpoint to `/candidates/me` if needed.
   */
  async refreshProfileFlag(): Promise<boolean> {
    const candidateUrl = `${this.apiRoot.replace(/\/$/, '')}/candidates/me`;
    const recruiterUrl = `${this.apiRoot.replace(/\/$/, '')}/recruiters/me`;

    try {
      const res: any = await firstValueFrom(
        this.http.get(candidateUrl).pipe(
          catchError(() => this.http.get(recruiterUrl).pipe(catchError(() => of(null))))
        )
      );

      const complete = !!(res && (res.id || res.fullName || res.companyName));
      this.saveProfileComplete(complete);
      return complete;
    } catch {
      this.saveProfileComplete(false);
      return false;
    }
  }

  // --------------------
  // Session & Role Checks
  // --------------------
  logout(): void {
    try {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USERNAME_KEY);
      localStorage.removeItem(this.ROLE_KEY);
      localStorage.removeItem(this.PROFILE_COMPLETE_KEY);
    } catch {}
    this._profileComplete$.next(false);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    const r = (this.getRole() ?? '').toUpperCase();
    return r.includes('ADMIN');
  }

  isCandidate(): boolean {
    const r = (this.getRole() ?? '').toUpperCase();
    return r.includes('CANDIDATE');
  }

  isRecruiter(): boolean {
    const r = (this.getRole() ?? '').toUpperCase();
    return r.includes('RECRUITER');
  }

  // --------------------
  // Convenience Method
  // --------------------
  setUserFromResponse(obj: any): void {
    if (!obj) return;

    // Token
    const token = obj.token ?? obj.accessToken ?? obj.jwt ?? obj.authToken;
    if (token) this.saveToken(token);

    // Username & Role
    const username =
      obj.username ?? obj.user?.username ?? obj.user?.email ?? obj.name ?? obj.email;
    const role = obj.role ?? obj.user?.role ?? null;
    if (username || role) this.saveUserInfo(username, role);

    // Profile Complete
    if (typeof obj.profileComplete === 'boolean') {
      this.saveProfileComplete(obj.profileComplete);
    } else if (obj.profile_complete !== undefined) {
      this.saveProfileComplete(Boolean(obj.profile_complete));
    }

    if (token) {
      this.refreshProfileFlag().catch(() => {});
    }
  }
}
