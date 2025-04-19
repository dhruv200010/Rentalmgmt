import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

interface Property {
  _id: string;
  name: string;
  address: string;
  description: string;
  rooms: string[];
}

interface PropertiesState {
  properties: Property[];
  loading: boolean;
  error: string | null;
}

const initialState: PropertiesState = {
  properties: [],
  loading: false,
  error: null,
};

export const fetchProperties = createAsyncThunk(
  'properties/fetchProperties',
  async () => {
    const response = await axios.get('/api/properties');
    return response.data;
  }
);

export const addProperty = createAsyncThunk(
  'properties/addProperty',
  async (property: Omit<Property, '_id' | 'rooms'>) => {
    const response = await axios.post('/api/properties', property);
    return response.data;
  }
);

export const updateProperty = createAsyncThunk(
  'properties/updateProperty',
  async ({ id, property }: { id: string; property: Partial<Property> }) => {
    const response = await axios.put(`/api/properties/${id}`, property);
    return response.data;
  }
);

export const deleteProperty = createAsyncThunk(
  'properties/deleteProperty',
  async (id: string) => {
    await axios.delete(`/api/properties/${id}`);
    return id;
  }
);

const propertiesSlice = createSlice({
  name: 'properties',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProperties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProperties.fulfilled, (state, action) => {
        state.loading = false;
        state.properties = action.payload;
      })
      .addCase(fetchProperties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch properties';
      })
      .addCase(addProperty.fulfilled, (state, action) => {
        state.properties.push(action.payload);
      })
      .addCase(updateProperty.fulfilled, (state, action) => {
        const index = state.properties.findIndex(
          (p) => p._id === action.payload._id
        );
        if (index !== -1) {
          state.properties[index] = action.payload;
        }
      })
      .addCase(deleteProperty.fulfilled, (state, action) => {
        state.properties = state.properties.filter(
          (p) => p._id !== action.payload
        );
      });
  },
});

export default propertiesSlice.reducer; 