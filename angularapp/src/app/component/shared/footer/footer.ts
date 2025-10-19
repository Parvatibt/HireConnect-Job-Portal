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

    // otherwise visible on all non-admin pages
    this.visible = true;
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
