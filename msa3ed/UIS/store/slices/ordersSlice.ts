import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiFetch } from '../../services/api';

export const fetchMyOrders = createAsyncThunk('orders/fetchMyOrders', async (_, { rejectWithValue }) => {
  try {
    return await apiFetch('/Orders');
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const fetchAvailableOrders = createAsyncThunk('orders/fetchAvailable', async (_, { rejectWithValue }) => {
  try {
    return await apiFetch('/Orders/Available');
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const fetchOrderById = createAsyncThunk('orders/fetchById', async (id: string, { rejectWithValue }) => {
  try {
    return await apiFetch(`/Orders/${id}`);
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const createOrder = createAsyncThunk('orders/create', async (data: { serviceId: string, price: number }, { rejectWithValue }) => {
  try {
    return await apiFetch('/Orders', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

const ordersSlice = createSlice({
  name: 'orders',
  initialState: {
    myOrders: [],
    availableOrders: [],
    currentOrder: null,
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchMyOrders.pending, (state) => { state.loading = true; });
    builder.addCase(fetchMyOrders.fulfilled, (state, action) => { state.loading = false; state.myOrders = action.payload; });
    builder.addCase(fetchMyOrders.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });

    builder.addCase(fetchAvailableOrders.pending, (state) => { state.loading = true; });
    builder.addCase(fetchAvailableOrders.fulfilled, (state, action) => { state.loading = false; state.availableOrders = action.payload; });
    builder.addCase(fetchAvailableOrders.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });

    builder.addCase(fetchOrderById.pending, (state) => { state.loading = true; });
    builder.addCase(fetchOrderById.fulfilled, (state, action) => { state.loading = false; state.currentOrder = action.payload; });
    builder.addCase(fetchOrderById.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });
  },
});

export default ordersSlice.reducer;