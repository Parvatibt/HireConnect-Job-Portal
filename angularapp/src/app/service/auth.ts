import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private base = 'http://localhost:9090/api/auth';  // ✅ Correct URL

  constructor(private http: HttpClient) {}

  register(payload: { username: string; email: string; password: string; extra?: string }): Observable<any> {
    return this.http.post(`${this.base}/register`, payload);
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.base}/login`, { username, password });
  }

  forgot(email: string): Observable<any> {
    return this.http.post(`${this.base}/forgot-password`, { email });
  }

  reset(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.base}/reset-password`, { token, newPassword });
  }

  logout(): void {
    localStorage.removeItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }
}
