import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiFetch } from '../../services/api';

export interface SearchFilter {
  keyword: string;
  categoryId?: string;
  subCategoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  availability?: string; // 'available_now' | undefined
  deliveryDays?: number;
  sortBy?: string; // 'rating' | 'price_asc' | 'price_desc' | 'newest'
}

export interface ServiceSearchResult {
  id: string;
  title: string;
  description: string;
  basePrice: number;
  rating: number;
  reviewsCount: number;
  estimatedDeliveryDays: number;
  category: { id: string; name: string };
  subCategory?: { id: string; name: string } | null;
  executor?: {
    id: string;
    name: string;
    avatar?: string;
    rating: number;
    isAvailableNow: boolean;
  } | null;
  imageUrl?: string;
  status: string;
}

interface SearchState {
  filters: SearchFilter;
  results: ServiceSearchResult[];
  totalCount: number;
  page: number;
  pageSize: number;
  loading: boolean;
  error?: string;
}

const initialFilters: SearchFilter = { keyword: '' };

const initialState: SearchState = {
  filters: initialFilters,
  results: [],
  totalCount: 0,
  page: 1,
  pageSize: 20,
  loading: false,
};

export const searchServices = createAsyncThunk(
  'search/searchServices',
  async ({ filters, page = 1 }: { filters: SearchFilter; page?: number }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters.keyword) params.append('keyword', filters.keyword);
      if (filters.categoryId) params.append('categoryId', filters.categoryId);
      if (filters.subCategoryId) params.append('subCategoryId', filters.subCategoryId);
      if (filters.minPrice != null) params.append('minPrice', String(filters.minPrice));
      if (filters.maxPrice != null) params.append('maxPrice', String(filters.maxPrice));
      if (filters.minRating != null) params.append('minRating', String(filters.minRating));
      if (filters.availability) params.append('availability', filters.availability);
      if (filters.deliveryDays != null) params.append('deliveryDays', String(filters.deliveryDays));
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      params.append('page', String(page));

      return await apiFetch(`/ExecutorServices/Search?${params.toString()}`);
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setFilter(state, action: PayloadAction<Partial<SearchFilter>>) {
      state.filters = { ...state.filters, ...action.payload };
      state.page = 1; // reset page on filter change
    },
    removeFilter(state, action: PayloadAction<keyof SearchFilter>) {
      const key = action.payload;
      if (key === 'keyword') {
        state.filters.keyword = '';
      } else {
        state.filters[key] = undefined as any;
      }
      state.page = 1;
    },
    clearAllFilters(state) {
      state.filters = initialFilters;
      state.page = 1;
      state.results = [];
      state.totalCount = 0;
    },
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchServices.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(searchServices.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload.items ?? [];
        state.totalCount = action.payload.totalCount ?? 0;
        state.page = action.payload.page ?? 1;
      })
      .addCase(searchServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setFilter, removeFilter, clearAllFilters, setPage } = searchSlice.actions;

// Selectors
export const selectActiveFilterCount = (state: { search: SearchState }) => {
  const f = state.search.filters;
  return [
    f.keyword,
    f.categoryId,
    f.subCategoryId,
    f.minPrice,
    f.maxPrice,
    f.minRating,
    f.availability,
    f.deliveryDays,
    f.sortBy,
  ].filter(Boolean).length;
};

export default searchSlice.reducer;
