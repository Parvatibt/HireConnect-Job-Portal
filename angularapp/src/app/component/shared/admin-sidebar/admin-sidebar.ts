import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [RouterModule, FormsModule],
  templateUrl: './admin-sidebar.html',
  styleUrls: ['./admin-sidebar.css']
})
export class AdminSidebar {

  year = new Date().getFullYear();
  searchQuery: string = '';

  links = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: 'icon-dashboard' },
    { path: '/admin/manage-users', label: 'Users', icon: 'icon-users' },
    { path: '/admin/manage-jobs', label: 'Jobs', icon: 'icon-briefcase' },
    { path: '/admin/manage-companies', label: 'Companies', icon: 'icon-building' },
    { path: '/admin/reviews-moderation', label: 'Reviews', icon: 'icon-star' }
  ];
  filteredLinks() {
    if (!this.searchQuery) return this.links;
    return this.links.filter(link =>
      link.label.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  matchesSearch(label: string): boolean {
    return !this.searchQuery || label.toLowerCase().includes(this.searchQuery.toLowerCase());
  }
}
