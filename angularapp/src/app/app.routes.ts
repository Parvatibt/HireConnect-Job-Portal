import { Routes } from '@angular/router';

// Dashboard
import { LandingPageComponent } from './component/user/landing-page/landing-page';

// Auth
import { SignIn } from './component/auth/sign-in/sign-in';
import { SignUp } from './component/auth/sign-up/sign-up';
import { ForgotPasswordComponent } from './component/auth/forgot-password/forgot-password';
import { ResetPasswordComponent } from './component/auth/reset-password/reset-password';

// Profiles
import { CandidateProfileComponent } from './component/user/Candidate/candidate-profile/candidate-profile';
import { RecruiterProfileComponent } from './component/user/recruiter/recruiter-profile/recruiter-profile';

// Jobs
import { JobsListComponent } from './component/user/job/jobs-list/jobs-list';
import { JobDetailsComponent } from './component/user/job/job-details/job-details';
import { JobApplyComponent } from './component/user/job/job-apply/job-apply';
import { JobPostComponent } from './component/user/job/job-post/job-post';
import { MyApplicationsComponent } from './component/user/job/my-applications/my-applications';

// Companies
import { CompanyListComponent } from './component/user/company/company-list/company-list';

// Admin
import { AdminLogin } from './component/admin/admin-login/admin-login';
import { AdminDashboardComponent } from './component/admin/admin-dashboard/admin-dashboard';
import { ManageCompaniesComponent } from './component/admin/manage-companies/manage-companies';
import { ManageJobsComponent } from './component/admin/manage-jobs/manage-jobs';
import { ManageUsersComponent } from './component/admin/manage-users/manage-users';
import { ReviewsModerationComponent } from './component/admin/reviews-moderation/reviews-moderation';

//Reviews
import { ReviewList } from './component/user/review/review-list/review-list';
import { ReviewForm } from './component/user/review/review-form/review-form';

export const routes: Routes = [
  // Default landing page
  { path: '', component: LandingPageComponent },

  

  // Auth
  { path: 'sign-in', component: SignIn },
  { path: 'sign-up', component: SignUp },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },

  // Profiles
  { path: 'candidate', component: CandidateProfileComponent },
  { path: 'recruiter', component: RecruiterProfileComponent },

  // Jobs
  { path: 'jobs', component: JobsListComponent },
  { path: 'jobs/:id', component: JobDetailsComponent },
  { path: 'job-apply/:id', component: JobApplyComponent },
  
  { path: 'post-job', component: JobPostComponent },
  { path: 'my-applications', component: MyApplicationsComponent },

  // Companies
  { path: 'companies', component: CompanyListComponent },

  // Reviews
  { path: 'review-list', component: ReviewList },
  { path: 'review-form', component: ReviewForm },

  // ✅ Admin routes (no layout)
  { path: 'admin-login', component: AdminLogin },
  { path: 'admin', component: AdminDashboardComponent },
  { path: 'admin/manage-companies', component: ManageCompaniesComponent },
  { path: 'admin/manage-jobs', component: ManageJobsComponent },
  { path: 'admin/manage-users', component: ManageUsersComponent },
  { path: 'admin/reviews-moderation', component: ReviewsModerationComponent },

  // Wildcard → redirect unknown paths
  { path: '**', redirectTo: '', pathMatch: 'full' }
];
