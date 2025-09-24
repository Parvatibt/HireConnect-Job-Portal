import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sign-in.html',
  styleUrls: ['./sign-in.css']
})
export class SignIn {
  // fields
  username: string = '';
  password: string = '';
  remember: boolean = false;

  // role default
  role: 'candidate' | 'recruiter' = 'candidate';

  constructor(){}

  setRole(r: 'candidate' | 'recruiter') {
    this.role = r;
  }

  onSubmit() {
    if (!this.username || !this.password) {
      alert('Please enter username and password.');
      return;
    }

    // send data to backend auth service (replace console.log with real call)
    const payload = {
      username: this.username,
      password: this.password,
      role: this.role,
      remember: this.remember
    };
    console.log('Login payload:', payload);

    // temporary success feedback
    alert('Login attempt: ' + this.role + ' — ' + this.username);
  }
}
