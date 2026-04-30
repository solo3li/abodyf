import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiFetch } from '../../services/api';

export const fetchKycStatus = createAsyncThunk('kyc/fetchStatus', async (_, { rejectWithValue }) => {
  try {
    return await apiFetch('/Kyc/Status');
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const submitKyc = createAsyncThunk('kyc/submit', async (data: { nationalId: string, phone: string, frontImage?: any, backImage?: any }, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    formData.append('nationalId', data.nationalId);
    formData.append('phone', data.phone);
    if (data.frontImage) formData.append('nationalIdFront', data.frontImage);
    if (data.backImage) formData.append('nationalIdBack', data.backImage);

    return await apiFetch('/Kyc', {
      method: 'POST',
      body: formData
    });
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

const kycSlice = createSlice({
  name: 'kyc',
  initialState: {
    status: null as string | null,
    rejectionReason: null as string | null,
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchKycStatus.pending, (state) => { state.loading = true; });
    builder.addCase(fetchKycStatus.fulfilled, (state, action) => { 
      state.loading = false; 
      state.status = action.payload?.status || null; 
      state.rejectionReason = action.payload?.rejectionReason || null;
    });
    builder.addCase(fetchKycStatus.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });

    builder.addCase(submitKyc.pending, (state) => { state.loading = true; });
    builder.addCase(submitKyc.fulfilled, (state) => { state.loading = false; state.status = 'Pending'; });
    builder.addCase(submitKyc.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });
  },
});

export default kycSlice.reducer;