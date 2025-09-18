import { Role } from './role.model';

describe('Role', () => {
  it('should create an instance', () => {
    const role: Role = {
      id: 1,
      name: 'Admin',
    };
    expect(role).toBeTruthy();
  });
});
