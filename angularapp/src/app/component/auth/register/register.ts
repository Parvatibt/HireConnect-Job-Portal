import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../service/auth'; 

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',   // ✅ keep your existing HTML filename
  styleUrls: ['./register.css']
})
export class RegisterComponent {
  role: 'candidate' | 'employer' = 'candidate';
  firstName = '';
  lastName = '';
  email = '';
  phone = '';
  password = '';
  confirmPassword = '';
  showPassword = false;
  showConfirmPassword = false;
  message = '';

  constructor(private auth: AuthService, private router: Router) {}

  togglePassword() { this.showPassword = !this.showPassword; }
  toggleConfirmPassword() { this.showConfirmPassword = !this.showConfirmPassword; }

  onRegister() {
    if (!this.email || !this.password) {
      this.message = 'Email and password are required';
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.message = 'Passwords do not match';
      return;
    }

    // We send username as email to backend. extra = candidate/employer
    const payload = {
      username: this.email.trim(),
      email: this.email.trim(),
      password: this.password,
      extra: this.role === 'employer' ? 'employer' : 'candidate'
    };

    this.auth.register(payload).subscribe({
      next: () => {
        this.message = 'Registered successfully — please login';
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error(err);
        this.message = err?.error || 'Registration failed';
      }
    });
  }
}
