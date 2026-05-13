import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import catalogReducer from './slices/catalogSlice';
import ordersReducer from './slices/ordersSlice';
import chatReducer from './slices/chatSlice';
import ticketsReducer from './slices/ticketsSlice';
import kycReducer from './slices/kycSlice';
import favoritesReducer from './slices/favoritesSlice';
import walletReducer from './slices/walletSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    catalog: catalogReducer,
    orders: ordersReducer,
    chat: chatReducer,
    tickets: ticketsReducer,
    kyc: kycReducer,
    favorites: favoritesReducer,
    wallet: walletReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
