import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

interface Room {
  _id: string;
  property: string;
  roomNumber: string;
  type: 'Private Bath' | 'Shared Bath' | 'Garage';
  status: 'Vacant' | 'Occupied';
  occupancyEndDate?: string;
  rent: number;
  description?: string;
}

interface RoomsState {
  rooms: Room[];
  loading: boolean;
  error: string | null;
}

const initialState: RoomsState = {
  rooms: [],
  loading: false,
  error: null,
};

export const fetchRooms = createAsyncThunk(
  'rooms/fetchRooms',
  async () => {
    const response = await axios.get('/api/rooms');
    return response.data;
  }
);

export const fetchRoomsByProperty = createAsyncThunk(
  'rooms/fetchRoomsByProperty',
  async (propertyId: string) => {
    const response = await axios.get(`/api/rooms/property/${propertyId}`);
    return response.data;
  }
);

export const addRoom = createAsyncThunk(
  'rooms/addRoom',
  async (room: Omit<Room, '_id'>) => {
    const response = await axios.post('/api/rooms', room);
    return response.data;
  }
);

export const updateRoom = createAsyncThunk(
  'rooms/updateRoom',
  async ({ id, room }: { id: string; room: Partial<Room> }) => {
    const response = await axios.put(`/api/rooms/${id}`, room);
    return response.data;
  }
);

export const deleteRoom = createAsyncThunk(
  'rooms/deleteRoom',
  async (id: string) => {
    await axios.delete(`/api/rooms/${id}`);
    return id;
  }
);

const roomsSlice = createSlice({
  name: 'rooms',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRooms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRooms.fulfilled, (state, action) => {
        state.loading = false;
        state.rooms = action.payload;
      })
      .addCase(fetchRooms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch rooms';
      })
      .addCase(fetchRoomsByProperty.fulfilled, (state, action) => {
        state.rooms = action.payload;
      })
      .addCase(addRoom.fulfilled, (state, action) => {
        state.rooms.push(action.payload);
      })
      .addCase(updateRoom.fulfilled, (state, action) => {
        const index = state.rooms.findIndex((r) => r._id === action.payload._id);
        if (index !== -1) {
          state.rooms[index] = action.payload;
        }
      })
      .addCase(deleteRoom.fulfilled, (state, action) => {
        state.rooms = state.rooms.filter((r) => r._id !== action.payload);
      });
  },
});

export default roomsSlice.reducer; 