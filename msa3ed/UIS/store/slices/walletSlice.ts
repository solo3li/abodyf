import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiFetch } from '../../services/api';

interface WalletTransaction {
    id: string;
    amount: number;
    type: string;
    description: string;
    createdAt: string;
}

interface WalletState {
    balance: number;
    currency: string;
    transactions: WalletTransaction[];
    loading: boolean;
    error: string | null;
}

const initialState: WalletState = {
    balance: 0,
    currency: 'ج.م',
    transactions: [],
    loading: false,
    error: null,
};

export const fetchWallet = createAsyncThunk(
    'wallet/fetchWallet',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiFetch('/Wallet');
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch wallet');
        }
    }
);

export const topUpWallet = createAsyncThunk(
    'wallet/topUpWallet',
    async (amount: number, { rejectWithValue, dispatch }) => {
        try {
            const response = await apiFetch('/Wallet/TopUp', {
                method: 'POST',
                body: JSON.stringify({ amount })
            });
            dispatch(fetchWallet()); // Refresh after top-up
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to top up wallet');
        }
    }
);

const walletSlice = createSlice({
    name: 'wallet',
    initialState,
    reducers: {
        clearWalletError(state) {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchWallet.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchWallet.fulfilled, (state, action) => {
                state.loading = false;
                state.balance = action.payload.balance;
                state.currency = action.payload.currency;
                state.transactions = action.payload.transactions;
            })
            .addCase(fetchWallet.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(topUpWallet.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(topUpWallet.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(topUpWallet.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearWalletError } = walletSlice.actions;
export default walletSlice.reducer;
