import { AdminSidebar } from './component/shared/admin-sidebar/admin-sidebar';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FooterComponent } from './component/shared/footer/footer';

// add your components
import { NavbarComponent } from './component/shared/navbar/navbar';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, AdminSidebar, FooterComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent {
  constructor(private router: Router) {}

  isAdminRoute(): boolean {
    return this.router.url.startsWith('/admin');
  }
   isResetPasswordRoute(): boolean {
    return this.router.url.startsWith('/reset-password');
  }
  isLoginPage(): boolean {
    return this.router.url.includes('/admin-login');
  }
}

