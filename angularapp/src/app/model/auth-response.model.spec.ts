import { AuthResponse } from './auth-response.model';

describe('AuthResponse', () => {
  it('should create an instance', () => {
    const res: AuthResponse = {
      token: 'abc',
      user: {} as any,
    };
    expect(res).toBeTruthy();
  });
});
