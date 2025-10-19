// src/app/component/user/recruiter/recruiter-dashboard/recruiter-dashboard.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RecruiterService, RecruiterProfile } from '../../../../service/recruiter.service';
import { AuthService } from '../../../../service/auth.service';

@Component({
  selector: 'app-recruiter-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './recruiter-dashboard.html',
  styleUrls: ['./recruiter-dashboard.css']
})
export class RecruiterDashboardComponent implements OnInit {
  form!: FormGroup;
  saving = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private svc: RecruiterService,
    private router: Router,   // keep private
    private auth: AuthService // <-- injected
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      hiringFor: ['COMPANY', Validators.required],  // COMPANY | CONSULTANCY
      companyName: ['', [Validators.required]]
    });

    // Prefill existing recruiter data if present
    this.svc.getMe().subscribe({
      next: (p) => {
        if (p) {
          this.form.patchValue({
            fullName: p.fullName ?? '',
            phone: p.phone ?? '',
            email: p.email ?? '',
            hiringFor: p.hiringFor ?? 'COMPANY',
            companyName: p.companyName ?? ''
          });
        }
      },
      error: (err) => {
        console.error('Failed to load recruiter data:', err);
      }
    });
  }

  // ----- form submission -----
  submit(): void {
    this.error = null;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    const payload: RecruiterProfile = this.form.value;

    this.svc.saveMe(payload).subscribe({
      next: (savedProfile) => {
        this.saving = false;

        // update auth service flag — profile is now complete
        // prefer refreshing from backend to confirm
        this.auth.refreshProfileFlag()
          .catch(() => {
            // fallback: set local flag to true if refresh fails
            this.auth.setProfileComplete(true);
          });

        // Navigate to profile page after saving
        this.router.navigate(['/recruiter/profile'])
          .then(() => console.log('Navigated to recruiter profile'))
          .catch(err => console.error('Navigation error:', err));
      },
      error: (err) => {
        this.saving = false;
        this.error = err?.error?.message ?? 'Failed to save profile';
      }
    });
  }

  // ----- cancel button -----
  cancel(): void {
    this.router.navigate(['/recruiter/profile'])
      .then(() => console.log('Cancelled → back to recruiter profile'))
      .catch(err => console.error('Navigation error:', err));
  }
}
