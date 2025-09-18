import { AuthRequest } from './auth-request.model';

describe('AuthRequest', () => {
  it('should create an instance', () => {
    const req: AuthRequest = {
      username: 'user',
      email: 'user@example.com',
      password: 'pass',
    };
    expect(req).toBeTruthy();
  });
});
