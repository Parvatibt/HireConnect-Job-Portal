import { Application } from './application.model';

describe('Application', () => {
  it('should create an instance', () => {
    const app: Application = {
      id: 1,
      job: {} as any,
      candidate: {} as any,
      appliedAt: '2025-09-15',
      status: 'SUBMITTED',
      resumeUrl: 'resume.pdf',
      coverLetter: 'Cover letter text',
    };
    expect(app).toBeTruthy();
  });
});
