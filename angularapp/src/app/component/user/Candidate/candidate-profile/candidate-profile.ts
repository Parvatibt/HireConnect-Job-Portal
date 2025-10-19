import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { CandidateService, CandidateProfile } from '../../../../service/candidate.service';

@Component({
  selector: 'app-candidate-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './candidate-profile.html',
  styleUrls: ['./candidate-profile.css']
})
export class CandidateProfileComponent implements OnInit {
  profile?: CandidateProfile;
  applications: any[] = [];
  loading = true;
  error: string | null = null;

  // upload state
  uploading = false;
  uploadError: string | null = null;
  uploadSuccess = false;

  constructor(private svc: CandidateService, private router: Router) {}

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading = true;
    this.error = null;

    this.svc.getProfile().subscribe({
      next: (p) => {
        this.profile = p;
        this.svc.getApplications().subscribe({
          next: (apps) => {
            this.applications = Array.isArray(apps) ? apps : [];
            this.loading = false;
          },
          error: () => {
            this.applications = [];
            this.loading = false;
          }
        });
      },
      error: () => {
        this.error = 'Failed to load your profile. Please try again.';
        this.loading = false;
      }
    });
  }

  // Called by the Edit button (if you use (click))
  goToOnboarding(): void {
    this.router.navigate(['/candidate/onboarding']);
  }

  trackById = (_: number, item: any) => item?.id ?? _;

  // -----------------------
  // Resume upload handlers
  // -----------------------
  onResumeFileSelected(event: Event): void {
    this.uploadError = null;
    this.uploadSuccess = false;

    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }
    const file = input.files[0];

    // client-side validations
    const maxSize = 8 * 1024 * 1024; // 8 MB
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (file.size > maxSize) {
      this.uploadError = 'File too large. Maximum allowed size is 8 MB.';
      input.value = '';
      return;
    }

    // some browsers may not set mime type reliably; we still allow based on extension
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!allowedTypes.includes(file.type) && !['pdf', 'doc', 'docx'].includes(ext)) {
      this.uploadError = 'Unsupported file type. Please upload PDF or Word document.';
      input.value = '';
      return;
    }

    // send to backend
    const fd = new FormData();
    fd.append('file', file, file.name);

    this.uploading = true;
    this.svc.uploadResume(fd).subscribe({
      next: (resp) => {
        // expected resp: { resumeUrl: '...' } OR the updated profile — handle both
        this.uploading = false;
        this.uploadSuccess = true;
        // update profile locally: prefer full profile if backend returns it
        if (resp && (resp as any).resumeUrl) {
          if (!this.profile) this.profile = {};
          this.profile.resumeUrl = (resp as any).resumeUrl;
          // optional server may also return filename
          if ((resp as any).resumeFilename) {
            this.profile.resumeFilename = (resp as any).resumeFilename;
          } else {
            this.profile.resumeFilename = file.name;
          }
        } else if (resp && (resp as any).id) {
          // maybe backend returned updated profile object
          this.profile = resp as CandidateProfile;
        } else {
          // fallback: reload profile from server to get latest fields
          this.load();
        }

        // clear file input (if present) — best-effort
        input.value = '';

        // clear success message after a while
        setTimeout(() => (this.uploadSuccess = false), 3000);
      },
      error: (err) => {
        this.uploading = false;
        this.uploadError = err?.error?.message || 'Upload failed. Please try again.';
        // clear input so user can re-select same file
        input.value = '';
      }
    });
  }
}
