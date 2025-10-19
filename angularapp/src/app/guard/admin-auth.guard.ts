// src/app/guard/admin-auth.guard.ts
import { Injectable } from '@angular/core';
import {
  CanActivate,
  CanActivateChild,
  Router,
  UrlTree,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';
import { AuthService } from '../service/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminAuthGuard implements CanActivate, CanActivateChild {
  constructor(private auth: AuthService, private router: Router) {}

  /**
   * Central check used by both canActivate and canActivateChild.
   * Returns true when logged in + role is admin, otherwise returns a UrlTree to /admin.
   *
   * IMPORTANT: per your requirement we always redirect to /admin (login) when not permitted,
   * and we DO NOT preserve or use a returnUrl — login will always route to /admin/dashboard.
   */
  private check(stateUrl: string): boolean | UrlTree {
    const token = this.auth.getToken();
    const role = (this.auth.getRole() ?? '').toUpperCase();

    const loggedIn = !!token;
    const isAdmin = role === 'ROLE_ADMIN' || role === 'ADMIN';

    // Debug log to browser console — remove or reduce in production
    console.log('[AdminAuthGuard] attemptedUrl:', stateUrl, 'loggedIn:', loggedIn, 'role:', role);

    if (loggedIn && isAdmin) {
      return true;
    }

    // Not allowed: always redirect to admin login page (do not preserve returnUrl)
    return this.router.createUrlTree(['/admin']);
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    return this.check(state.url);
  }

  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    return this.check(state.url);
  }
}
