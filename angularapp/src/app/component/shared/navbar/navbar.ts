import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  isTransparent = false;
  private sub: Subscription | null = null;

  constructor(private router: Router) {}

  ngOnInit() {
    // initial check
    this.updateTransparency(this.router.url);

    // update on navigation
    this.sub = this.router.events
      .pipe(filter(evt => evt instanceof NavigationEnd))
      .subscribe((evt: any) => {
        const url = evt.urlAfterRedirects ?? evt.url;
        this.updateTransparency(url);
      });
  }

  /**
   * Decide whether navbar should be transparent for the given URL.
   * Transparent on:
   *  - exact root "/"
   *  - any route starting with "/landing"
   *  - exact jobs list "/jobs"  (change to startsWith('/jobs') if you prefer job details also)
   */
  private updateTransparency(rawUrl: string) {
    const url = (rawUrl || '').split('?')[0].split('#')[0]; // strip query/hash
    // exact match for root
    if (url === '/') {
      this.isTransparent = true;
      return;
    }

    // landing area (any route starting with /landing)
    if (url.startsWith('/landing')) {
      this.isTransparent = true;
      return;
    }

    // jobs listing EXACT (if you want details pages transparent too, change to startsWith('/jobs'))
    if (url === '/jobs') {
      this.isTransparent = true;
      return;
    }

    // otherwise not transparent
    this.isTransparent = false;
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}
