import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../service/auth.service';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-sidebar.html',
  styleUrls: ['./admin-sidebar.css']
})
export class AdminSidebar {
  year = new Date().getFullYear();
  searchQuery: string = '';

  // Sidebar links
  links = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: 'icon-dashboard' },
    { path: '/admin/manage-users', label: 'Users', icon: 'icon-users' },
    { path: '/admin/manage-jobs', label: 'Jobs', icon: 'icon-briefcase' },
    { path: '/admin/manage-companies', label: 'Companies', icon: 'icon-building' },
    { path: '/admin/reviews-moderation', label: 'Reviews', icon: 'icon-star' }
  ];

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  // Return links filtered by search query
  get filteredLinks() {
    if (!this.searchQuery.trim()) return this.links;
    return this.links.filter(link =>
      link.label.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  // Logout clears auth info and redirects to admin login
  logout() {
    this.auth.logout();
    this.router.navigate(['/admin']);
  }
}
