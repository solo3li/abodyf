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
      user: { id: '1', name: 'Test' },
      token: 'token123',
      loading: false,
      error: null,
    };
    const actual = authReducer(state, logout());
    expect(actual.user).toBeNull();
    expect(actual.token).toBeNull();
  });
});
