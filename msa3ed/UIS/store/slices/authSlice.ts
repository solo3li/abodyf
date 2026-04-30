import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiFetch, setAuthToken } from '../../services/api';

export interface User {
  id: string;
  name: string;
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
      setAuthToken(action.payload.token);
    });
    builder.addCase(login.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });
    
    builder.addCase(verifyOtp.pending, (state) => { state.loading = true; state.error = null; });
    builder.addCase(verifyOtp.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload;
    });
    builder.addCase(verifyOtp.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });

    builder.addCase(fetchMe.fulfilled, (state, action) => {
      state.user = { ...action.payload, name: action.payload.fullName };
    });
  },
});

export const { setToken, logout, updateUserSync } = authSlice.actions;
export default authSlice.reducer;