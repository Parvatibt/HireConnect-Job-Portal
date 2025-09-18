import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthRequest } from '../model/auth-request.model';
import { AuthResponse } from '../model/auth-response.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = '/api/auth';

  constructor(private http: HttpClient) {}

  login(data: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data);
  }

  register(data: AuthRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  forgotPassword(data: AuthRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot`, data);
  }

  resetPassword(data: AuthRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset`, data);
  }
}
