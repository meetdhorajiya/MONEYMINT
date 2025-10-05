import { createSlice, createAsyncThunk, ActionReducerMapBuilder } from '@reduxjs/toolkit';
import apiClient from '../../api/client';

export interface Transaction {
  _id: string;
  user: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description?: string;
  date: string;
  ledger: string;
}

interface TransactionState {
  items: Transaction[];
  selectedTransaction: Transaction | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: TransactionState = {
  items: [],
  selectedTransaction: null,
  status: 'idle',
  error: null,
};

// --- ASYNC THUNKS (no changes here) ---
export const fetchTransactions = createAsyncThunk(
  'transactions/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/transactions');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);
export const addTransaction = createAsyncThunk(
  'transactions/add',
  async (newTransaction: Omit<Transaction, '_id' | 'date' | 'user'>, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/transactions', newTransaction);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);
export const fetchTransactionById = createAsyncThunk(
  'transactions/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/transactions/${id}`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);
export const updateTransaction = createAsyncThunk(
    'transactions/update',
    async (transaction: Omit<Transaction, 'user'>, { rejectWithValue }) => {
        try {
            const { _id, ...data } = transaction;
            const response = await apiClient.put(`/transactions/${_id}`, data);
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response.data);
        }
    }
);
export const deleteTransaction = createAsyncThunk(
  'transactions/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/transactions/${id}`);
      return id; // Return the ID on success
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);


const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    // This new action clears the selected transaction and resets the status
    resetSelection: (state) => {
      state.selectedTransaction = null;
      state.status = 'idle';
    }
  },
  extraReducers: (builder: ActionReducerMapBuilder<TransactionState>) => {
    builder
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(addTransaction.fulfilled, (state, action) => {
        state.items = [action.payload, ...state.items];
      })
      .addCase(fetchTransactionById.pending, (state) => { 
        state.status = 'loading';
      })
      .addCase(fetchTransactionById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.selectedTransaction = action.payload;
      })
      .addCase(updateTransaction.fulfilled, (state, action) => {
        const index = state.items.findIndex(t => t._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        state.selectedTransaction = action.payload;
      })
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.items = state.items.filter(t => t._id !== action.payload);
        state.selectedTransaction = null;
      });
  },
});

// Export the new action
export const { resetSelection } = transactionSlice.actions;
export default transactionSlice.reducer;