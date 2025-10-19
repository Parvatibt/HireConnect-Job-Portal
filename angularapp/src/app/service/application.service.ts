// src/app/service/application.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Application } from '../model/application.model';

@Injectable({ providedIn: 'root' })
export class ApplicationService {
  private apiBase = environment.apiUrl && environment.apiUrl.length > 0
    ? `${environment.apiUrl}/applications`
    : '/api/applications';

  // Note: root for job-specific endpoints (used by isApplied)
  private apiRoot = environment.apiUrl && environment.apiUrl.length > 0
    ? `${environment.apiUrl}`
    : '';

  constructor(private http: HttpClient) {}

  /**
   * Create an application (without file)
   */
  create(app: Application): Observable<any> {
    const payload = {
      jobId: app.jobId,
      candidateName: app.candidateName ?? (app as any).name,
      candidateEmail: app.candidateEmail ?? (app as any).email,
      candidatePhone: app.candidatePhone ?? (app as any).phone,
      // resumeFilename is optional (text)
      resumeFilename: app.resumeFilename ?? (app as any).resume
    };
    return this.http.post<any>(`${this.apiBase}`, payload);
  }

  /**
   * Create application with file upload (multipart/form-data).
   * Backend endpoint used: POST {apiBase}/apply
   */
  createWithFile(app: Application, file: File): Observable<any> {
    const formData = new FormData();
    if (app.jobId !== undefined && app.jobId !== null) {
      formData.append('jobId', String(app.jobId));
    }
    formData.append('candidateName', app.candidateName ?? (app as any).name ?? '');
    formData.append('candidateEmail', app.candidateEmail ?? (app as any).email ?? '');
    formData.append('candidatePhone', app.candidatePhone ?? (app as any).phone ?? '');
    // file part (field name 'file' — adapt if backend expects different)
    formData.append('file', file, file.name);

    return this.http.post<any>(`${this.apiBase}/apply`, formData);
  }

  /**
   * Get applications for the currently authenticated candidate.
   * Uses backend endpoint: GET {apiBase}/mine
   * Returns an array of application DTOs (shape depends on backend).
   */
  getMyApplications(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiBase}/mine`).pipe(
      catchError(err => {
        // non-fatal: return empty array if request fails (UI will remain usable)
        console.warn('ApplicationService.getMyApplications() failed', err);
        return of([]);
      })
    );
  }

  /**
   * Check whether the current authenticated candidate has already applied
   * for the given jobId.
   *
   * Strategy:
   *  1) Try GET {apiRoot}/api/jobs/{jobId}/applied
   *  2) If that fails, try GET {apiBase}/check?jobId={jobId} or /applications/check
   *  3) Normalize response shapes: boolean, { applied: boolean }, { isApplied: boolean }, or other truthy -> true
   *
   * Returns Observable<boolean>.
   */
  isApplied(jobId: number): Observable<boolean> {
    if (!jobId) return of(false);

    const url1 = `${this.apiRoot.replace(/\/$/, '')}/api/jobs/${jobId}/applied`;
    const url2 = `${this.apiBase}/check?jobId=${jobId}`;

    const normalize = (res: any): boolean => {
      if (typeof res === 'boolean') return res;
      if (!res) return false;
      // common shapes
      if (typeof res.applied === 'boolean') return res.applied;
      if (typeof res.isApplied === 'boolean') return res.isApplied;
      if (typeof res.data === 'boolean') return res.data;
      // if object contains flag names like 'exists' or 'appliedStatus'
      if (typeof res.exists === 'boolean') return res.exists;
      if (typeof res.appliedStatus === 'boolean') return res.appliedStatus;
      // fallback: truthy object -> true
      return true;
    };

    return this.http.get<any>(url1).pipe(
      map(res => normalize(res)),
      catchError(() =>
        // fallback attempt
        this.http.get<any>(url2).pipe(
          map(res2 => normalize(res2)),
          catchError(() => of(false))
        )
      )
    );
  }
}
