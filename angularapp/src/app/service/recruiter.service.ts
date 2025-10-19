// src/app/service/recruiter.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type HiringFor = 'COMPANY' | 'CONSULTANCY';

export interface SimpleCompany {
  id?: number;
  name?: string;
  industry?: string | null;
  location?: string | null;
  website?: string | null;
  createdBy?: string | null;
  logoUrl?: string | null;
}

/**
 * Recruiter profile returned from backend.
 * Many backends return either a companyId OR a nested company object.
 * We support both shapes to be defensive in the UI.
 */
export interface RecruiterProfile {
  id?: number;
  username?: string;
  fullName?: string;
  phone?: string | null;
  email?: string | null;
  hiringFor?: HiringFor;   // 'COMPANY' | 'CONSULTANCY'
  companyName?: string | null;
  companyId?: number | null;
  company?: SimpleCompany | null;
  location?: string | null;
  // any other fields your backend returns may be present
  [k: string]: any;
}

export interface ApplicantItem {
  id: number;              // application id
  jobId?: number | null;
  jobTitle?: string | null;
  candidateName: string;
  candidateEmail: string;
  resumeUrl?: string | undefined;
  appliedAt?: string | Date | null; // keep date pipe happy
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'INTERVIEW' | 'REVIEW' | string;
}

export interface JobPost {
  id?: number;
  title: string;
  location?: string | null;
  description?: string | null;
  minExp?: number | null;
  maxExp?: number | null;
  minSalary?: number | null;
  maxSalary?: number | null;
  // additional optional fields allowed by backend
  [k: string]: any;
}

@Injectable({ providedIn: 'root' })
export class RecruiterService {
  private readonly apiBase =
    environment.apiUrl && environment.apiUrl.length > 0
      ? `${environment.apiUrl}/recruiters`
      : '/api/recruiters';

  constructor(private http: HttpClient) {}

  /** GET /api/recruiters/me */
  getMe(): Observable<RecruiterProfile> {
    return this.http.get<RecruiterProfile>(`${this.apiBase}/me`);
  }

  /** POST /api/recruiters/me  (create/update) */
  saveMe(payload: RecruiterProfile): Observable<RecruiterProfile> {
    return this.http.post<RecruiterProfile>(`${this.apiBase}/me`, payload);
  }

  /**
   * GET /api/recruiters/applicants
   * Optional filters: jobId, status
   */
  getApplicants(params?: { jobId?: number; status?: string }): Observable<ApplicantItem[]> {
    let httpParams = new HttpParams();
    if (params?.jobId != null) httpParams = httpParams.set('jobId', String(params.jobId));
    if (params?.status) httpParams = httpParams.set('status', params.status);
    return this.http.get<ApplicantItem[]>(`${this.apiBase}/applicants`, { params: httpParams });
  }

  /**
   * POST /api/recruiters/applications/:id/status
   * body: { status: 'APPROVED' | 'REJECTED' | 'INTERVIEW' | 'REVIEW' | 'PENDING' }
   */
  updateApplicationStatus(appId: number, status: string): Observable<void> {
    return this.http.post<void>(`${this.apiBase}/applications/${appId}/status`, { status });
  }

  /** POST /api/recruiters/jobs */
  postJob(job: JobPost): Observable<JobPost> {
    return this.http.post<JobPost>(`${this.apiBase}/jobs`, job);
  }

  /** GET /api/recruiters/jobs */
  listMyJobs(): Observable<JobPost[]> {
    return this.http.get<JobPost[]>(`${this.apiBase}/jobs`);
  }

  // ---------------------------
  // Company-related helpers
  // ---------------------------

  /**
   * GET /api/recruiters/company
   * Fetch the company associated with the logged-in recruiter (if backend exposes this).
   * Fallback: backend may return 404 or empty body if no company is linked.
   */
  getCompanyForMe(): Observable<SimpleCompany> {
    return this.http.get<SimpleCompany>(`${this.apiBase}/company`);
  }

  /**
   * POST /api/recruiters/company/:id/link
   * Convenience to link an existing company to the recruiter account.
   * Adjust endpoint according to your backend API (this is a suggested route).
   */
  linkCompany(companyId: number): Observable<any> {
    return this.http.post<any>(`${this.apiBase}/company/${companyId}/link`, {});
  }

  /**
   * Unlink company from recruiter (example)
   * DELETE /api/recruiters/company/unlink  (adjust per backend)
   */
  unlinkCompany(): Observable<any> {
    return this.http.delete<any>(`${this.apiBase}/company/unlink`);
  }
}
