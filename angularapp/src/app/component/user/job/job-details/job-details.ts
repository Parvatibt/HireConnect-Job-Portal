import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { JobService } from '../../../../service/job.service';
import { ApplicationService } from '../../../../service/application.service';
import { CandidateService } from '../../../../service/candidate.service';
import { AuthService } from '../../../../service/auth.service';

import { Job } from '../../../../model/job.model';
import { Application } from '../../../../model/application.model';

@Component({
  selector: 'app-job-details',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './job-details.html',
  styleUrls: ['./job-details.css']
})
export class JobDetailsComponent implements OnInit {
  jobId: number | null = null;
  job: Job | null = null;
  loading = true;
  error: string | null = null;

  // whether current candidate already applied
  isApplied = false;
  loadingApplied = false;

  // modal state
  showApplyModal = false;
  applying = false;
  applyError: string | null = null;
  applySuccess: string | null = null;

  application: Application = {
    jobId: 0,
    candidateName: '',
    candidateEmail: '',
    candidatePhone: '',
    resumeFilename: ''
  };

  // modal file state
  modalSelectedFile?: File;
  modalSelectedFileName?: string;

  // auth prompt modal
  showAuthPrompt = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private jobService: JobService,
    private appSvc: ApplicationService,
    private candidateSvc: CandidateService,
    private authSvc: AuthService
  ) {}

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.jobId = idParam ? Number(idParam) : null;
    if (!this.jobId) {
      this.error = 'Invalid job id';
      this.loading = false;
      return;
    }

    this.fetchJob(this.jobId);

    // Prefill logged-in candidate info
    const profileObs: any = (this.candidateSvc as any).getProfile ? (this.candidateSvc as any).getProfile() : (this.candidateSvc as any).getMe?.();
    profileObs?.subscribe?.({
      next: (me: any) => {
        if (!me) return;
        this.application.candidateName = me.fullName || me.username || '';
        this.application.candidateEmail = me.email || '';
        if (me.phone) this.application.candidatePhone = me.phone;
        if (me.resumeFilename) this.application.resumeFilename = me.resumeFilename;
      },
      error: (_err: any) => {
        // ignore profile fetch errors
      }
    });
  }

  fetchJob(id: number) {
    this.loading = true;
    this.error = null;
    this.jobService.getById(id).subscribe({
      next: (j: Job) => {
        this.job = j;
        this.application.jobId = j?.id ?? 0;
        this.loading = false;

        // Now that we have jobId and user likely loaded, check applied status
        this.checkApplied();
      },
      error: (err: any) => {
        console.error('Failed to load job', err);
        this.error = err?.error?.message ?? 'Failed to load job details';
        this.loading = false;
      }
    });
  }

  /**
   * Check whether current logged-in candidate already applied for this job.
   * expects ApplicationService.isApplied(jobId) to return Observable<boolean | {applied:boolean}>
   */
  checkApplied() {
    if (!this.jobId) return;
    this.loadingApplied = true;
    this.appSvc.isApplied(this.jobId).subscribe({
      next: (res: any) => {
        // Accept either boolean or { applied: boolean }
        if (typeof res === 'boolean') {
          this.isApplied = res;
        } else if (res && typeof res.applied === 'boolean') {
          this.isApplied = res.applied;
        } else {
          // fallback: falsy -> not applied
          this.isApplied = false;
        }
        this.loadingApplied = false;
      },
      error: (err: any) => {
        // non-critical: log and keep as not applied
        console.warn('Failed to check applied status', err);
        this.isApplied = false;
        this.loadingApplied = false;
      }
    });
  }

  openApplyModal() {
    if (!this.job) return;

    // Prevent applying again if already applied
    if (this.isApplied) {
      this.applyError = 'You have already applied for this job.';
      setTimeout(() => (this.applyError = null), 2500);
      return;
    }

    // If not logged in, show auth prompt modal
    if (!this.authSvc.isLoggedIn()) {
      this.showAuthPrompt = true;
      return;
    }

    this.applyError = null;
    this.applySuccess = null;
    this.modalSelectedFile = undefined;
    this.modalSelectedFileName = undefined;
    this.showApplyModal = true;
  }

  closeModal() {
    this.showApplyModal = false;
  }

  onModalFileSelected(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const f = input.files && input.files[0];
    if (f) {
      this.modalSelectedFile = f;
      this.modalSelectedFileName = f.name;
    } else {
      this.modalSelectedFile = undefined;
      this.modalSelectedFileName = undefined;
    }
  }

  submitApplication() {
    // minimal validation: require name, email, phone, and resume file
    if (!this.application.jobId) {
      this.applyError = 'Missing job id';
      return;
    }
    if (!this.application.candidateName || !this.application.candidateEmail || !this.application.candidatePhone) {
      this.applyError = 'Please provide name, email and phone';
      return;
    }
    if (!this.modalSelectedFile) {
      this.applyError = 'Please upload your resume (PDF/DOC/DOCX)';
      return;
    }

    this.applying = true;
    this.applyError = null;
    this.applySuccess = null;

    // Use multipart upload to send file + fields
    this.appSvc.createWithFile(this.application, this.modalSelectedFile).subscribe({
      next: (res: any) => {
        this.applySuccess = res?.message ?? 'Application submitted successfully!';
        this.applying = false;

        // Mark UI as applied immediately (optimistic + accurate)
        this.isApplied = true;

        // close modal shortly after success
        setTimeout(() => this.closeModal(), 900);
      },
      error: (err: any) => {
        console.error('Application failed', err);
        this.applyError = err?.error?.message ?? 'Failed to submit application';
        this.applying = false;

        // If backend returned "already applied", reflect that
        if (err?.status === 409 || (err?.error && /already applied/i.test(err.error.message || ''))) {
          this.isApplied = true;
        }
      }
    });
  }

  applyForJob() {
    if (!this.jobId) return;
    this.router.navigate(['/job-apply', this.jobId]);
  }

  backToList() {
    this.router.navigate(['/jobs']);
  }

  rangeText(): string {
    if (!this.job) return '';
    const min = this.job.minExp ?? 0;
    const max = this.job.maxExp ?? 0;
    return `${min}-${max} years`;
  }

  salaryText(): string {
    if (!this.job) return '';
    const min = this.job.minSalary ?? 0;
    const max = this.job.maxSalary ?? 0;
    return `₹${min} - ₹${max}`;
  }

  // Auth prompt modal helpers
  closeAuthPrompt(): void {
    this.showAuthPrompt = false;
  }

  goToLogin(): void {
    const redirect = this.jobId ? `/jobs/${this.jobId}?openApply=true` : '/jobs';
    this.router.navigate(['/login'], { queryParams: { redirect } }).catch(() => {});
  }

  goToRegister(): void {
    const redirect = this.jobId ? `/jobs/${this.jobId}?openApply=true` : '/jobs';
    this.router.navigate(['/register'], { queryParams: { redirect } }).catch(() => {});
  }
}
