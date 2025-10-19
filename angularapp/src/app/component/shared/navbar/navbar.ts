import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter, Subscription, interval } from 'rxjs';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../service/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  isTransparent = false;
  menuOpen = false;

  constructor(public router: Router, private auth: AuthService) {}

  get isLoggedIn(): boolean { return this.auth.isLoggedIn(); }
  get username(): string | null { return this.auth.getUsername(); }
  get role(): string | null { return this.auth.getRole(); }
  get candidate(): boolean { return this.auth.isCandidate(); }
  get recruiter(): boolean { return this.auth.isRecruiter(); }
  get admin(): boolean { return this.auth.getRole() === 'ADMIN'; }

  private navSub: Subscription | null = null;
  private pingSub: Subscription | null = null;

  ngOnInit() {
    this.updateTransparency(this.router.url);
    this.navSub = this.router.events
      .pipe(filter(evt => evt instanceof NavigationEnd))
      .subscribe((evt: any) => {
        const url = evt.urlAfterRedirects ?? evt.url;
        this.updateTransparency(url);
      });

    this.pingSub = interval(3000).subscribe(() => {});
  }

  ngOnDestroy() {
    this.navSub?.unsubscribe();
    this.pingSub?.unsubscribe();
  }

  goHome() {
    this.router.navigateByUrl('/');
  }

  isActive(path: string): boolean {
    const url = (this.router.url || '').split('?')[0].split('#')[0];
    return url === path || url.startsWith(path + '/');
  }

  private updateTransparency(rawUrl: string) {
    const url = (rawUrl || '').split('?')[0].split('#')[0];
    const transparentRoutes = ['/', '/landing', '/jobs', '/welcome', '/recruiter/welcome', '/companies'];
    this.isTransparent = transparentRoutes.some(route =>
      url === route || url.startsWith(route + '/')
    );
  }

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/sign-in');
    this.menuOpen = false;
  }

  toggleMenu(ev?: MouseEvent) {
    if (ev) { ev.stopPropagation(); }
    this.menuOpen = !this.menuOpen;
  }

  @HostListener('document:click')
  onDocClick() {
    this.menuOpen = false;
  }

  // Unified profile navigation for all roles
goToProfile(event?: MouseEvent) {
  if (event) event.preventDefault(); // prevents href="#" from reloading page

  if (this.auth.isCandidate()) {
    this.router.navigateByUrl('/candidate/profile');
  } else if (this.auth.isRecruiter()) {
    this.router.navigateByUrl('/recruiter/profile');
  } else if (this.admin) {
    this.router.navigateByUrl('/admin/profile');
  } else {
    this.router.navigateByUrl('/profile');
  }

  this.menuOpen = false;
}

// Helper to highlight active profile link properly
isProfileActive(): boolean {
  const url = this.router.url.split('?')[0];
  return (
    url.startsWith('/candidate/profile') ||
    url.startsWith('/recruiter/profile') ||
    url.startsWith('/admin/profile') ||
    url === '/profile'
  );
}


  getInitials(): string {
    const name = this.username?.trim() || '';
    if (!name) return 'U';
    const parts = name.split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  getAvatarBg(): string {
    const name = (this.username || 'User').toLowerCase();
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash) % 360;
    return `linear-gradient(135deg, hsl(${h} 70% 60%), hsl(${(h + 40) % 360} 60% 45%))`;
  }

  getAvatarUrl(): string | null {
    return null; // or this.auth.getAvatarUrl?.() ?? null;
  }

  getRoleLabel(): string {
    if (this.auth.isCandidate()) return 'Candidate';
    if (this.auth.isRecruiter()) return 'Recruiter';
    if (this.admin) return 'Admin';
    return '';
  }
}
