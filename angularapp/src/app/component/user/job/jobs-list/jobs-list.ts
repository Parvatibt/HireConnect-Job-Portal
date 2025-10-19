import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { JobService } from '../../../../service/job.service';
import { ApplicationService } from '../../../../service/application.service';
import { AuthService } from '../../../../service/auth.service';
import { Job } from '../../../../model/job.model';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-jobs-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './jobs-list.html',
  styleUrls: ['./jobs-list.css']
})
export class JobsListComponent implements OnInit {
  // search model
  query = { title: '' };

  // filter options
  categories = ['Engineering', 'Design', 'Product', 'Marketing', 'Sales'];
  locations = ['Remote', 'London', 'New York', 'Bangalore', 'Berlin'];
  jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship'];

  // selected filters
  selectedCategories = new Set<string>();
  selectedLocations = new Set<string>();
  selectedJobTypes = new Set<string>();

  // jobs loaded from API
  jobs: Job[] = [];

  // applied state (job ids)
  appliedJobIds = new Set<number>();

  // boolean used while we check or re-check applied state (simple global flag)
  loadingApplied = false;

  loading = false;
  error: string | null = null;

  // new: auth prompt modal state
  showAuthPrompt = false;
  authPromptJobId?: number | null = null;
  authPromptJobTitle?: string | null = null;

  constructor(
    private jobSvc: JobService,
    private appSvc: ApplicationService,
    private authSvc: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadJobs();

    // only fetch user's applications if logged in
    if (this.authSvc.isLoggedIn()) {
      this.refreshAppliedSet();
    }
  }

  // trackBy for ngFor
  trackByJobId(index: number, job: Job) {
    return job?.id ?? index;
  }

  /**
   * Build/refresh the set of jobIds the current candidate has applied to.
   * Called once on init, and can be called again after applying.
   */
  refreshAppliedSet(): void {
    this.loadingApplied = true;
    this.appSvc.getMyApplications().pipe(take(1)).subscribe({
      next: (list: any[]) => {
        this.appliedJobIds.clear();
        if (Array.isArray(list)) {
          for (const a of list) {
            const jobId = a?.jobId ?? (a?.job ? a.job.id : undefined) ?? a?.job_id ?? null;
            if (jobId != null) this.appliedJobIds.add(Number(jobId));
          }
        }
        this.loadingApplied = false;
      },
      error: (err: any) => {
        console.warn('Failed to fetch my applications', err);
        this.loadingApplied = false;
      }
    });
  }

  loadJobs(): void {
    this.loading = true;
    this.error = null;
    this.jobSvc.getAll().subscribe({
      next: (list: Job[]) => {
        this.jobs = Array.isArray(list) ? list : [];
        this.jobs.forEach(j => {
          if (!j.shortDescription) j.shortDescription = this.getShortDescription(j, 180);
          j.minExp = j.minExp != null ? Number(j.minExp) : null;
          j.maxExp = j.maxExp != null ? Number(j.maxExp) : null;
          j.minSalary = j.minSalary != null ? Number(j.minSalary) : null;
          j.maxSalary = j.maxSalary != null ? Number(j.maxSalary) : null;
        });
        this.loading = false;
      },
      error: (err: unknown) => {
        console.error('Failed to load jobs', err);
        this.error = (err as any)?.error?.message ?? 'Failed to load jobs';
        this.loading = false;
      }
    });
  }

  // toggle helpers
  toggleCategory(c: string): void { this.toggleSet(this.selectedCategories, c); }
  toggleLocation(l: string): void { this.toggleSet(this.selectedLocations, l); }
  toggleJobType(t: string): void { this.toggleSet(this.selectedJobTypes, t); }
  private toggleSet(set: Set<string>, value: string): void {
    if (set.has(value)) set.delete(value); else set.add(value);
  }

  // filtered list
  get filteredJobs(): Job[] {
    const q = (this.query.title || '').trim().toLowerCase();
    return this.jobs.filter(job => {
      if (q) {
        const hay = ((job.title || '') + ' ' + (job.company?.name || (job.company as any) || '')).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (this.selectedCategories.size > 0) {
        const cat = (job as any).category as string | undefined;
        if (!cat || !this.selectedCategories.has(cat)) return false;
      }
      if (this.selectedLocations.size > 0) {
        if (job.location) {
          if (!this.selectedLocations.has(job.location)) return false;
        } else return false;
      }
      if (this.selectedJobTypes.size > 0) {
        if (job.employmentType) {
          if (!this.selectedJobTypes.has(job.employmentType)) return false;
        } else return false;
      }
      return true;
    });
  }

  getShortDescription(job: Job, max = 140): string {
    const desc = (job.description || job.shortDescription || '').trim();
    if (!desc) return '';
    if (desc.length <= max) return desc;
    return desc.slice(0, max).replace(/\s+\S*$/, '') + '…';
  }

  // ---------- Applied helpers ----------
  isApplied(job: Job): boolean {
    if (!job || job.id == null) return false;
    return this.appliedJobIds.has(Number(job.id));
  }

  /**
   * When user clicks Apply Now on the job card we reuse the details page apply flow:
   * - if already applied: do nothing (or you can show a toast)
   * - otherwise: navigate to /jobs/:id and open the modal via query param
   */
  applyNow(job: Job): void {
    if (!job || job.id == null) return;

    // if already applied, ignore
    if (this.isApplied(job)) {
      return;
    }

    // If user not logged in, show auth prompt modal (do not navigate)
    if (!this.authSvc.isLoggedIn()) {
      this.authPromptJobId = job.id;
      this.authPromptJobTitle = job.title;
      this.showAuthPrompt = true;
      return;
    }

    // Ensure user is logged in. If logged in, navigate to job details and open the modal via query param
    this.router.navigate(['/jobs', job.id], { queryParams: { openApply: 'true' } });
  }

  // search submit handler
  onSearch(): void {
    const listEl = document.querySelector('.job-list');
    if (listEl) listEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ---------- Auth prompt modal helpers ----------
  closeAuthPrompt(): void {
    this.showAuthPrompt = false;
    this.authPromptJobId = null;
    this.authPromptJobTitle = null;
  }

  goToLogin(): void {
    const redirect = this.authPromptJobId ? `/jobs/${this.authPromptJobId}?openApply=true` : '/jobs';
    this.router.navigate(['/login'], { queryParams: { redirect } }).catch(() => {});
  }

  goToRegister(): void {
    const redirect = this.authPromptJobId ? `/jobs/${this.authPromptJobId}?openApply=true` : '/jobs';
    this.router.navigate(['/register'], { queryParams: { redirect } }).catch(() => {});
  }
}
