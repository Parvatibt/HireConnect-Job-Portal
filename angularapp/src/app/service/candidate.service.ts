// src/app/service/candidate.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

// ------------ Interfaces ------------
export interface CandidateProfile {
  id?: number;
  username?: string;
  email?: string;
  phone?: string;
  fullName?: string;
  headline?: string;
  location?: string;
  pinCode?: string;
  skills?: string;
  resumeUrl?: string | null;
  resumeFilename?: string | null;
  profilePicture?: string | null;
  profileComplete?: boolean;
}

export interface Education {
  id?: number;
  institute: string;
  degree: string;
  fieldOfStudy?: string;
}

// ------------ Service ------------
@Injectable({ providedIn: 'root' })
export class CandidateService {
  private apiBase =
    environment.apiUrl && environment.apiUrl.length > 0
      ? `${environment.apiUrl}/candidates`
      : '/api/candidates';

  private meCache: CandidateProfile | null = null;

  constructor(private http: HttpClient) {}

  // --------- Basic Profile ---------

  /** Get logged-in candidate profile */
  getProfile(): Observable<CandidateProfile> {
    return this.http.get<CandidateProfile>(`${this.apiBase}/me`);
  }

  /**
   * Convenience alias used by JobDetailsComponent
   * Same as getProfile(), but with caching and null-safe catch
   */
  getMe(): Observable<CandidateProfile | null> {
    if (this.meCache) {
      return of(this.meCache);
    }
    return this.http.get<CandidateProfile>(`${this.apiBase}/me`).pipe(
      tap((c) => (this.meCache = c)),
      catchError((err) => {
        console.warn('CandidateService.getMe() failed:', err);
        return of(null);
      })
    );
  }




  /** Save or update basic info */
  saveBasicProfile(payload: {
    fullName: string;
    phone: string;
    location: string;
    pinCode: string;
    headline?: string;
    skills?: string;
  }): Observable<CandidateProfile> {
    return this.http.post<CandidateProfile>(`${this.apiBase}/me/basic`, payload).pipe(
      tap((p) => (this.meCache = p))
    );
  }

  /** Mark profile as complete */
  markProfileComplete(): Observable<void> {
    return this.http.post<void>(`${this.apiBase}/me/complete`, {});
  }

  // --------- Education ---------

  /** Get all educations for current candidate */
  getEducations(): Observable<Education[]> {
    return this.http.get<Education[]>(`${this.apiBase}/me/educations`);
  }

  /** Save education list */
  saveEducations(list: Education[]): Observable<Education[]> {
    return this.http.post<Education[]>(`${this.apiBase}/me/educations`, list);
  }

  // --------- Applications ---------

  /** Get all applications of candidate */
  getApplications(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiBase}/me/applications`);
  }

  // --------- File Uploads ---------

  /**
   * Upload resume file
   * Accepts either a File or FormData (server expects "file" field)
   */
  uploadResume(fileOrForm: File | FormData): Observable<any> {
    const fd =
      fileOrForm instanceof FormData
        ? fileOrForm
        : (() => {
            const f = new FormData();
            f.append('file', fileOrForm);
            return f;
          })();
    return this.http.post<any>(`${this.apiBase}/me/resume`, fd);
  }

  /** Upload profile picture (optional) */
  uploadProfilePicture(file: File | FormData): Observable<any> {
    const fd =
      file instanceof FormData
        ? file
        : (() => {
            const f = new FormData();
            f.append('file', file);
            return f;
          })();
    return this.http.post(`${this.apiBase}/me/photo`, fd);
  }

  // --------- Listing (Admin / Misc) ---------

  /** Optional: Admin/candidate listing with filters */
  listCandidates(params?: { q?: string; page?: number; size?: number }): Observable<any> {
    let p = new HttpParams();
    if (params?.q) p = p.set('q', params.q);
    if (params?.page != null) p = p.set('page', String(params.page));
    if (params?.size != null) p = p.set('size', String(params.size));
    return this.http.get(`${this.apiBase}`, { params: p });
  }

  // --------- Cache Helpers ---------
  clearCache(): void {
    this.meCache = null;
  }
}
