import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiFetch } from '../../services/api';

export const fetchCategories = createAsyncThunk('catalog/fetchCategories', async (_, { rejectWithValue }) => {
  try {
    return await apiFetch('/Categories');
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const fetchServices = createAsyncThunk('catalog/fetchServices', async (params: { search?: string, categoryId?: string, minPrice?: number, maxPrice?: number, sortBy?: string } = {}, { rejectWithValue }) => {
  try {
    let queryParts = [];
    if (params.search) queryParts.push(`search=${encodeURIComponent(params.search)}`);
    if (params.categoryId) queryParts.push(`categoryId=${params.categoryId}`);
    if (params.minPrice) queryParts.push(`minPrice=${params.minPrice}`);
    if (params.maxPrice) queryParts.push(`maxPrice=${params.maxPrice}`);
    if (params.sortBy) queryParts.push(`sortBy=${params.sortBy}`);
    
    const queryString = queryParts.length > 0 ? '?' + queryParts.join('&') : '';
    return await apiFetch(`/Services${queryString}`);
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const fetchServiceById = createAsyncThunk('catalog/fetchServiceById', async (id: string, { rejectWithValue }) => {
  try {
    return await apiFetch(`/Services/${id}`);
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

const catalogSlice = createSlice({
  name: 'catalog',
  initialState: {
    categories: [],
    services: [],
    currentService: null,
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchCategories.pending, (state) => { state.loading = true; });
    builder.addCase(fetchCategories.fulfilled, (state, action) => { state.loading = false; state.categories = action.payload; });
    builder.addCase(fetchCategories.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });

    builder.addCase(fetchServices.pending, (state) => { state.loading = true; });
    builder.addCase(fetchServices.fulfilled, (state, action) => { state.loading = false; state.services = action.payload; });
    builder.addCase(fetchServices.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });

    builder.addCase(fetchServiceById.pending, (state) => { state.loading = true; });
    builder.addCase(fetchServiceById.fulfilled, (state, action) => { state.loading = false; state.currentService = action.payload; });
    builder.addCase(fetchServiceById.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });
  },
});

export default catalogSlice.reducer;