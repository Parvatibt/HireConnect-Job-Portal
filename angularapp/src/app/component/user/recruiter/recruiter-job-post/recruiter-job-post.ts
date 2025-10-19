// src/app/recruiter/.../recruiter-post-job.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { RecruiterService } from '../../../../service/recruiter.service';
import { JobService } from '../../../../service/job.service';
import { Job } from '../../../../model/job.model';

@Component({
  selector: 'app-recruiter-job-post',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './recruiter-job-post.html',
  styleUrls: ['./recruiter-job-post.css']
})
export class RecruiterJobPostComponent implements OnInit {
  public form!: FormGroup;
  public posting = false;
  public postedId?: number;
  public error: string | null = null;
  public successMessage: string | null = null;

  public years = Array.from({ length: 21 }, (_, i) => i); // 0..20

  public categories = [
    'Software Development',
    'Information Technology',
    'Data Science & Analytics',
    'Web Development',
    'Mobile Development',
    'Artificial Intelligence / Machine Learning',
    'Cybersecurity',
    'UI/UX Design',
    'Product Management',
    'Project Management',
    'Marketing',
    'Sales & Business Development',
    'Human Resources (HR)',
    'Finance & Accounting',
    ' Industrial Engineering',
    'Operations & Supply Chain',
    'Customer Support / Client Relations',
    'Content Writing / Copywriting',
    'Graphic Design',
    'Quality Assurance / Testing',
    'Engineering (Mechanical / Electrical / Civil)',
    'Manufacturing / Production',
    'Administrative / Office Support',
    'Education & Training',
    'Healthcare & Medical',
    'Legal / Compliance',
    'Research & Development (R&D)',
    'Consulting',
    'Public Relations / Communications',
    'Architecture / Interior Design',
    'Logistics / Transportation',
    'Hospitality & Tourism',
    'Real Estate',
    'Retail / E-commerce',
    'Government / Public Sector',
    'Internships / Fresher Roles'
  ];

  public jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship'];

  // edit mode
  public editingId?: number;
  public isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private svc: RecruiterService,
    private jobSvc: JobService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      companyName: ['', Validators.required],
      title: ['', Validators.required],
      category: ['', Validators.required],
      location: ['', Validators.required],
      minExp: [0, [Validators.required, Validators.min(0)]],
      maxExp: [1, [Validators.required]],
      minSalary: [0, [Validators.required, Validators.min(0)]],
      maxSalary: [0, [Validators.required, Validators.min(0)]],
      employmentType: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(20)]]
    });

    // prefill company from recruiter profile (if available)
    this.svc.getMe().subscribe({
      next: (p) => {
        if (p?.companyName) {
          this.form.patchValue({ companyName: p.companyName });
        }
      },
      error: () => { /* ignore */ }
    });

    // check for edit id
    this.route.paramMap.subscribe(pm => {
      const idStr = pm.get('id');
      if (idStr) {
        const id = Number(idStr);
        if (!isNaN(id) && id > 0) {
          this.enterEditMode(id);
        }
      }
    });
  }

  private enterEditMode(id: number): void {
    this.isEditMode = true;
    this.editingId = id;
    this.posting = true;
    this.jobSvc.getById(id).subscribe({
      next: (job) => {
        // patch form with job data
        this.form.patchValue({
          companyName: job.company?.name ?? job.companyName ?? '',
          title: job.title ?? '',
          category: job.category ?? '',
          location: job.location ?? '',
          minExp: job.minExp ?? 0,
          maxExp: job.maxExp ?? 1,
          minSalary: job.minSalary ?? 0,
          maxSalary: job.maxSalary ?? 0,
          employmentType: job.employmentType ?? '',
          description: job.description ?? ''
        });
        this.posting = false;
      },
      error: (err) => {
        this.posting = false;
        this.error = 'Failed to load job for editing';
      }
    });
  }

  public post(): void {
    this.error = null;
    this.successMessage = null;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error = 'Please complete the required fields.';
      return;
    }

    const v = this.form.value;
    if (v.maxExp < v.minExp) {
      this.error = 'Max experience must be ≥ Min experience';
      return;
    }
    if (v.maxSalary < v.minSalary) {
      this.error = 'Max salary must be ≥ Min salary';
      return;
    }

    this.posting = true;

    // IMPORTANT: send companyName at top level (backend expects companyName or companyId)
    const payload: Partial<Job> = {
      title: (v.title || '').trim(),
      companyName: (v.companyName || '').trim(),   // <-- changed: top-level companyName
      // keep nested company if you still want it locally, but backend looks at companyName/companyId
      // company: { name: (v.companyName || '').trim() }, // optional; not required by backend
      location: (v.location || '').trim(),
      description: (v.description || '').trim(),
      minExp: v.minExp,
      maxExp: v.maxExp,
      minSalary: v.minSalary,
      maxSalary: v.maxSalary,
      employmentType: v.employmentType,
      category: v.category
    };

    if (this.isEditMode && this.editingId) {
      // update
      this.jobSvc.update(this.editingId, payload).subscribe({
        next: (res) => {
          this.posting = false;
          this.successMessage = 'Job updated successfully';
          // navigate back to profile or dashboard after update
          setTimeout(() => this.router.navigateByUrl('/recruiter/profile'), 800);
        },
        error: (err) => {
          this.posting = false;
          this.error = err?.error?.message ?? 'Failed to update job';
        }
      });
    } else {
      // create
      this.jobSvc.create(payload).subscribe({
        next: (res: any) => {
          this.posting = false;
          this.postedId = res?.id;
          this.successMessage = 'Job Posted successfully';

          // Reset while keeping company name (if present)
          const companyName = this.form.value.companyName || '';
          this.form.reset({
            companyName,
            minExp: 0,
            maxExp: 1,
            minSalary: 0,
            maxSalary: 0,
            title: '',
            category: '',
            location: '',
            employmentType: '',
            description: ''
          });

          setTimeout(() => { this.successMessage = null; }, 4000);
        },
        error: (err) => {
          this.posting = false;
          this.error = err?.error?.message ?? 'Failed to post job';
        }
      });
    }
  }
}
