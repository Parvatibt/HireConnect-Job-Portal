// src/app/admin/admin-dashboard/admin-dashboard.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AdminSidebar } from '../../shared/admin-sidebar/admin-sidebar';
import { UserService } from '../../../service/user.service';
import { JobService } from '../../../service/job.service';
import { CompanyService } from '../../../service/company.service';
import { ReviewService } from '../../../service/review.service';
import { HttpClientModule } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, AdminSidebar, HttpClientModule, RouterModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboardComponent implements OnInit {
  isLoading = false;
  hasError = false;
  errorMessage = '';

  stats = {
    totalUsers: 0,
    totalJobs: 0,
    totalCompanies: 0,
    pendingReviews: 0
  };

  constructor(
    private userService: UserService,
    private jobService: JobService,
    private companyService: CompanyService,
    private reviewService: ReviewService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.refreshData();
  }

  goToUserDashboard(): void {
    this.router.navigate(['/']); // ✅ navigates to LandingPageComponent
  }

  refreshData(): void {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';

    forkJoin({
      users: this.userService.getAll().pipe(catchError(() => of([]))),
      jobs: this.jobService.getAll().pipe(catchError(() => of([]))),
      companies: this.companyService.list({ size: 200 }).pipe(catchError(() => of([]))),
      reviews: this.reviewService.listRecent(200).pipe(catchError(() => of([])))
    })
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (res) => {
          this.stats.totalUsers = res.users.length;
          this.stats.totalJobs = res.jobs.length;
          this.stats.totalCompanies = res.companies.length;
          this.stats.pendingReviews = res.reviews.filter(
            (r: any) => !r.status || r.status.toUpperCase() === 'PENDING'
          ).length;
        },
        error: (err) => {
          console.error(err);
          this.hasError = true;
          this.errorMessage = 'Failed to load dashboard data.';
        }
      });
  }

  retryLoad(): void {
    this.refreshData();
  }
}
