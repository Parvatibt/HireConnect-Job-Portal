import { Job } from './job.model';

describe('Job', () => {
  it('should create an instance', () => {
    const job: Job = {
      id: 1,
      title: 'Developer',
      description: 'Job desc',
      location: 'Remote',
      employmentType: 'Full-time',
      isActive: true,
      postedAt: '2025-09-15',
      company: {} as any,
      postedBy: {} as any,
    };
    expect(job).toBeTruthy();
  });
});
