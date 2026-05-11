import chatReducer, { fetchInbox } from '../slices/chatSlice';
import * as api from '../../services/api';

jest.mock('../../services/api');

describe('chatSlice', () => {
  it('should handle fetchInbox.fulfilled', () => {
    const initialState = {
      currentChat: null,
      inbox: [],
      loading: false,
      error: null,
    };
    
    const mockInbox = [
      { id: '1', partnerName: 'Test Partner', lastMessage: 'Hello' }
    ];

    const action = { type: fetchInbox.fulfilled.type, payload: mockInbox };
    const state = chatReducer(initialState, action);

    expect(state.inbox).toEqual(mockInbox);
    expect(state.loading).toBe(false);
  });

  it('should handle fetchInbox.pending', () => {
    const initialState = {
      currentChat: null,
      inbox: [],
      loading: false,
      error: null,
    };

    const action = { type: fetchInbox.pending.type };
    const state = chatReducer(initialState, action);

    expect(state.loading).toBe(true);
  });
});
