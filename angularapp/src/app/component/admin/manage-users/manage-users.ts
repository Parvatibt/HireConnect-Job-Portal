import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminSidebar } from '../../shared/admin-sidebar/admin-sidebar';

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [CommonModule, RouterModule, AdminSidebar],
  templateUrl: './manage-users.html',
  styleUrl: './manage-users.css'
})
export class ManageUsersComponent {
  users = [
    { id: 1, name: 'Alice', role: 'Candidate' },
    { id: 2, name: 'Bob', role: 'Recruiter' }
  ];
}
