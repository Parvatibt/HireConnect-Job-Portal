// src/app/admin/manage-companies/manage-companies.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminSidebar } from '../../shared/admin-sidebar/admin-sidebar';
import { CompanyService } from '../../../service/company.service';
import { Company } from '../../../model/company.model';
import { finalize } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-manage-companies',
  standalone: true,
  imports: [CommonModule, RouterModule, AdminSidebar, FormsModule],
  templateUrl: './manage-companies.html',
  styleUrls: ['./manage-companies.css']
})
export class ManageCompaniesComponent implements OnInit {
  companies: Company[] = [];
  loading = false;
  error = '';

  // per-company action loading map
  companyActionLoading: Record<number, boolean> = {};

  // filters / search
  searchTerm = '';
  statusFilter: '' | 'verified' | 'pending' = '';
  createdFrom: string | null = null; // yyyy-mm-dd
  createdTo: string | null = null;

  constructor(private companyService: CompanyService) {}

  ngOnInit(): void {
    this.loadCompanies();
  }

  loadCompanies(): void {
    this.loading = true;
    this.error = '';
    this.companyService.list()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (data: Company[]) => {
          this.companies = data ?? [];
        },
        error: (err) => {
          console.error('Failed to load companies', err);
          this.error = 'Failed to load companies — check console for details.';
        }
      });
  }

  clearFilters() {
    this.searchTerm = '';
    this.statusFilter = '';
    this.createdFrom = null;
    this.createdTo = null;
  }

  onEdit(company: Company) {
    if (!company?.id) { alert('Company id not available.'); return; }
    const newName = prompt('Edit company name', company.name || '');
    if (newName == null) return;
    const trimmed = newName.trim();
    if (trimmed.length === 0) { alert('Name cannot be empty'); return; }

    this.companyActionLoading[company.id!] = true;
    const payload: Partial<Company> = { name: trimmed };
    this.companyService.update(company.id!, payload)
      .pipe(finalize(() => { delete this.companyActionLoading[company.id!]; }))
      .subscribe({
        next: (updated) => {
          const idx = this.companies.findIndex(c => c.id === updated.id);
          if (idx >= 0) this.companies[idx] = updated;
        },
        error: (err) => {
          console.error('Update failed', err);
          alert(err?.error?.message || err?.message || 'Update failed — check console.');
        }
      });
  }

  onDelete(company: Company) {
    if (!company?.id) { alert('Company id not available.'); return; }
    if (!confirm(`Delete company "${company.name}"? This action cannot be undone.`)) return;

    this.companyActionLoading[company.id!] = true;
    this.companyService.delete(company.id!)
      .pipe(finalize(() => { delete this.companyActionLoading[company.id!]; }))
      .subscribe({
        next: () => {
          this.companies = this.companies.filter(c => c.id !== company.id);
        },
        error: (err) => {
          console.error('Delete failed', err);
          alert(err?.error?.message || err?.message || 'Delete failed — check console.');
        }
      });
  }

  onVerify(company: Company) {
    if (!company?.id) { alert('Company id not available.'); return; }
    if (!confirm(`Mark "${company.name}" as verified?`)) return;

    this.companyActionLoading[company.id!] = true;
    this.companyService.verify(company.id!)
      .pipe(finalize(() => { delete this.companyActionLoading[company.id!]; }))
      .subscribe({
        next: (updated) => {
          const idx = this.companies.findIndex(c => c.id === updated.id);
          if (idx >= 0) this.companies[idx] = updated;
        },
        error: (err) => {
          console.error('Verify failed', err);
          alert(err?.error?.message || err?.message || 'Verify failed — check console.');
        }
      });
  }

  isActionLoading(company: Company | undefined): boolean {
    return !!(company && company.id && this.companyActionLoading[company.id]);
  }

  // Client-side filtering logic
  get filteredCompanies(): Company[] {
    const term = (this.searchTerm || '').trim().toLowerCase();
    const status = (this.statusFilter || '').toLowerCase();

    // parse createdFrom/to
    const fromTs = this.createdFrom ? Date.parse(this.createdFrom) : null;
    const toTs = this.createdTo ? Date.parse(this.createdTo) : null;

    return this.companies.filter(c => {
      // status filter
      if (status === 'verified' && !c.verified) return false;
      if (status === 'pending' && c.verified) return false;

      // created date filter
      if (fromTs || toTs) {
        const created = c.createdAt ? Date.parse(c.createdAt as any) : null;
        if (created == null) return false;
        if (fromTs && created < fromTs) return false;
        if (toTs && created > (toTs + 24*3600*1000 - 1)) return false; // include whole day
      }

      // search term: if numeric, match id; else match name substring
      if (!term) return true;
      const numeric = /^[0-9]+$/.test(term);
      if (numeric && c.id != null && c.id.toString() === term) return true;

      const hay = (c.name || '').toString().toLowerCase();
      return hay.indexOf(term) !== -1;
    });
  }

  trackById(_: number, item: Company) {
    return item.id ?? _;
  }
}
