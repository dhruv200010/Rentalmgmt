import { configureStore } from '@reduxjs/toolkit';
import propertiesReducer from '../features/properties/propertiesSlice';
import roomsReducer from '../features/rooms/roomsSlice';
import leadsReducer from '../features/leads/leadsSlice';

export const store = configureStore({
  reducer: {
    properties: propertiesReducer,
    rooms: roomsReducer,
    leads: leadsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 