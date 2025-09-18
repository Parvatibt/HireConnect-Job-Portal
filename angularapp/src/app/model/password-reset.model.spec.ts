import { PasswordReset } from './password-reset.model';

describe('PasswordReset', () => {
  it('should create an instance', () => {
    const reset: PasswordReset = {
      id: 1,
      userId: 2,
      token: 'token',
      expiresAt: '2025-09-15',
      used: false,
    };
    expect(reset).toBeTruthy();
  });
});
