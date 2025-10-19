// src/app/component/admin/manage-jobs/manage-jobs.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminSidebar } from '../../shared/admin-sidebar/admin-sidebar';
import { JobService } from '../../../service/job.service';
import { RecruiterService } from '../../../service/recruiter.service';
import { Job } from '../../../model/job.model';
import { HttpClientModule } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-manage-jobs',
  standalone: true,
  imports: [CommonModule, RouterModule, AdminSidebar, HttpClientModule, FormsModule],
  templateUrl: './manage-jobs.html',
  styleUrls: ['./manage-jobs.css']
})
export class ManageJobsComponent implements OnInit {
  jobs: JobView[] = [];
  loading = false;
  error = '';

  // search & filter state
  searchTerm = '';
  companyFilter = '';
  statusFilter = '';

  constructor(
    private jobService: JobService,
    private recruiterService: RecruiterService // optional
  ) {}

  ngOnInit(): void {
    this.loadJobs();
  }

  loadJobs(): void {
    this.loading = true;
    this.error = '';
    this.jobService.getAll()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (data: Job[]) => {
          this.jobs = data.map(j => toJobView(j));
        },
        error: (err) => {
          console.error('Failed to load jobs', err);
          this.error = 'Failed to load jobs — check console for details.';
        }
      });
  }

  onDelete(job: JobView) {
    if (!job.id) {
      alert('Missing job id — cannot delete.');
      return;
    }
    if (!confirm(`Delete job "${job.title}"?`)) return;

    this.loading = true;
    this.jobService.delete(job.id)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: () => {
          this.jobs = this.jobs.filter(j => j.id !== job.id);
        },
        error: (err) => {
          console.error('Delete failed', err);
          alert(err?.error?.message || err?.message || 'Delete failed — check console.');
        }
      });
  }

  onEdit(job: JobView) {
    const newTitle = prompt('Edit job title', job.title);
    if (newTitle !== null) {
      job.title = newTitle.trim() || job.title;
      // TODO: call backend update when endpoint available
    }
  }

  clearSearch() {
    this.searchTerm = '';
    this.companyFilter = '';
    this.statusFilter = '';
  }

  get filteredJobs(): JobView[] {
    const term = (this.searchTerm || '').trim().toLowerCase();
    const comp = (this.companyFilter || '').trim().toLowerCase();
    const st = (this.statusFilter || '').trim().toLowerCase();

    return this.jobs.filter(j => {
      // company filter
      if (comp) {
        const c = (j.companyName || '').toLowerCase();
        if (!c.includes(comp)) return false;
      }

      // status filter (exact matching normalized)
      if (st) {
        const s = (j.status || '').toString().toLowerCase();
        if (s !== st) return false;
      }

      // search term: numeric -> id exact, otherwise title/company substring
      if (!term) return true;
      const numeric = /^[0-9]+$/.test(term);
      if (numeric && j.id != null && j.id.toString() === term) return true;

      const hay = [
        j.title || '',
        j.companyName || '',
        (j.postedByName || '')
      ].join(' ').toLowerCase();

      return hay.indexOf(term) !== -1;
    });
  }

  uniqueCompanies(): string[] {
    const set = new Set<string>();
    for (const j of this.jobs) {
      if (j.companyName) set.add(j.companyName);
    }
    return Array.from(set).sort();
  }

  trackById(_: number, item: JobView) {
    return item.id ?? _;
  }
}

/** Local view model for the UI */
type JobView = {
  id?: number;
  title: string;
  companyName?: string | null;
  status?: string | null;
  postedById?: number | null;
  postedByName?: string | null;
};

/** Map backend Job into JobView (defensive) */
function toJobView(j: Job): JobView {
  const pb: any = (j as any).postedBy ?? (j as any).postedByInfo ?? null;

  const postedById =
    (pb && typeof pb.id === 'number' ? pb.id :
      (typeof (j as any).postedById === 'number' ? (j as any).postedById : undefined)
    );

  let postedByName: string | undefined;
  if (pb) {
    if (typeof pb.fullName === 'string' && pb.fullName.trim()) {
      postedByName = pb.fullName.trim();
    } else if (typeof pb.username === 'string' && pb.username.trim()) {
      postedByName = pb.username.trim();
    } else {
      const fn = (pb.firstName ?? '').toString().trim();
      const ln = (pb.lastName ?? '').toString().trim();
      postedByName = (fn + ' ' + ln).trim() || undefined;
    }
  }

  if (!postedByName && typeof j.companyName === 'string' && j.companyName.trim()) {
    postedByName = j.companyName.trim();
  }

  let status: string | null = null;
  if (typeof (j as any).status === 'string' && (j as any).status.trim()) {
    status = (j as any).status.trim();
  } else if (typeof j.isActive === 'boolean') {
    status = j.isActive ? 'Active' : 'Closed';
  } else {
    status = (j as any).status ?? 'Unknown';
  }

  return {
    id: j.id,
    title: j.title ?? '(no title)',
    companyName: (j.company && j.company.name) ?? j.companyName ?? null,
    status,
    postedById: (typeof postedById === 'number' ? postedById : null),
    postedByName: postedByName ?? null
  };
}
