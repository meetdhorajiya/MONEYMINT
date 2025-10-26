// mobile/store/slices/transactionSlice.ts

// 1. Import PayloadAction
import { createSlice, createAsyncThunk, ActionReducerMapBuilder, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../../api/client';

// --- THIS IS THE UPDATED INTERFACE ---
export interface Transaction {
  _id: string;
  user: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description?: string;
  date: string;
  customer?: string | null; // <-- CHANGED from ledger to customer
}

// --- This is the type for a NEW transaction ---
type NewTransaction = {
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description?: string;
  customer?: string | null; // <-- CHANGED from ledger
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

// --- ASYNC THUNKS (Unchanged) ---
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
  async (newTransaction: NewTransaction, { rejectWithValue }) => {
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
    async (transaction: Omit<Transaction, 'user' | 'date'>, { rejectWithValue }) => {
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
      
    // Generic loading/error handlers
    builder
      .addMatcher(
        (action) => action.type.endsWith('/pending') && action.type.startsWith('transactions/'),
        (state) => {
          if(state.status === 'idle') state.status = 'loading';
        }
      )
      // --- 2. THIS IS THE FIX ---
      // We explicitly type 'action' as PayloadAction<unknown>
      .addMatcher(
        (action) => action.type.endsWith('/rejected') && action.type.startsWith('transactions/'),
        (state, action: PayloadAction<unknown>) => {
          state.status = 'failed';
          // This is a safer way to get the error message
          if (typeof action.payload === 'string') {
            state.error = action.payload;
          } else if (action.payload && typeof action.payload === 'object' && 'message' in action.payload) {
             state.error = (action.payload as any).message;
          } else {
             state.error = 'An unknown error occurred';
          }
        }
      );
  },
});

export const { resetSelection } = transactionSlice.actions;
export default transactionSlice.reducer;