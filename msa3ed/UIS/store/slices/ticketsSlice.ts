import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiFetch } from '../../services/api';

export const fetchMyTickets = createAsyncThunk('tickets/fetchMyTickets', async (_, { rejectWithValue }) => {
  try {
    return await apiFetch('/Ticket');
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const fetchTicketById = createAsyncThunk('tickets/fetchById', async (id: string, { rejectWithValue }) => {
  try {
    return await apiFetch(`/Ticket/${id}`);
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const createTicket = createAsyncThunk('tickets/create', async (subject: string, { rejectWithValue }) => {
  try {
    return await apiFetch('/Ticket', {
      method: 'POST',
      body: JSON.stringify(subject)
    });
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const replyToTicket = createAsyncThunk('tickets/reply', async ({ id, content, attachment, attachmentType }: { id: string, content?: string, attachment?: any, attachmentType?: string }, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    if (content) formData.append('content', content);
    if (attachment) {
      formData.append('attachment', attachment as any);
      if (attachmentType) formData.append('attachmentType', attachmentType);
    }
    
    return await apiFetch(`/Ticket/${id}/Reply`, {
      method: 'POST',
      body: formData
    });
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

const ticketsSlice = createSlice({
  name: 'tickets',
  initialState: {
    myTickets: [],
    currentTicket: null as any,
    loading: false,
    error: null as string | null,
  },
  reducers: {
    addLocalTicketMessage: (state, action) => {
      if (state.currentTicket && state.currentTicket.messages) {
        state.currentTicket.messages.push(action.payload);
      }
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchMyTickets.pending, (state) => { state.loading = true; });
    builder.addCase(fetchMyTickets.fulfilled, (state, action) => { state.loading = false; state.myTickets = action.payload; });
    builder.addCase(fetchMyTickets.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });

    builder.addCase(fetchTicketById.pending, (state) => { state.loading = true; });
    builder.addCase(fetchTicketById.fulfilled, (state, action) => { state.loading = false; state.currentTicket = action.payload; });
    builder.addCase(fetchTicketById.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });
  },
});

export const { addLocalTicketMessage } = ticketsSlice.actions;
export default ticketsSlice.reducer;