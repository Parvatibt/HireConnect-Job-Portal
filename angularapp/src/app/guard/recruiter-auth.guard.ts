import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../service/auth.service';

@Injectable({ providedIn: 'root' })
export class RecruiterAuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    if (this.auth.isLoggedIn() && this.auth.isRecruiter()) {
      return true; // recruiter logged in → allow
    }
    // not recruiter or not logged in → send to recruiter welcome
    return this.router.parseUrl('/recruiter/welcome');
  }
}
