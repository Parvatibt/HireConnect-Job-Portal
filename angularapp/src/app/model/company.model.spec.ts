import { Company } from './company.model';

describe('Company', () => {
  it('should create an instance', () => {
    const company: Company = {
      id: 1,
      name: 'Test Co',
      description: 'A company',
      logoUrl: 'logo.png',
      status: 'APPROVED',
      jobs: [],
    };
    expect(company).toBeTruthy();
  });
});
