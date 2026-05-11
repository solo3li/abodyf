import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiFetch } from '../../services/api';

export interface Service {
  id: string;
  title: string;
  description: string;
  basePrice: number;
  imageUrl?: string;
  categoryName: string;
  rating: number;
  reviewsCount: number;
  deliveryTime: string;
}

interface FavoritesState {
  items: Service[];
  loading: boolean;
  error: string | null;
  searchKeyword: string;
}

const initialState: FavoritesState = {
  items: [],
  loading: false,
  error: null,
  searchKeyword: '',
};

export const fetchFavorites = createAsyncThunk('favorites/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const data = await apiFetch('/Favorites');
    return data;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const toggleFavorite = createAsyncThunk('favorites/toggle', async (serviceId: string, { rejectWithValue }) => {
  try {
    const data = await apiFetch(`/Favorites/${serviceId}`, { method: 'POST' });
    return { serviceId, isFavorite: data.isFavorite };
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    setSearchKeyword: (state, action) => {
      state.searchKeyword = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchFavorites.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchFavorites.fulfilled, (state, action) => {
      state.loading = false;
      state.items = action.payload;
    });
    builder.addCase(fetchFavorites.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(toggleFavorite.fulfilled, (state, action) => {
      if (!action.payload.isFavorite) {
        state.items = state.items.filter(item => item.id !== action.payload.serviceId);
      }
      // Note: If adding, we usually re-fetch or the item should be provided in response
      // For now, toggle is mostly used from catalog, so this slice only manages the Favourites page list
    });
  },
});

export const { setSearchKeyword } = favoritesSlice.actions;
export default favoritesSlice.reducer;
