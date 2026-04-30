import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiFetch } from '../../services/api';

export const fetchOrderChat = createAsyncThunk('chat/fetchOrderChat', async (orderId: string, { rejectWithValue }) => {
  try {
    return await apiFetch(`/Chat/Order/${orderId}`);
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const fetchPrivateChat = createAsyncThunk('chat/fetchPrivateChat', async (userId: string, { rejectWithValue }) => {
  try {
    return await apiFetch(`/Chat/Private/${userId}`);
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const sendMessage = createAsyncThunk('chat/sendMessage', async ({ chatId, content, attachment, attachmentType }: { chatId: string, content?: string, attachment?: any, attachmentType?: string }, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    if (content) formData.append('content', content);
    if (attachment) {
      formData.append('attachment', attachment as any);
      if (attachmentType) formData.append('attachmentType', attachmentType);
    }
    
    return await apiFetch(`/Chat/${chatId}/Message`, {
      method: 'POST',
      body: formData
    });
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    currentChat: null as any,
    loading: false,
    error: null as string | null,
  },
  reducers: {
    addLocalMessage: (state, action) => {
      if (state.currentChat && state.currentChat.messages) {
        state.currentChat.messages.push(action.payload);
      }
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchOrderChat.pending, (state) => { state.loading = true; });
    builder.addCase(fetchOrderChat.fulfilled, (state, action) => { state.loading = false; state.currentChat = action.payload; });
    builder.addCase(fetchOrderChat.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });

    builder.addCase(fetchPrivateChat.pending, (state) => { state.loading = true; });
    builder.addCase(fetchPrivateChat.fulfilled, (state, action) => { state.loading = false; state.currentChat = action.payload; });
    builder.addCase(fetchPrivateChat.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });
  },
});

export const { addLocalMessage } = chatSlice.actions;
export default chatSlice.reducer;