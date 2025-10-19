import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface SiteStats {
  activeJobs: number;   // total active jobs
  companies: number;    // total companies
  jobSeekers: number;   // total registered candidates
  successRate: number;  // 0-100 (percentage), e.g. 95
}

@Injectable({ providedIn: 'root' })
export class StatsService {
  private readonly base =
    environment.apiUrl && environment.apiUrl.length > 0
      ? `${environment.apiUrl}/stats`
      : `/api/stats`;

  constructor(private http: HttpClient) {}

  /** Backend should return:
   * {
   *   "activeJobs": 5123,
   *   "companies": 1088,
   *   "jobSeekers": 14987,
   *   "successRate": 95
   * }
   */
  getOverview(): Observable<SiteStats> {
    return this.http.get<SiteStats>(`${this.base}/overview`);
  }
}
