import { Review } from './review.model';

describe('Review', () => {
  it('should create an instance', () => {
    const review: Review = {
      id: 1,
      author: {} as any,
      company: {} as any,
      content: 'Great!',
      createdAt: '2025-09-15',
      approved: true,
    };
    expect(review).toBeTruthy();
  });
});
