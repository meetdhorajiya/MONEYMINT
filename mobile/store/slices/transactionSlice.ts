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

// --- ASYNC THUNKS ---

// Fetches the list of all transactions
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

// Adds a single new transaction
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

// Fetches one transaction by its ID for the details page
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

const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {},
  extraReducers: (builder: ActionReducerMapBuilder<TransactionState>) => {
    builder
      // Reducers for the list of transactions
      .addCase(fetchTransactions.pending, (state) => { 
        state.status = 'loading'; 
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as any)?.message || 'Failed to fetch transactions';
      })
      
      // Reducer for adding a transaction
      .addCase(addTransaction.fulfilled, (state, action) => {
        state.items = [action.payload, ...state.items];
      })

      // Reducers for fetching a single transaction for the details page
      .addCase(fetchTransactionById.pending, (state) => {
        state.status = 'loading';
        state.selectedTransaction = null;
      })
      .addCase(fetchTransactionById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.selectedTransaction = action.payload;
      });
  },
});

export default transactionSlice.reducer;