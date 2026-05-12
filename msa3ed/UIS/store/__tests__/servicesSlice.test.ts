import servicesReducer, { resetStatus } from '../slices/servicesSlice';

describe('servicesSlice', () => {
  const initialState = {
    executorServices: [],
    currentService: null,
    loading: false,
    error: null,
    success: false,
  };

  it('should handle initial state', () => {
    expect(servicesReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle resetStatus', () => {
    const state = {
      ...initialState,
      success: true,
      error: 'some error',
      currentService: { id: '1' }
    };
    const actual = servicesReducer(state, resetStatus());
    expect(actual.success).toBe(false);
    expect(actual.error).toBeNull();
    expect(actual.currentService).toBeNull();
  });

  it('should handle fetchExecutorServices.fulfilled', () => {
    const payload = [{ id: '1', title: 'Service 1' }];
    const action = { type: 'services/fetchExecutorServices/fulfilled', payload };
    const actual = servicesReducer(initialState, action);
    expect(actual.executorServices).toEqual(payload);
    expect(actual.loading).toBe(false);
  });

  it('should handle createService.fulfilled', () => {
    const action = { type: 'services/createService/fulfilled' };
    const actual = servicesReducer(initialState, action);
    expect(actual.success).toBe(true);
    expect(actual.loading).toBe(false);
  });

  it('should handle fetchServiceById.fulfilled', () => {
    const payload = { id: '1', title: 'Service 1' };
    const action = { type: 'services/fetchServiceById/fulfilled', payload };
    const actual = servicesReducer(initialState, action);
    expect(actual.currentService).toEqual(payload);
    expect(actual.loading).toBe(false);
  });
});
