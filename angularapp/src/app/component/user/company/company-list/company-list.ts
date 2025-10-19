import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Company } from '../../../../model/company.model';
import { Job } from '../../../../model/job.model';
import { CompanyService } from '../../../../service/company.service';
import { JobService } from '../../../../service/job.service';
import { RecruiterService } from '../../../../service/recruiter.service';
import { AuthService } from '../../../../service/auth.service';
import { take } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-company-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './company-list.html',
  styleUrls: ['./company-list.css']
})
export class CompanyListComponent implements OnInit, OnDestroy {
  companies: Company[] = [];
  jobs: Partial<Job>[] = [];
  statsMap: Record<number, {
    jobCount: number;
    avgSalaryText?: string;
    avgMin?: number | null;
    avgMax?: number | null;
    topRole?: string | null;
    recentPostCount?: number;
    jobsList?: Partial<Job>[];
  }> = {};

  loading = false;
  search = '';
  selectedCompany: Company | null = null;
  canEditCompany = false;

  private recruiterCompanyId: number | null = null;
  private recruiterCompanyName: string | null = null;
  private subs: Subscription[] = [];

  constructor(
    private companySvc: CompanyService,
    private jobSvc: JobService,
    private recruiterSvc: RecruiterService,
    private authSvc: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.refresh();
    this.loadRecruiterOwnership();

    // keep query param refresh behaviour intact
    this.route.queryParams.subscribe(params => {
      if (params['refresh'] === 'true') {
        this.refresh();
        this.router.navigate([], { queryParams: { refresh: null }, replaceUrl: true });
      }
    });
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  /** Load recruiter ownership (companyId + name) */
  private loadRecruiterOwnership(): void {
    if (!this.authSvc.isLoggedIn() || !this.authSvc.isRecruiter()) return;

    this.recruiterSvc.getMe().pipe(take(1)).subscribe({
      next: (profile) => {
        this.recruiterCompanyId = profile?.companyId ?? profile?.company?.id ?? null;
        this.recruiterCompanyName =
          profile?.companyName ?? profile?.company?.name ?? null;

        // Save for later quick access
        if (this.recruiterCompanyName) {
          localStorage.setItem('recruiterCompany', this.recruiterCompanyName);
        }
        if (this.recruiterCompanyId) {
          localStorage.setItem('recruiterCompanyId', String(this.recruiterCompanyId));
        }
        this.computeCanEditCompany();
      },
      error: (err) => {
        console.warn('Failed to fetch recruiter ownership info', err);
      }
    });
  }

  /**
   * Primary refresh method:
   * - Try companySvc.list()
   * - On error and when user is NOT logged in, try public fallbacks (listPublic, list({public:true}), listAll, getAll)
   * - This maximizes the chance that company list shows even when default endpoint requires auth
   */
  refresh(): void {
    this.loading = true;
    this.companies = [];
    this.jobs = [];
    this.statsMap = {};

    // helper to finalize loading state and recompute stats/canEdit flag
    const finalize = () => {
      // default selection logic if none selected yet
      if (!this.selectedCompany && this.companies.length) {
        const recruiterId = localStorage.getItem('recruiterCompanyId');
        const recruiterName = (localStorage.getItem('recruiterCompany') || '').toLowerCase();

        let match: Company | undefined;
        if (recruiterId) {
          match = this.companies.find(c => c.id?.toString() === recruiterId);
        }
        if (!match && recruiterName) {
          match = this.companies.find(c => c.name?.toLowerCase() === recruiterName);
        }
        this.selectedCompany = match || this.companies[0];
      }

      this.recomputeStats();
      this.loading = false;
      this.computeCanEditCompany();
    };

    // primary attempt
    this.companySvc.list({ size: 1000 }).pipe(take(1)).subscribe({
      next: (list: Company[]) => {
        this.companies = Array.isArray(list) ? list : [];
        finalize();
      },
      error: async (err) => {
        console.warn('companySvc.list failed', err);

        // If user is logged in, don't attempt public fallbacks (likely a real error)
        if (this.authSvc.isLoggedIn()) {
          this.loading = false;
          return;
        }

        // Try public fallback strategies in order. Use dynamic method checks to avoid TS errors if not present.
        const svcAny: any = this.companySvc as any;
        let tried = false;
        try {
          // 1) listPublic()
          if (typeof svcAny.listPublic === 'function') {
            tried = true;
            const listPublic = await svcAny.listPublic({ size: 1000 }).toPromise();
            this.companies = Array.isArray(listPublic) ? listPublic : [];
            finalize();
            return;
          }

          // 2) list({ public: true })
          if (typeof svcAny.list === 'function') {
            tried = true;
            // try calling with public flag - many APIs accept this param
            const maybe = await svcAny.list({ size: 1000, public: true }).toPromise();
            this.companies = Array.isArray(maybe) ? maybe : [];
            finalize();
            return;
          }

          // 3) listAll()
          if (typeof svcAny.listAll === 'function') {
            tried = true;
            const all = await svcAny.listAll().toPromise();
            this.companies = Array.isArray(all) ? all : [];
            finalize();
            return;
          }

          // 4) getAll()
          if (typeof svcAny.getAll === 'function') {
            tried = true;
            const all2 = await svcAny.getAll().toPromise();
            this.companies = Array.isArray(all2) ? all2 : [];
            finalize();
            return;
          }

        } catch (publicErr) {
          console.warn('Public fallback attempt failed', publicErr);
        }

        // If we reached here and didn't populate companies, show empty list but keep UI functional
        if (!tried) {
          console.warn('No public fallback method found on CompanyService. Please add a public endpoint on the backend (e.g., listPublic or accept { public: true }).');
        } else {
          console.warn('All public fallback attempts failed; companies could not be loaded without authentication.');
        }

        // Still attempt to load jobs (some parts of the UI rely on jobs for analytics)
        this.jobSvc.getAll().pipe(take(1)).subscribe({
          next: (list: Job[]) => {
            this.jobs = (Array.isArray(list) ? list : []).map(j => ({
              id: j.id,
              title: j.title,
              location: j.location,
              minSalary: j.minSalary ?? null,
              maxSalary: j.maxSalary ?? null,
              postedAt: (j as any).postedAt ?? (j as any).createdAt ?? null,
              company: j.company,
              companyId: (j as any).companyId ?? (j.company ? (j.company as any).id : undefined)
            }));
            this.recomputeStats();
          },
          error: (_e) => {
            // ignore
          },
          complete: () => {
            this.loading = false;
            this.computeCanEditCompany();
          }
        });
      }
    });

    // Also fetch jobs (for analytics) — attempt regardless (if this fails it's non-fatal)
    this.jobSvc.getAll().pipe(take(1)).subscribe({
      next: (list: Job[]) => {
        this.jobs = (Array.isArray(list) ? list : []).map(j => ({
          id: j.id,
          title: j.title,
          location: j.location,
          minSalary: j.minSalary ?? null,
          maxSalary: j.maxSalary ?? null,
          postedAt: (j as any).postedAt ?? (j as any).createdAt ?? null,
          company: j.company,
          companyId: (j as any).companyId ?? (j.company ? (j.company as any).id : undefined)
        }));
        this.recomputeStats();
      },
      error: (err) => console.warn('Failed to load jobs', err)
    });
  }

  /** Determine if the current user can edit the selected company */
  private computeCanEditCompany(): void {
    this.canEditCompany = false;

    if (!this.authSvc.isLoggedIn()) return;
    if (this.authSvc.isAdmin()) {
      this.canEditCompany = true;
      return;
    }

    if (this.authSvc.isRecruiter() && this.selectedCompany) {
      const selId = this.selectedCompany.id;
      const selName = this.selectedCompany.name?.trim().toLowerCase();

      const recId = this.recruiterCompanyId ?? Number(localStorage.getItem('recruiterCompanyId'));
      const recName = (this.recruiterCompanyName ?? localStorage.getItem('recruiterCompany') ?? '')
        .trim().toLowerCase();

      if (recId && selId && recId === selId) {
        this.canEditCompany = true;
        return;
      }
      if (selName && recName && selName === recName) {
        this.canEditCompany = true;
        return;
      }
    }
  }

  private recomputeStats(): void {
    this.statsMap = {};
    for (const c of this.companies) {
      if (c.id == null) continue;
      this.statsMap[c.id] = {
        jobCount: 0,
        avgSalaryText: '—',
        avgMin: null,
        avgMax: null,
        topRole: null,
        recentPostCount: 0,
        jobsList: []
      };
    }

    const now = new Date();
    for (const j of this.jobs) {
      const cid = Number((j as any).companyId ?? ((j.company as any)?.id ?? -1));
      if (!this.statsMap[cid]) continue;

      const s = this.statsMap[cid];
      s.jobCount = (s.jobCount ?? 0) + 1;
      s.jobsList!.push(j);

      if (typeof j.minSalary === 'number') s.avgMin = (s.avgMin ?? 0) + j.minSalary;
      if (typeof j.maxSalary === 'number') s.avgMax = (s.avgMax ?? 0) + j.maxSalary;

      if (j.postedAt) {
        const p = new Date(j.postedAt as any);
        const days = (now.getTime() - p.getTime()) / (1000 * 60 * 60 * 24);
        if (days <= 30) s.recentPostCount = (s.recentPostCount ?? 0) + 1;
      }
    }

    for (const key of Object.keys(this.statsMap)) {
      const s = this.statsMap[Number(key)];
      const count = s.jobCount || 0;
      if (count > 0) {
        if (s.avgMin != null) s.avgMin = Math.round((s.avgMin as number) / count);
        if (s.avgMax != null) s.avgMax = Math.round((s.avgMax as number) / count);
        s.avgSalaryText =
          s.avgMin || s.avgMax
            ? `₹${s.avgMin ?? '—'} - ₹${s.avgMax ?? '—'}`
            : '—';

        const titleCounts = new Map<string, number>();
        for (const j of s.jobsList || []) {
          const t = ((j.title ?? '') as string).toLowerCase();
          const key = t.split(/\s+/).slice(0, 2).join(' ').trim() || t;
          if (!key) continue;
          titleCounts.set(key, (titleCounts.get(key) ?? 0) + 1);
        }
        let top: string | null = null;
        let topCount = 0;
        for (const [k, v] of titleCounts.entries()) {
          if (v > topCount) {
            top = k;
            topCount = v;
          }
        }
        s.topRole = top
          ? top.split(' ').slice(0, 2).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
          : null;

        s.jobsList = (s.jobsList || []).sort((a, b) => {
          const pa = a.postedAt ? new Date(a.postedAt as any).getTime() : 0;
          const pb = b.postedAt ? new Date(b.postedAt as any).getTime() : 0;
          return pb - pa;
        }).slice(0, 8);
      }
    }
  }

  get filteredCompanies(): Company[] {
    const q = (this.search || '').trim().toLowerCase();
    if (!q) return this.companies;
    return this.companies.filter(c =>
      (c.name || '').toLowerCase().includes(q) ||
      (c.location || '').toLowerCase().includes(q)
    );
  }

  selectCompany(c: Company): void {
    this.selectedCompany = c;
    this.computeCanEditCompany();
    this.recomputeStats();
  }

  refreshSelected(): void {
    if (!this.selectedCompany?.id) return;
    this.companySvc.get(Number(this.selectedCompany.id)).pipe(take(1)).subscribe({
      next: (c) => {
        this.selectedCompany = c;
        this.computeCanEditCompany();
        this.recomputeStats();
      },
      error: (err) => console.warn('Failed to refresh company', err)
    });
  }

  trackByCompanyId(index: number, c: Company) {
    return c?.id ?? index;
  }

  onSearch(): void {
    const side = document.querySelector('.companies-sidebar');
    if (side) side.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
