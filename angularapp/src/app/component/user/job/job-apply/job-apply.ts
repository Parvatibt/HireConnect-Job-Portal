// src/app/component/user/job/job-apply/job-apply.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApplicationService } from '../../../../service/application.service';
import { Application } from '../../../../model/application.model';

@Component({
  selector: 'app-job-apply',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './job-apply.html',
  styleUrls: ['./job-apply.css']
})
export class JobApplyComponent implements OnInit {
  jobId: number | null = null;

  // optional job meta displayed in header (these can be filled by fetch or left empty)
  jobTitle?: string;
  jobCompany?: string;
  jobLocation?: string;
  jobType?: string;
  postedText?: string;

  posting = false;
  error: string | null = null;
  success: string | null = null;

  application: Application = {
    jobId: undefined,
    name: '',
    email: '',
    phone: ''
  };

  selectedFile: File | null = null;
  selectedFileName: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private appSvc: ApplicationService,
    private router: Router
  ) {}

  ngOnInit() {
    const idStr = this.route.snapshot.paramMap.get('id');
    this.jobId = idStr ? Number(idStr) : null;
    // assign to application.jobId only if valid number
    if (this.jobId !== null && !Number.isNaN(this.jobId)) {
      this.application.jobId = this.jobId;
    } else {
      this.application.jobId = undefined;
    }

    // OPTIONAL: if you want to fetch job meta (title/company) to display in header,
    // inject JobService and fetch job by ID here. Left out for brevity.
    // Example:
    // this.jobService.getById(this.jobId).subscribe(j => { this.jobTitle = j.title; ... });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    if (!file) {
      this.selectedFile = null;
      this.selectedFileName = null;
      return;
    }

    // Validate file type and size (optional)
    const allowedExtensions = /\.(pdf|doc|docx)$/i;
    const allowedMime = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

    if (!allowedExtensions.test(file.name) && !allowedMime.includes(file.type)) {
      this.error = 'Only PDF, DOC or DOCX files are allowed.';
      this.selectedFile = null;
      this.selectedFileName = null;
      return;
    }

    // Optionally limit size (e.g., 5MB)
    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      this.error = 'File too large. Max allowed size is 5MB.';
      this.selectedFile = null;
      this.selectedFileName = null;
      return;
    }

    this.error = null;
    this.selectedFile = file;
    this.selectedFileName = file.name;
  }

  formValid(): boolean {
    // require name, email, phone and a selected file
    return !!(this.application.name && this.application.email && this.application.phone && this.selectedFile);
  }

  cancelApplication() {
    // clear and navigate back to job list
    this.application = { jobId: this.application.jobId, name: '', email: '', phone: '' };
    this.selectedFile = null;
    this.selectedFileName = null;
    this.error = null;
    this.success = null;
    this.router.navigate(['/jobs']).catch(() => {});
  }

  submitApplication() {
    this.error = null;
    this.success = null;

    if (!this.formValid()) {
      this.error = 'Please provide name, email, phone and upload your resume.';
      return;
    }
    if (!this.selectedFile) {
      this.error = 'Please select a resume file.';
      return;
    }

    // ensure jobId present in payload (server typically needs it)
    if ((this.application.jobId === undefined || this.application.jobId === null) && this.jobId !== null) {
      this.application.jobId = this.jobId;
    }

    if (this.application.jobId === undefined || this.application.jobId === null) {
      this.error = 'Missing job id.';
      return;
    }

    this.posting = true;

    this.appSvc.createWithFile(this.application, this.selectedFile).subscribe({
      next: (res) => {
        this.success = res?.message ?? 'Application submitted successfully.';
        this.posting = false;
        // small delay so user sees the success message
        setTimeout(() => {
          this.router.navigate(['/jobs']).catch(() => {});
        }, 900);
      },
      error: (err) => {
        console.error('Application failed', err);
        this.error = err?.error?.message ?? 'Failed to submit application';
        this.posting = false;
      }
    });
  }
}
