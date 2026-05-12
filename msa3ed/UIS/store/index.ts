import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import catalogReducer from './slices/catalogSlice';
import ordersReducer from './slices/ordersSlice';
import chatReducer from './slices/chatSlice';
import ticketsReducer from './slices/ticketsSlice';
import kycReducer from './slices/kycSlice';
import favoritesReducer from './slices/favoritesSlice';
import servicesReducer from './slices/servicesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    catalog: catalogReducer,
    orders: ordersReducer,
    chat: chatReducer,
    tickets: ticketsReducer,
    kyc: kycReducer,
    favorites: favoritesReducer,
    services: servicesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
