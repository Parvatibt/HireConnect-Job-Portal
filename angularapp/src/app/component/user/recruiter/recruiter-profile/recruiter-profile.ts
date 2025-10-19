import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import {
  RecruiterService,
  RecruiterProfile,
  ApplicantItem,
  JobPost
} from '../../../../service/recruiter.service';

import { JobService } from '../../../../service/job.service';
import { Job } from '../../../../model/job.model';
import { AuthService } from '../../../../service/auth.service'; // <<--- ensure this path matches your project
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-recruiter-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './recruiter-profile.html',
  styleUrls: ['./recruiter-profile.css']
})
export class RecruiterProfileComponent implements OnInit {
  profile?: RecruiterProfile;

  applicants: ApplicantItem[] = [];
  jobs: Job[] = [];

  loadingApplicants = false;
  loadingJobs = false;

  error: string | null = null;

  // --- Filter state ---
  // Note: ngModel could sometimes bind a string id; we normalize before use.
  selectedJobId: number | null = null;

  constructor(
    private svc: RecruiterService,
    private jobSvc: JobService,
    private router: Router,
    private authSvc: AuthService   // injected AuthService
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  private loadProfile(): void {
    this.svc.getMe().subscribe({
      next: (p: RecruiterProfile) => {
        this.profile = p;

        // ALWAYS try to load applicants + jobs after we get recruiter profile.
        this.loadJobs();
        // Load applicants for all jobs by default
        this.loadApplicants();
      },
      error: (err: unknown) => {
        console.error('Failed to load profile', err);
        this.error = (err as any)?.error?.message ?? 'Failed to load recruiter profile';
      }
    });
  }

  /**
   * Normalize a possibly-string job id from the UI into number|null.
   * Ensures we always call the service with a number or null.
   */
  private normalizeSelectedJobId(): number | null {
    if (this.selectedJobId == null) return null;
    // If ngModel accidentally stores a string, convert to number
    const asNum = Number(this.selectedJobId);
    return Number.isFinite(asNum) && !Number.isNaN(asNum) ? asNum : null;
  }

  /**
   * Load applicants from backend. If jobId is provided, still enforce client-side
   * filtering as a fallback in case the backend returns all applicants.
   */
  private loadApplicants(jobId?: number | null): void {
    this.loadingApplicants = true;

    const requestedJobId = jobId ?? null;

    this.svc.getApplicants(requestedJobId != null ? { jobId: requestedJobId } : undefined)
      .pipe(finalize(() => this.loadingApplicants = false))
      .subscribe({
        next: (list: ApplicantItem[] | any[]) => {
          let arr = Array.isArray(list) ? (list as ApplicantItem[]) : [];

          // Fallback: if we requested a specific jobId but received more results,
          // filter on the client to show only matching jobId entries.
          if (requestedJobId != null) {
            arr = arr.filter(a => {
              // a.jobId may be string or number; normalize both sides.
              const aj = a?.jobId == null ? null : Number(a.jobId);
              return aj === requestedJobId;
            });
          }

          this.applicants = arr;
        },
        error: (err: unknown) => {
          console.error('Failed to load applicants', err);
          // clear applicants on error
          this.applicants = [];
        }
      });
  }

  private loadJobs(): void {
    this.loadingJobs = true;
    this.jobSvc.listMyJobs()
      .pipe(finalize(() => this.loadingJobs = false))
      .subscribe({
        next: (list: Job[]) => {
          this.jobs = Array.isArray(list) ? list : [];
        },
        error: (err: unknown) => {
          console.error('Failed to load jobs', err);
          this.jobs = [];
        }
      });
  }

  // --- Actions --- (unchanged)
  goEditProfile(): void {
    this.router.navigateByUrl('/recruiter/dashboard')
      .then(ok => console.log('navigate result', ok))
      .catch(err => console.error('navigate error', err));
  }

  goCompanyDetails(): void {
    const companyId =
      this.profile?.company?.id ??
      (this.profile as any)?.companyId ??
      null;

    if (!companyId) {
      alert('No company linked to your profile.');
      return;
    }

    this.router.navigate(['/companies', companyId])
      .catch(err => console.error('Navigation error:', err));
  }

  goPostJob(): void {
    // create new job
    this.router.navigateByUrl('/recruiter/post-job');
  }

  goEditJob(job: Job): void {
    if (!job || job.id == null) return;
    const id = job.id;
    this.router.navigate(['/recruiter/post-job', id]);
  }

  deleteJob(job: Job): void {
    if (!job || job.id == null) return;
    const id = job.id;
    const ok = window.confirm('Delete this job? This cannot be undone.');
    if (!ok) return;

    this.jobSvc.delete(id).subscribe({
      next: () => {
        // remove from local list
        this.jobs = this.jobs.filter(j => (j.id ?? -1) !== id);

        // if deleted job was selected in filter, clear and reload applicants
        if (this.selectedJobId === id) {
          this.clearFilter();
        }
      },
      error: (err: unknown) => {
        console.error('Delete job failed', err);
        window.alert('Failed to delete job');
      }
    });
  }

  viewResume(url?: string): void {
    if (!url) {
      alert('Resume not available.');
      return;
    }
    const normalized = (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/'))
      ? url
      : `/files/resumes/${url}`;
    window.open(normalized, '_blank', 'noopener');
  }

  approve(a: ApplicantItem): void {
    this.svc.updateApplicationStatus(a.id, 'APPROVED').subscribe({
      next: () => (a.status = 'APPROVED'),
      error: (err) => console.error('Approve failed', err)
    });
  }

  reject(a: ApplicantItem): void {
    this.svc.updateApplicationStatus(a.id, 'REJECTED').subscribe({
      next: () => (a.status = 'REJECTED'),
      error: (err) => console.error('Reject failed', err)
    });
  }

  // --- Filter helpers ---
  applyFilter(): void {
    // normalize possible string id to number|null
    const jobId = this.normalizeSelectedJobId();
    this.selectedJobId = jobId;
    // selectedJobId may be null -> fetch all
    this.loadApplicants(this.selectedJobId ?? null);
  }

  clearFilter(): void {
    this.selectedJobId = null;
    this.loadApplicants();
  }

  getJobTitle(jobId: number | null | undefined): string {
    if (jobId == null) return '';
    const j = this.jobs.find(x => (x.id ?? -1) === jobId);
    return j?.title ?? '';
  }

  // TrackBys
  trackByApplicantId = (_: number, item: ApplicantItem) => item.id;
  trackByJobId = (_: number, job: Job) => (job.id ?? _);

  // canEditCompany unchanged
  get canEditCompany(): boolean {
    try {
      if (!this.authSvc) return false;
      if (typeof this.authSvc.isLoggedIn === 'function') {
        if (!this.authSvc.isLoggedIn()) return false;
      } else {
        if (!(this.authSvc as any).user && !(this.authSvc as any).currentUser) return false;
      }

      const tryRoles = (): string[] | null => {
        if (typeof (this.authSvc as any).getRoles === 'function') {
          const r = (this.authSvc as any).getRoles();
          if (Array.isArray(r)) return r.map(String);
        }
        const u = (this.authSvc as any).user ?? (this.authSvc as any).currentUser ?? null;
        if (u && Array.isArray(u.roles)) return u.roles.map(String);
        if (u && typeof u.role === 'string') return [u.role];
        return null;
      };

      const roles = tryRoles();
      if (Array.isArray(roles)) {
        const normalized = roles.map(r => String(r).toUpperCase());
        if (normalized.includes('RECRUITER') || normalized.includes('ROLE_RECRUITER') ||
            normalized.includes('ADMIN') || normalized.includes('ROLE_ADMIN')) {
          return true;
        }
      }

      if (typeof (this.authSvc as any).hasRole === 'function') {
        if ((this.authSvc as any).hasRole('RECRUITER') || (this.authSvc as any).hasRole('ADMIN') ||
            (this.authSvc as any).hasRole('ROLE_RECRUITER') || (this.authSvc as any).hasRole('ROLE_ADMIN')) {
          return true;
        }
      }

      return false;
    } catch (ex) {
      console.warn('canEditCompany check failed', ex);
      return false;
    }
  }
}
