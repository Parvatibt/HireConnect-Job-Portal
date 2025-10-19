import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { take } from 'rxjs/operators';

import { JobService } from '../../../service/job.service';
import { Job } from '../../../model/job.model';

import { ReviewService } from '../../../service/review.service';
import { StatsService, SiteStats } from '../../../service/stats.service';

export interface Review {
  id?: string | number;
  name: string;
  designation?: string;
  message: string;
  createdAt?: string | number | Date;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './landing-page.html',
  styleUrls: ['./landing-page.css']
})
export class LandingPageComponent implements OnInit {
  // ===== Search state =====
  query = { title: '', location: '', category: '' };
  locations: string[] = [];
  categories: string[] = [];
  jobs: Job[] = [];
  loading = false;
  error: string | null = null;
  searched = false;

  // ===== Reviews state =====
  reviewsRecent: Review[] = []; // full recent list (we'll expose first 4 via a getter)
  reviewsTop: Review[] = [];    // top 3 for "What People Say"
  reviewsLoading = false;
  reviewsError: string | null = null;

  // ===== Stats state =====
  stats: SiteStats | null = null;
  statsLoading = false;
  statsError: string | null = null;

  constructor(
    private jobSvc: JobService,
    private reviewSvc: ReviewService,
    private statsSvc: StatsService
  ) {}

  ngOnInit(): void {
    this.loadJobs();
    this.loadStats();
    this.loadReviews();
  }

  // ---------------- Jobs ----------------
  loadJobs(): void {
    this.loading = true;
    this.error = null;
    this.jobSvc.getAll().pipe(take(1)).subscribe({
      next: (list: Job[]) => {
        this.jobs = Array.isArray(list) ? list : [];
        // ensure shortDescription exists
        this.jobs.forEach(j => {
          if (!j.shortDescription) {
            const d = (j.description || '').trim();
            j.shortDescription =
              d.length > 160 ? d.slice(0, 160).replace(/\s+\S*$/, '') + '…' : d;
          }
        });
        this.computeFilterOptions();
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = (err as any)?.error?.message ?? 'Failed to load jobs';
      }
    });
  }

  private computeFilterOptions(): void {
    const locSet = new Set<string>();
    const catSet = new Set<string>();
    for (const j of this.jobs) {
      if (j.location) locSet.add(String(j.location).trim());
      const c = (j as any).category;
      if (c) catSet.add(String(c).trim());
    }
    this.locations = Array.from(locSet).sort((a,b) => a.localeCompare(b));
    this.categories = Array.from(catSet).sort((a,b) => a.localeCompare(b));
  }

  onSearch(): void {
    this.searched = true;
    const el = document.querySelector('.search-results, .no-results');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  clearFilters(): void {
    this.query = { title: '', location: '', category: '' };
    this.searched = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get filteredJobs(): Job[] {
    const q = (this.query.title || '').trim().toLowerCase();
    const loc = (this.query.location || '').trim();
    const cat = (this.query.category || '').trim();

    if (!this.searched) return [];

    return this.jobs.filter(job => {
      if (q) {
        const companyName =
          (job.company && (job.company as any).name) ||
          (job as any).companyName ||
          (typeof job.company === 'string' ? job.company : '');
        const hay = ((job.title || '') + ' ' + (companyName || '')).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (loc) {
        if (!job.location || String(job.location).trim() !== loc) return false;
      }
      if (cat) {
        const jc = (job as any).category ?? '';
        if (!jc || String(jc).trim() !== cat) return false;
      }
      return true;
    });
  }

  trackByJobId(index: number, job: Job) {
    return (job && (job as any).id) ?? index;
  }

  // ---------------- Reviews ----------------
  private loadReviews(): void {
    this.reviewsLoading = true;
    this.reviewsError = null;

    this.reviewSvc.listRecent(60).pipe(take(1)).subscribe({
      next: (items: any[]) => {
        const normalized: Review[] = (Array.isArray(items) ? items : [])
          .map(r => {
            const nameRaw =
              r.name ?? r.fullName ?? r.author ?? r.company ?? 'Anonymous';
            const msgRaw = r.message ?? r.text ?? '';

            const clean = (s: string) =>
              String(s)
                .replace(/\s+/g, ' ')
                .replace(/\s([,.;:!?])/g, '$1')
                .trim();

            return {
              id: r.id ?? r._id,
              name: clean(nameRaw),
              designation: r.designation ?? r.role ?? r.companyRole,
              message: clean(msgRaw),
              createdAt: r.createdAt ?? r.created_on ?? r.date
            } as Review;
          })
          .filter(r => !!r.message);

        // Sort newest first (fallback to original order if createdAt missing)
        normalized.sort((a, b) => {
          const ta = a.createdAt ? new Date(a.createdAt as any).getTime() : 0;
          const tb = b.createdAt ? new Date(b.createdAt as any).getTime() : 0;
          return tb - ta;
        });

        // De-dupe by message+name
        const seen = new Set<string>();
        const deduped: Review[] = [];
        for (const r of normalized) {
          const key = `${r.message}|||${r.name}`;
          if (!seen.has(key)) {
            seen.add(key);
            deduped.push(r);
          }
        }

        // Keep full list; template will show only 4 most recent
        this.reviewsRecent = deduped;
        // Highlight top 3 for "What People Say"
        this.reviewsTop = deduped.slice(0, 3);

        this.reviewsLoading = false;
      },
      error: (err) => {
        this.reviewsLoading = false;
        this.reviewsError = (err as any)?.error?.message ?? 'Failed to load reviews';
        this.reviewsRecent = [];
        this.reviewsTop = [];
      }
    });
  }

  // Exactly 4 recent items for the sidebar
  get reviewsRecentFour(): Review[] {
    return this.reviewsRecent.slice(0, 4);
  }

  trackByReview = (_: number, r: Review) => r.id ?? `${r.name}-${r.createdAt ?? ''}`;

  // ---------------- Stats ----------------
  private loadStats(): void {
    this.statsLoading = true;
    this.statsError = null;

    this.statsSvc.getOverview().pipe(take(1)).subscribe({
      next: (s) => {
        // Normalize any alternate backend field names
        this.stats = {
          activeJobs: (s as any).activeJobs ?? (s as any).jobs ?? 0,
          companies: (s as any).companies ?? (s as any).orgs ?? 0,
          jobSeekers: (s as any).jobSeekers ?? (s as any).users ?? 0,
          successRate: (s as any).successRate ?? (s as any).success ?? 0
        };
        this.statsLoading = false;
      },
      error: (err) => {
        this.statsLoading = false;
        this.statsError = (err as any)?.error?.message ?? 'Failed to load stats';
        this.stats = null;
      }
    });
  }

  // Format 5123 -> "5K+", 12500 -> "13K+", etc. (one decimal only when <10K)
  formatCompact(n?: number | null): string {
    if (n == null || isNaN(+n)) return '—';
    const num = +n;
    if (num >= 1000) {
      const k = num / 1000;
      const str = k >= 10 ? Math.round(k).toString() : (Math.round(k * 10) / 10).toString();
      return `${str}K+`;
    }
    return num.toLocaleString();
  }

  // Format 95 -> "95%"
  formatPercent(p?: number | null): string {
    if (p == null || isNaN(+p)) return '—';
    return `${Math.round(+p)}%`;
  }
}
