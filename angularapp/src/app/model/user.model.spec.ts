import { User } from './user.model';

describe('User', () => {
  it('should create an instance', () => {
    const user: User = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      password: 'pass',
      firstName: 'Test',
      lastName: 'User',
      roles: [],
    };
    expect(user).toBeTruthy();
  });
});
