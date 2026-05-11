import authReducer, { logout } from '../slices/authSlice';

describe('authSlice', () => {
  const initialState = {
    user: null,
    token: null,
    loading: false,
    error: null,
  };

  it('should handle initial state', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle logout', () => {
    const state = {
      user: { id: '1', name: 'Test User', email: 'test@test.com', isExecutor: false, isAdmin: false, roles: ['Student'] },
      token: 'mock-token',
      loading: false,
      error: null,
    };
    const actual = authReducer(state, logout());
    expect(actual.user).toBeNull();
    expect(actual.token).toBeNull();
  });

  it('should handle login.fulfilled', () => {
    const payload = {
      token: 'new-token',
      user: { id: '1', name: 'New User', email: 'test@uis.com', isExecutor: false, roles: ['Student'] }
    };
    const action = { type: 'auth/login/fulfilled', payload };
    const actual = authReducer(initialState, action);
    expect(actual.token).toBe('new-token');
    expect(actual.user).toEqual(payload.user);
    expect(actual.loading).toBe(false);
  });

  it('should handle register.fulfilled', () => {
    const payload = {
      token: 'reg-token',
      user: { id: '2', name: 'Reg User', email: 'reg@uis.com', isExecutor: false, roles: ['Student'] }
    };
    const action = { type: 'auth/register/fulfilled', payload };
    const actual = authReducer(initialState, action);
    expect(actual.token).toBe('reg-token');
    expect(actual.user).toEqual(payload.user);
    expect(actual.loading).toBe(false);
  });
});
