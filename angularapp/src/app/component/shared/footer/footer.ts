import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.html',
  styleUrls: ['./footer.css']
})
export class FooterComponent implements OnInit, OnDestroy {
  visible = true;
  private sub: Subscription | null = null;

  // Add any route patterns where you DON'T want footer visible
  private hiddenPaths = [
    '/forgot-password',
    '/reset-password'
    // admin paths handled by startsWith('/admin')
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    // initial visibility
    this.updateVisibility(this.router.url);

    // update on navigation
    this.sub = this.router.events
      .pipe(filter(evt => evt instanceof NavigationEnd))
      .subscribe((evt: any) => {
        const url = evt.urlAfterRedirects ?? evt.url;
        this.updateVisibility(url);
      });
  }

  private updateVisibility(rawUrl: string) {
    const url = (rawUrl || '').split('?')[0].split('#')[0];

    // hide on any admin pages
    if (url.startsWith('/admin')) {
      this.visible = false;
      return;
    }

    // hide on specific exact pages (forgot/reset)
    for (const p of this.hiddenPaths) {
      if (url === p || url === `${p}/`) {
        this.visible = false;
        return;
      }
    }

    // otherwise visible
    this.visible = true;
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
