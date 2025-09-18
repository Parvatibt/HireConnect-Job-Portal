import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminSidebar } from '../../shared/admin-sidebar/admin-sidebar';

@Component({
  selector: 'app-manage-companies',
  standalone: true,
  imports: [CommonModule, RouterModule, AdminSidebar],
  templateUrl: './manage-companies.html',
  styleUrls: ['./manage-companies.css']
})
export class ManageCompaniesComponent {
  companies = [
    { id: 1, name: 'Google', status: 'Active' },
    { id: 2, name: 'Microsoft', status: 'Inactive' },
    { id: 3, name: 'Amazon', status: 'Active' }
  ];
}
