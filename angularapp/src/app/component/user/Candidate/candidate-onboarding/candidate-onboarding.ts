import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { CandidateService, Education } from '../../../../service/candidate.service';
import { finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../../../../service/auth.service';

@Component({
  selector: 'app-candidate-onboarding',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './candidate-onboarding.html',
  styleUrls: ['./candidate-onboarding.css']
})
export class CandidateOnboardingComponent implements OnInit {
  step = 1;
  saving = false;
  isUploading = false;
  error: string | null = null;

  basicForm: FormGroup;
  educationForm: FormGroup;
  private _file?: File;
  resumeUrl: string | null = null;

  constructor(
    private fb: FormBuilder,
    private svc: CandidateService,
    private router: Router,
    private auth: AuthService
  ) {
    // Step 1 form
    this.basicForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required]],
      location: ['', [Validators.required]],
      pinCode: ['', [Validators.required, Validators.pattern(/^\d{3,10}$/)]],
      headline: [''],
      skills: ['']
    });

    // Step 2 form
    this.educationForm = this.fb.group({
      educations: this.fb.array([this.createEducationGroup()])
    });
  }

  ngOnInit(): void {
    this.loadExistingProfile();
    this.loadExistingEducations();
  }

  // ---------- LOAD EXISTING DATA ----------

  private loadExistingProfile(): void {
    this.svc.getProfile().subscribe({
      next: (profile) => {
        if (profile) {
          this.basicForm.patchValue({
            fullName: profile.fullName || '',
            phone: profile.phone || '',
            location: profile.location || '',
            pinCode: profile.pinCode || '',
            headline: profile.headline || '',
            skills: profile.skills || ''
          });
          this.resumeUrl = profile.resumeUrl || null;
        }
      },
      error: (err: any) => console.error('Failed to load existing profile', err)
    });
  }

  private loadExistingEducations(): void {
    this.svc.getEducations().subscribe({
      next: (list: Education[]) => {
        if (list && list.length > 0) {
          const groups = list.map((edu) =>
            this.fb.group({
              institute: [edu.institute || '', Validators.required],
              degree: [edu.degree || '', Validators.required],
              fieldOfStudy: [edu.fieldOfStudy || '']
            })
          );
          this.educationForm.setControl('educations', this.fb.array(groups));
        } else {
          // ensure UI has one editable row even if none saved yet
          this.educationForm.setControl('educations', this.fb.array([this.createEducationGroup()]));
        }
      },
      error: (err: any) => {
        console.error('Failed to load educations', err);
        // still provide one row to edit in case of fetch failure
        this.educationForm.setControl('educations', this.fb.array([this.createEducationGroup()]));
      }
    });
  }

  // ---------- EDUCATION HELPERS ----------

  createEducationGroup(): FormGroup {
    return this.fb.group({
      institute: ['', Validators.required],
      degree: ['', Validators.required],
      fieldOfStudy: ['']
    });
  }

  get educations(): FormArray {
    return this.educationForm.get('educations') as FormArray;
  }

  addEducation(): void {
    this.educations.push(this.createEducationGroup());
  }

  removeEducation(index: number): void {
    if (this.educations.length > 1) {
      this.educations.removeAt(index);
    }
  }

  // ---------- SAVE METHODS ----------

  saveBasic(): void {
    if (this.basicForm.invalid) {
      this.basicForm.markAllAsTouched();
      return;
    }
    this.saving = true;
    const payload = this.basicForm.value;

    this.svc.saveBasicProfile(payload)
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: () => (this.step = 2),
        error: (err: any) => {
          this.error = err?.error?.message ?? err?.message ?? 'Failed to save basic info';
        }
      });
  }

  saveEducation(): void {
    if (this.educationForm.invalid) {
      this.educationForm.markAllAsTouched();
      return;
    }
    this.saving = true;
    const payload = this.educationForm.value.educations as Education[];

    this.svc.saveEducations(payload)
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: () => (this.step = 3),
        error: (err: any) => {
          this.error = err?.error?.message ?? err?.message ?? 'Failed to save education';
        }
      });
  }

  // ---------- RESUME ----------

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const f = input.files?.[0];
    if (f) this._file = f;
  }

  uploadResume(): void {
    if (!this._file && !this.resumeUrl) {
      this.error = 'Please choose a file first.';
      return;
    }

    // If user already has a resume and didn’t pick a new one, just finish
    if (!this._file && this.resumeUrl) {
      this.router.navigateByUrl('/candidate/profile');
      return;
    }

    this.isUploading = true;
    this.svc.uploadResume(this._file!)
      .pipe(finalize(() => (this.isUploading = false)))
      .subscribe({
        next: (res: { resumeUrl: string }) => {
          this.resumeUrl = res.resumeUrl;
          this.svc.markProfileComplete().subscribe({
            next: () => {
              try { this.auth.saveProfileComplete(true); }
              catch { localStorage.setItem('profileComplete', 'true'); }
              this.router.navigateByUrl('/candidate/profile');
            },
            error: (err: any) => {
              this.error = err?.error?.message ??
                'Resume uploaded but failed to mark profile complete.';
            }
          });
        },
        error: (err: any) => {
          this.error = err?.error?.message ?? 'Upload failed';
        }
      });
  }
}
