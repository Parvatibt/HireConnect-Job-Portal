import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router'; 
import { AuthService } from '../../../service/auth'; 

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule], 
  templateUrl: './login.html',   
  styleUrls: ['./login.css']     
})
export class LoginComponent {
  email = '';
  password = '';
  role: 'candidate' | 'employer' | 'admin' = 'candidate';
  showPassword = false;
  remember = false;
  message = '';

  constructor(private auth: AuthService, private router: Router) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    const username = this.email?.trim();
    if (!username || !this.password) {
      this.message = 'Please enter email and password';
      return;
    }

    this.auth.login(username, this.password).subscribe({
      next: (res) => {
        this.message = 'Login successful';
        this.router.navigate(['/']); 
      },
      error: (err) => {
        console.error(err);
        this.message = err?.error || 'Login failed';
      }
    });
  }
}
