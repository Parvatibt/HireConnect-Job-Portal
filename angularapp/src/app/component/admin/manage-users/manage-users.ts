// src/app/component/admin/manage-users/manage-users.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminSidebar } from '../../shared/admin-sidebar/admin-sidebar';
import { UserService } from '../../../service/user.service';
import { User } from '../../../model/user.model';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [CommonModule, RouterModule, AdminSidebar, HttpClientModule, FormsModule],
  templateUrl: './manage-users.html',
  styleUrls: ['./manage-users.css']
})
export class ManageUsersComponent implements OnInit {
  users: UserView[] = [];
  loading = false;
  error = '';

  // search/filter state
  searchTerm: string = '';
  selectedRole: string = '';

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.error = '';
    this.userService.getAll().subscribe({
      next: (data: User[]) => {
        this.users = data.map(u => toUserView(u));
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load users', err);
        this.error = 'Failed to load users. See console for details.';
        this.loading = false;
      }
    });
  }

  // Edit dialog (keeps your original quick-prompt behavior)
  onEdit(u: UserView) {
    const newName = prompt('Edit full name for user ' + u.username, u.fullName);
    if (newName !== null) {
      u.fullName = newName.trim() || u.fullName;
      // TODO: call backend update endpoint when available
    }
  }

  onDelete(u: UserView) {
    if (!u.id) {
      alert('User id missing — cannot delete.');
      console.error('onDelete called with missing id', u);
      return;
    }
    if (!confirm(`Delete user "${u.username}"?`)) return;

    this.loading = true;
    console.log('Requesting delete for id=', u.id);
    this.userService.delete(u.id).subscribe({
      next: () => {
        console.log('Delete success for id=', u.id);
        this.users = this.users.filter(x => x.id !== u.id);
        this.loading = false;
      },
      error: err => {
        this.loading = false;
        console.error('Delete failed', err);
        const msg = err?.error?.message || err?.message || 'Delete failed — check console';
        alert(msg);
      }
    });
  }

  // Clear search
  clearSearch() {
    this.searchTerm = '';
    this.selectedRole = '';
  }

  // Provide a tracked, filtered list for the template
  get filteredUsers(): UserView[] {
    const term = (this.searchTerm || '').trim().toLowerCase();
    const roleFilter = (this.selectedRole || '').trim().toLowerCase();

    return this.users.filter(u => {
      // role filter
      if (roleFilter) {
        if (!u.primaryRole || u.primaryRole.toLowerCase() !== roleFilter) return false;
      }

      if (!term) return true;

      // If term is numeric, match id (exact) OR match other string fields
      const numeric = /^[0-9]+$/.test(term);
      if (numeric && u.id != null && u.id.toString() === term) return true;

      // match across username, fullName, companyName, primaryRole
      const fields = [
        u.username || '',
        u.fullName || '',
        u.companyName || '',
        u.primaryRole || ''
      ].join(' ').toLowerCase();

      return fields.indexOf(term) !== -1;
    });
  }

  // Roles dropdown options derived from loaded users
  uniqueRoles(): string[] {
    const set = new Set<string>();
    for (const u of this.users) {
      if (u.primaryRole) set.add(u.primaryRole);
    }
    return Array.from(set).sort();
  }

  trackById(index: number, item: UserView) {
    return item.id ?? index;
  }
}

/** Small view-model used only by this component */
type UserView = {
  id?: number;
  username: string;
  fullName: string;
  primaryRole?: string;
  companyName?: string;
};

/** Helper: build UserView from backend User */
function toUserView(u: User): UserView {
  const fn = u.firstName?.trim() ?? '';
  const ln = u.lastName?.trim() ?? '';
  const full = (fn + ' ' + ln).trim() || u.username;

  // derive companyName if backend provides either companyName or company object
  let companyName = '';
  if ((u as any).companyName) {
    companyName = (u as any).companyName;
  } else if ((u as any).company && (u as any).company.name) {
    companyName = (u as any).company.name;
  }

  let primaryRole = undefined;
  if (u.roles && u.roles.length > 0) {
    const name = (u.roles[0].name ?? '').toString();
    primaryRole = name.startsWith('ROLE_') ? name.replace(/^ROLE_/i, '') : name;
    primaryRole = primaryRole.toUpperCase();
  }

  return {
    id: u.id,
    username: u.username,
    fullName: full,
    primaryRole,
    companyName: companyName || undefined
  };
}
