import { Component, HostListener, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { filter } from 'rxjs/operators';

// Shared
import { NavbarComponent } from './component/shared/navbar/navbar';
import { FooterComponent } from './component/shared/footer/footer';
import { AdminSidebar } from './component/shared/admin-sidebar/admin-sidebar';

// Your interceptor (path relative to this file)
import { AuthInterceptor } from './interceptor/auth.interceptor';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, FooterComponent, AdminSidebar],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ]
})
export class AppComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit() {
    // set var on load + on navigation (handles route-changes that change navbar style)
    this.setNavbarCssVar();
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      // small delay to allow navbar rendering/layout (helps compute height reliably)
      setTimeout(() => this.setNavbarCssVar(), 50);
    });
  }

  // update the CSS variable with computed navbar height
  private setNavbarCssVar() {
    try {
      const nav = document.querySelector('.navbar');
      const height = nav ? Math.ceil(nav.getBoundingClientRect().height) : 72;
      document.documentElement.style.setProperty('--navbar-height', `${height}px`);
      // optional: also set body padding-top for older rules if needed
      // document.body.style.paddingTop = `${height}px`;
      // debug: uncomment if you need console logs
      // console.log('updated --navbar-height to', `${height}px`);
    } catch (e) {
      // ignore
    }
  }

  // keep your helper route checks
  isAdminRoute(): boolean {
    return this.router.url.startsWith('/admin');
  }
  isAdminLogin(): boolean {
    return this.router.url === '/admin';
  }
  isResetPasswordRoute(): boolean {
    return this.router.url.startsWith('/reset-password');
  }
  isLoginPage(): boolean {
    return this.router.url.includes('/sign-in') || this.router.url.includes('/admin');
  }
}
