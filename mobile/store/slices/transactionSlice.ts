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
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: TransactionState = {
  items: [],
  status: 'idle',
  error: null,
};

export const fetchTransactions = createAsyncThunk(
  'transactions/fetchTransactions',
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
  'transactions/addTransaction',
  async (newTransaction: Omit<Transaction, '_id' | 'date' | 'user'>, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/transactions', newTransaction);
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
      .addCase(addTransaction.fulfilled, (state, action) => {
        // THIS IS THE FIX: Explicitly create a new array to guarantee a re-render.
        state.items = [action.payload, ...state.items];
      });
  },
});

export default transactionSlice.reducer;