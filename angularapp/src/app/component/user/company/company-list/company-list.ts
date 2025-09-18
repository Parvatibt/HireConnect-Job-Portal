import { Component } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-company-list',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule],
  templateUrl: './company-list.html',
  styleUrls: ['./company-list.css']
})
export class CompanyListComponent {
  companies = [
    { id: 1, name: 'Google', location: 'California', jobs: 25, description: 'A multinational technology company specializing in Internet-related services and products.' },
    { id: 2, name: 'Microsoft', location: 'Washington', jobs: 18, description: 'A multinational technology corporation that develops, manufactures, licenses, supports and sells computer software.' },
    { id: 3, name: 'Infosys', location: 'Bangalore', jobs: 40, description: 'A global leader in next-generation digital services and consulting.' },
    { id: 4, name: 'Amazon', location: 'Seattle', jobs: 35, description: 'An American multinational technology company focusing on e-commerce, cloud computing, and artificial intelligence.' },
    { id: 5, name: 'Facebook (Meta)', location: 'Menlo Park', jobs: 22, description: 'A social media and technology company that builds applications and technologies to help people connect.' },
    { id: 6, name: 'Apple', location: 'Cupertino', jobs: 15, description: 'An American multinational technology company that designs and manufactures consumer electronics and software.' },
    { id: 7, name: 'Tesla', location: 'Texas', jobs: 10, description: 'An electric vehicle and clean energy company with a mission to accelerate the world\'s transition to sustainable energy.' },
    { id: 8, name: 'Adobe', location: 'San Jose', jobs: 12, description: 'A multinational computer software company known for its creative and marketing software products.' },
    { id: 9, name: 'IBM', location: 'New York', jobs: 28, description: 'A multinational technology corporation that provides cloud computing, artificial intelligence, and business services.' },
    { id: 10, name: 'Wipro', location: 'Bangalore', jobs: 30, description: 'A leading global information technology, consulting and business process services company.' }
  ];

  searchTerm: string = '';

  get filteredCompanies() {
    if (!this.searchTerm.trim()) {
      return this.companies;
    }
    return this.companies.filter(c =>
      c.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      c.location.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  getTotalJobs(): number {
    return this.companies.reduce((total, company) => total + company.jobs, 0);
  }

  getUniqueLocations(): number {
    const locations = new Set(this.companies.map(company => company.location));
    return locations.size;
  }

  getCompanyTags(company: any): string[] {
    const tags = ['Technology', 'Innovation', 'Growth'];
    if (company.jobs > 30) {
      tags.push('Hiring');
    }
    if (company.name.includes('Google') || company.name.includes('Microsoft') || company.name.includes('Apple')) {
      tags.push('Fortune 500');
    }
    return tags;
  }
}
