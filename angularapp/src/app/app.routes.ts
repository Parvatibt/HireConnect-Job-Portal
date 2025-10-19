import { Routes } from '@angular/router';

// Dashboard
import { LandingPageComponent } from './component/user/landing-page/landing-page';

// Auth
import { SignIn } from './component/auth/sign-in/sign-in';
import { SignUp } from './component/auth/sign-up/sign-up'; // adjust if path differs
import { ForgotPasswordComponent } from './component/auth/forgot-password/forgot-password';

// Recruiter
import { RecruiterDashboardComponent } from './component/user/recruiter/recruiter-dashboard/recruiter-dashboard';
import { RecruiterProfileComponent } from './component/user/recruiter/recruiter-profile/recruiter-profile';
import { RecruiterJobPostComponent } from './component/user/recruiter/recruiter-job-post/recruiter-job-post';


// Candidate
import { CandidateOnboardingComponent } from './component/user/Candidate/candidate-onboarding/candidate-onboarding';
import { CandidateApplicationsComponent } from './component/user/Candidate/candidate-applications/candidate-applications';
import { CandidateProfileComponent } from './component/user/Candidate/candidate-profile/candidate-profile';



// Guards
import { AdminAuthGuard } from './guard/admin-auth.guard';
import { CandidateAuthGuard } from './guard/candidate-auth.guard';
import { RecruiterAuthGuard } from './guard/recruiter-auth.guard';

// Jobs
import { JobsListComponent } from './component/user/job/jobs-list/jobs-list';
import { JobDetailsComponent } from './component/user/job/job-details/job-details';
import { JobApplyComponent } from './component/user/job/job-apply/job-apply';


// Companies
import { CompanyListComponent } from './component/user/company/company-list/company-list';
import { CompanyDetails } from './component/user/company/company-details/company-details';

// Admin
import { AdminLogin } from './component/admin/admin-login/admin-login';
import { AdminDashboardComponent } from './component/admin/admin-dashboard/admin-dashboard';
import { ManageCompaniesComponent } from './component/admin/manage-companies/manage-companies';
import { ManageJobsComponent } from './component/admin/manage-jobs/manage-jobs';
import { ManageUsersComponent } from './component/admin/manage-users/manage-users';
import { ReviewsModerationComponent } from './component/admin/reviews-moderation/reviews-moderation';

// Reviews
import { ReviewList } from './component/user/review/review-list/review-list';
import { ReviewForm } from './component/user/review/review-form/review-form';

//Footer
import { AboutComponent } from './component/shared/about/about';
import { PrivacyComponent } from './component/shared/privacy/privacy';

export const routes: Routes = [
  // Default landing page
  { path: '', component: LandingPageComponent },

  // Auth
  { path: 'sign-in', component: SignIn },
  { path: 'sign-up', component: SignUp },
  { path: 'forgot-password', component: ForgotPasswordComponent },

  // Candidate entry → redirect to profile
  { path: 'candidate', redirectTo: 'candidate/profile', pathMatch: 'full' },

  // Candidate routes (protected)
  { path: 'candidate/profile', component: CandidateProfileComponent, canActivate: [CandidateAuthGuard] },
  { path: 'candidate/onboarding', component: CandidateOnboardingComponent, canActivate: [CandidateAuthGuard] },
  { path: 'candidate/applications', component: CandidateApplicationsComponent, canActivate: [CandidateAuthGuard] },



  // Recruiter entry (decide profile/dashboard)
  { path: 'recruiter', canActivate: [RecruiterAuthGuard], children: [
      { path: '', redirectTo: 'profile', pathMatch: 'full' },
      { path: 'dashboard', component: RecruiterDashboardComponent, canActivate: [RecruiterAuthGuard] },
      { path: 'profile', component: RecruiterProfileComponent, canActivate: [RecruiterAuthGuard] },

      // Allow create and edit (optional id)
      { path: 'post-job', component: RecruiterJobPostComponent, canActivate: [RecruiterAuthGuard] },
      { path: 'post-job/:id', component: RecruiterJobPostComponent, canActivate: [RecruiterAuthGuard] },
  ]},

  // Jobs
  { path: 'jobs', component: JobsListComponent },
  { path: 'jobs/:id', component: JobDetailsComponent },
  { path: 'job-apply/:id', component: JobApplyComponent },


  // Companies
  { path: 'companies', component: CompanyListComponent },
  { path: 'companies/:id', component: CompanyDetails },

  // Reviews
  { path: 'review-list', component: ReviewList },
  { path: 'review-form', component: ReviewForm },

  // Admin
  { path: 'admin', component: AdminLogin },
  { path: 'admin/dashboard', component: AdminDashboardComponent, canActivate: [AdminAuthGuard] },
  { path: 'admin/manage-companies', component: ManageCompaniesComponent, canActivate: [AdminAuthGuard] },
  { path: 'admin/manage-jobs', component: ManageJobsComponent, canActivate: [AdminAuthGuard] },
  { path: 'admin/manage-users', component: ManageUsersComponent, canActivate: [AdminAuthGuard] },
  { path: 'admin/reviews-moderation', component: ReviewsModerationComponent, canActivate: [AdminAuthGuard] },

  //footer
  { path: 'about', component: AboutComponent },
  { path: 'privacy', component: PrivacyComponent },



  // Wildcard → redirect unknown paths
  { path: '**', redirectTo: '', pathMatch: 'full' }
];
