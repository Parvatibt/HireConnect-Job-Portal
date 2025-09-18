import { AdminSidebar } from '../../shared/admin-sidebar/admin-sidebar';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// correct relative path from admin-dashboard.ts

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, AdminSidebar],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboardComponent implements OnInit, AfterViewInit {
  isLoading = false;
  hasError = false;
  errorMessage = '';
  
  stats = {
    totalUsers: 0,
    totalJobs: 0,
    totalCompanies: 0,
    pendingReviews: 0
  };

  recentActivity: any[] = [];
  systemStatus: any[] = [];

  ngOnInit() {
    this.loadDashboardData();
  }

  ngAfterViewInit() {
    // Chart.js integration (if available)
    if ((window as any).Chart) {
      const ctx = (document.getElementById('adminStatsChart') as HTMLCanvasElement)?.getContext('2d');
      if (ctx) {
        new (window as any).Chart(ctx, {
          type: 'bar',
          data: {
            labels: ['Users', 'Jobs', 'Companies', 'Reviews'],
            datasets: [{
              label: 'Platform Stats',
              data: [this.stats.totalUsers, this.stats.totalJobs, this.stats.totalCompanies, this.stats.pendingReviews],
              backgroundColor: ['#667eea', '#f093fb', '#4facfe', '#43e97b']
            }]
          },
          options: {
            responsive: true,
            plugins: { legend: { display: false } }
          }
        });
      }
    }
  }

  async loadDashboardData() {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';

    try {
      await Promise.all([
        this.loadStats(),
        this.loadRecentActivity(),
        this.loadSystemStatus()
      ]);
    } catch (error) {
      this.hasError = true;
      this.errorMessage = 'Failed to load dashboard data. Please try again.';
      console.error('Dashboard loading error:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private async loadStats(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.stats = {
          totalUsers: Math.floor(Math.random() * 2000) + 1000,
          totalJobs: Math.floor(Math.random() * 500) + 200,
          totalCompanies: Math.floor(Math.random() * 150) + 50,
          pendingReviews: Math.floor(Math.random() * 50) + 10
        };
        resolve();
      }, 800);
    });
  }

  private async loadRecentActivity(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.recentActivity = [
          { type: 'new-user', title: 'New User Registration', description: 'John Doe registered as a candidate', time: this.getRandomTimeAgo() },
          { type: 'new-job', title: 'New Job Posted', description: 'Software Engineer position at TechCorp', time: this.getRandomTimeAgo() },
          { type: 'review', title: 'Review Submitted', description: 'New review for ABC Company pending approval', time: this.getRandomTimeAgo() },
          { type: 'company', title: 'Company Registration', description: 'XYZ Corp completed registration process', time: this.getRandomTimeAgo() },
          { type: 'new-user', title: 'User Profile Updated', description: 'Sarah Wilson updated her profile information', time: this.getRandomTimeAgo() }
        ];
        resolve();
      }, 600);
    });
  }

  private async loadSystemStatus(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.systemStatus = [
          { name: 'API Server', status: 'online' },
          { name: 'Database', status: 'online' },
          { name: 'Email Service', status: 'online' },
          { name: 'File Storage', status: Math.random() > 0.8 ? 'warning' : 'online' },
          { name: 'Cache Service', status: 'online' },
          { name: 'Search Engine', status: 'online' }
        ];
        resolve();
      }, 400);
    });
  }

  private getRandomTimeAgo(): string {
    const times = ['2 minutes ago','15 minutes ago','1 hour ago','2 hours ago','4 hours ago','1 day ago','2 days ago'];
    return times[Math.floor(Math.random() * times.length)];
  }

  refreshData() {
    this.loadDashboardData();
  }

  retryLoad() {
    this.loadDashboardData();
  }
}
