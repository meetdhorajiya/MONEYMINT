// mobile/store/slices/customerSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../../api/client';
import { fetchReportSummary } from './reportSlice'; // 1. Import report thunk
import { fetchTransactions } from './transactionSlice'; // 2. Import transaction thunk

// Interface (removed phone)
export interface ICustomer {
  _id: string;
  user: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface CustomerState {
  items: ICustomer[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: CustomerState = {
  items: [],
  status: 'idle',
  error: null,
};

// --- ASYNC THUNKS ---

export const fetchCustomers = createAsyncThunk(
  'customers/fetchAll',
  // ... (unchanged)
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/customers');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch customers');
    }
  }
);

export const addCustomer = createAsyncThunk(
  'customers/add',
  // ... (unchanged, no phone)
  async (customerData: { name: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/customers', customerData);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add customer');
    }
  }
);

export const updateCustomer = createAsyncThunk(
  'customers/update',
  // ... (unchanged, no phone)
  async (customer: Pick<ICustomer, '_id' | 'name'>, { rejectWithValue }) => {
    try {
      const { _id, ...data } = customer;
      const response = await apiClient.put(`/customers/${_id}`, data);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update customer');
    }
  }
);

// 4. Delete a customer
export const deleteCustomer = createAsyncThunk(
  'customers/delete',
  async (customerId: string, { dispatch, rejectWithValue }) => {
    try {
      await apiClient.delete(`/customers/${customerId}`);
      
      // --- 3. THIS IS THE FIX ---
      // After deleting, refresh reports and transactions
      dispatch(fetchReportSummary());
      dispatch(fetchTransactions());
      // --- END OF FIX ---

      return customerId; // Return the ID on success
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete customer');
    }
  }
);

// --- CUSTOMER SLICE ---
const customerSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // ... (all other builder cases are unchanged)
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCustomers.fulfilled, (state, action: PayloadAction<ICustomer[]>) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(addCustomer.fulfilled, (state, action: PayloadAction<ICustomer>) => {
        state.items.push(action.payload); 
        state.items.sort((a, b) => a.name.localeCompare(b.name));
      })
      .addCase(addCustomer.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(updateCustomer.fulfilled, (state, action: PayloadAction<ICustomer>) => {
        const index = state.items.findIndex(c => c._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload; 
        }
      })
      .addCase(updateCustomer.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(deleteCustomer.fulfilled, (state, action: PayloadAction<string>) => {
        state.items = state.items.filter(c => c._id !== action.payload); 
      })
      .addCase(deleteCustomer.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export default customerSlice.reducer;