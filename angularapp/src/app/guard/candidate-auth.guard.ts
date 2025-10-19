// src/app/guard/candidate-auth.guard.ts
import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';
import { AuthService } from '../service/auth.service';

@Injectable({
  providedIn: 'root'
})
export class CandidateAuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    const returnUrl = state.url || '/';
    const loggedIn = !!this.auth.isLoggedIn();
    const isCandidate = !!this.auth.isCandidate();
    const profileComplete = !!this.auth.isProfileComplete();

    // 1) Not logged in -> force sign-up (preserve returnUrl)
    if (!loggedIn) {
      return this.router.createUrlTree(['/sign-up'], {
        queryParams: { returnUrl }
      });
    }

    // 2) Logged in but not a candidate -> block and send to home
    if (!isCandidate) {
      return this.router.createUrlTree(['/']);
    }

    // 3) At this point: logged in AND role is candidate
    // Determine if the requested route is the onboarding route
    const requestedUrl = (state.url || '').split('?')[0].split('#')[0];
    const isOnboardingRoute =
      requestedUrl === '/candidate/onboarding' || requestedUrl.endsWith('/candidate/onboarding');

    // 4) Profile incomplete: allow only onboarding; redirect other candidate routes to onboarding
    if (!profileComplete) {
      if (isOnboardingRoute) {
        return true; // allow onboarding
      }
      return this.router.createUrlTree(['/candidate/onboarding'], {
        queryParams: { returnUrl }
      });
    }

    // 5) Profile complete: disallow accessing onboarding; allow everything else
    if (profileComplete) {
      if (isOnboardingRoute) {
        return true
      }
      return true;
    }

    // Fallback: allow
    return true;
  }
}
