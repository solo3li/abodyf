import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiFetch, setAuthToken, API_BASE_URL } from '../../services/api';

export interface User {
  id: string;
  name: string;
  fullName?: string;
  email: string;
  isExecutor: boolean;
  isAdmin: boolean;
  roles: string[];
  rating?: number;
  completedOrdersCount?: number;
  profilePicture?: string;
  university?: string;
  major?: string;
  bio?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
};

export const login = createAsyncThunk('auth/login', async (credentials: any, { rejectWithValue }) => {
  try {
    const data = await apiFetch('/Auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    return data;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const register = createAsyncThunk('auth/register', async (credentials: any, { rejectWithValue }) => {
  try {
    const data = await apiFetch('/Auth/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    return data;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const verifyOtp = createAsyncThunk('auth/verifyOtp', async (credentials: any, { rejectWithValue }) => {
  try {
    const data = await apiFetch('/Auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    return data;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const forgotPassword = createAsyncThunk('auth/forgotPassword', async (email: string, { rejectWithValue }) => {
  try {
    const data = await apiFetch('/Auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(email),
    });
    return data;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const resetPassword = createAsyncThunk('auth/resetPassword', async (data: any, { rejectWithValue }) => {
  try {
    const res = await apiFetch('/Auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const fetchMe = createAsyncThunk('auth/fetchMe', async (_, { rejectWithValue }) => {
  try {
    const data = await apiFetch('/Users/Me');
    return data;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (data: any, { rejectWithValue }) => {
  try {
    const response = await apiFetch('/Users/Profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const updateProfilePicture = createAsyncThunk('auth/updateProfilePicture', async (fileInfo: any, { rejectWithValue, getState }) => {
  try {
    const formData = new FormData();
    formData.append('file', {
      uri: fileInfo.uri,
      name: fileInfo.name || 'profile.jpg',
      type: fileInfo.type || 'image/jpeg',
    } as any);

    const state = getState() as any;
    const token = state.auth.token;
    
    const res = await fetch(API_BASE_URL + '/Users/ProfilePicture', {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    
    if (!res.ok) throw new Error('Upload failed');
    return await res.json();
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const deleteProfilePicture = createAsyncThunk('auth/deleteProfilePicture', async (_, { rejectWithValue }) => {
  try {
    await apiFetch('/Users/ProfilePicture', { method: 'DELETE' });
    return null;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      setAuthToken(action.payload);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      setAuthToken(null);
    },
    updateUserSync: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    }
  },
  extraReducers: (builder) => {
    builder.addCase(login.pending, (state) => { state.loading = true; state.error = null; });
    builder.addCase(login.fulfilled, (state, action) => {
      state.loading = false;
      state.token = action.payload.token;
      state.user = action.payload.user;
      setAuthToken(action.payload.token);
    });
    builder.addCase(login.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });

    builder.addCase(register.pending, (state) => { state.loading = true; state.error = null; });
    builder.addCase(register.fulfilled, (state, action) => {
      state.loading = false;
      state.token = action.payload.token;
      state.user = action.payload.user;
      setAuthToken(action.payload.token);
    });
    builder.addCase(register.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });
    
    builder.addCase(verifyOtp.pending, (state) => { state.loading = true; state.error = null; });
    builder.addCase(verifyOtp.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload;
    });
    builder.addCase(verifyOtp.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });

    builder.addCase(fetchMe.fulfilled, (state, action) => {
      state.user = { ...action.payload, name: action.payload.fullName };
    });

    builder.addCase(updateProfile.fulfilled, (state, action) => {
      state.user = { ...state.user, ...action.payload, name: action.payload.fullName };
    });

    builder.addCase(updateProfilePicture.fulfilled, (state, action) => {
      if (state.user) state.user.profilePicture = action.payload.imageUrl;
    });

    builder.addCase(deleteProfilePicture.fulfilled, (state) => {
      if (state.user) state.user.profilePicture = undefined;
    });
  },
});

export const { setToken, logout, updateUserSync } = authSlice.actions;
export default authSlice.reducer;
