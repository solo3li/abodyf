import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiFetch } from '../../services/api';

export const fetchExecutorServices = createAsyncThunk('services/fetchExecutorServices', async (_, { rejectWithValue }) => {
  try {
    return await apiFetch('/ExecutorServices/MyServices');
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const fetchServiceById = createAsyncThunk('services/fetchServiceById', async (id: string, { rejectWithValue }) => {
  try {
    return await apiFetch(`/ExecutorServices/${id}`);
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const createService = createAsyncThunk('services/createService', async ({ data, image }: { data: any, image?: any }, { rejectWithValue }) => {
  try {
    const service = await apiFetch('/ExecutorServices', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    });

    if (image) {
      const formData = new FormData();
      formData.append('file', {
        uri: image.uri,
        name: image.fileName || 'service.jpg',
        type: image.mimeType || 'image/jpeg',
      } as any);

      await apiFetch(`/ExecutorServices/${service.id}/Image`, {
        method: 'POST',
        body: formData,
      });
    }

    return service;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const updateService = createAsyncThunk('services/updateService', async ({ id, data, image }: { id: string, data: any, image?: any }, { rejectWithValue }) => {
  try {
    const service = await apiFetch(`/ExecutorServices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    });

    if (image) {
      const formData = new FormData();
      formData.append('file', {
        uri: image.uri,
        name: image.fileName || 'service.jpg',
        type: image.mimeType || 'image/jpeg',
      } as any);

      await apiFetch(`/ExecutorServices/${id}/Image`, {
        method: 'POST',
        body: formData,
      });
    }

    return service;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const submitServiceForReview = createAsyncThunk('services/submitServiceForReview', async (id: string, { rejectWithValue }) => {
  try {
    await apiFetch(`/ExecutorServices/${id}/Submit`, { method: 'POST' });
    return id;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const pauseService = createAsyncThunk('services/pauseService', async (id: string, { rejectWithValue }) => {
  try {
    await apiFetch(`/ExecutorServices/${id}/Pause`, { method: 'POST' });
    return id;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const resumeService = createAsyncThunk('services/resumeService', async (id: string, { rejectWithValue }) => {
  try {
    await apiFetch(`/ExecutorServices/${id}/Resume`, { method: 'POST' });
    return id;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

const servicesSlice = createSlice({
  name: 'services',
  initialState: {
    executorServices: [],
    currentService: null as any,
    loading: false,
    error: null as string | null,
    success: false,
  },
  reducers: {
    resetStatus: (state) => {
      state.success = false;
      state.error = null;
      state.currentService = null;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchExecutorServices.pending, (state) => { state.loading = true; });
    builder.addCase(fetchExecutorServices.fulfilled, (state, action) => { state.loading = false; state.executorServices = action.payload; });
    builder.addCase(fetchExecutorServices.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });

    builder.addCase(fetchServiceById.pending, (state) => { state.loading = true; });
    builder.addCase(fetchServiceById.fulfilled, (state, action) => { state.loading = false; state.currentService = action.payload; });
    builder.addCase(fetchServiceById.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });

    builder.addCase(createService.pending, (state) => { state.loading = true; state.success = false; });
    builder.addCase(createService.fulfilled, (state) => { state.loading = false; state.success = true; });
    builder.addCase(createService.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });

    builder.addCase(updateService.pending, (state) => { state.loading = true; state.success = false; });
    builder.addCase(updateService.fulfilled, (state) => { state.loading = false; state.success = true; });
    builder.addCase(updateService.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });
  },
});

export const { resetStatus } = servicesSlice.actions;
export default servicesSlice.reducer;
