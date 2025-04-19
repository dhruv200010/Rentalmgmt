import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

interface Lead {
  _id: string;
  name: string;
  contactNumber: string;
  source: 'Roomies' | 'Facebook' | 'Roomster' | 'Telegram' | 'Sulekha' | 'WhatsApp' | 'Others';
  status: 'New' | 'Hot' | 'Lease' | 'Landed' | 'Deny';
  property?: string;
  room?: string;
  reminderDate?: string;
  notes?: string;
}

interface LeadsState {
  leads: Lead[];
  loading: boolean;
  error: string | null;
}

const initialState: LeadsState = {
  leads: [],
  loading: false,
  error: null,
};

export const fetchLeads = createAsyncThunk(
  'leads/fetchLeads',
  async () => {
    const response = await axios.get('/api/leads');
    return response.data;
  }
);

export const fetchLeadsByProperty = createAsyncThunk(
  'leads/fetchLeadsByProperty',
  async (propertyId: string) => {
    const response = await axios.get(`/api/leads/property/${propertyId}`);
    return response.data;
  }
);

export const fetchLeadsByStatus = createAsyncThunk(
  'leads/fetchLeadsByStatus',
  async (status: Lead['status']) => {
    const response = await axios.get(`/api/leads/status/${status}`);
    return response.data;
  }
);

export const fetchLeadsWithReminders = createAsyncThunk(
  'leads/fetchLeadsWithReminders',
  async () => {
    const response = await axios.get('/api/leads/reminders');
    return response.data;
  }
);

export const addLead = createAsyncThunk(
  'leads/addLead',
  async (lead: Omit<Lead, '_id'>) => {
    const response = await axios.post('/api/leads', lead);
    return response.data;
  }
);

export const updateLead = createAsyncThunk(
  'leads/updateLead',
  async ({ id, lead }: { id: string; lead: Partial<Lead> }) => {
    const response = await axios.put(`/api/leads/${id}`, lead);
    return response.data;
  }
);

export const deleteLead = createAsyncThunk(
  'leads/deleteLead',
  async (id: string) => {
    await axios.delete(`/api/leads/${id}`);
    return id;
  }
);

const leadsSlice = createSlice({
  name: 'leads',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeads.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeads.fulfilled, (state, action) => {
        state.loading = false;
        state.leads = action.payload;
      })
      .addCase(fetchLeads.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch leads';
      })
      .addCase(fetchLeadsByProperty.fulfilled, (state, action) => {
        state.leads = action.payload;
      })
      .addCase(fetchLeadsByStatus.fulfilled, (state, action) => {
        state.leads = action.payload;
      })
      .addCase(fetchLeadsWithReminders.fulfilled, (state, action) => {
        state.leads = action.payload;
      })
      .addCase(addLead.fulfilled, (state, action) => {
        state.leads.push(action.payload);
      })
      .addCase(updateLead.fulfilled, (state, action) => {
        const index = state.leads.findIndex((l) => l._id === action.payload._id);
        if (index !== -1) {
          state.leads[index] = action.payload;
        }
      })
      .addCase(deleteLead.fulfilled, (state, action) => {
        state.leads = state.leads.filter((l) => l._id !== action.payload);
      });
  },
});

export default leadsSlice.reducer; 