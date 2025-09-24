import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './landing-page.html',
  styleUrls: ['./landing-page.css']
})
export class LandingPageComponent {
  query = { title: '', location: '', category: '' };
  locations = ['Remote','London','New York','Bangalore','Berlin'];
  categories = ['All','Engineering','Design','Product','Marketing','Sales'];
  trending = ['DESIGNER','PHP','DEVELOPER','iOS DEVELOPER','WEB','WEST LONDON','SENIOR ENGINEER','LINUX','iOS'];

  onSearch() {
    console.log('Search submitted:', this.query);
  }
}
