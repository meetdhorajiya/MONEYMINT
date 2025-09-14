import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../api/client';

export interface Transaction {
  _id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description?: string;
  date: string;
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

export const fetchTransactions = createAsyncThunk('transactions/fetchTransactions', async (_, { rejectWithValue }) => {
  try {
    const response = await apiClient.get('/transactions');
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(error.response.data);
  }
});

export const addTransaction = createAsyncThunk('transactions/addTransaction', async (newTransaction: Omit<Transaction, '_id' | 'date'>, { rejectWithValue }) => {
    try {
        const response = await apiClient.post('/transactions', newTransaction);
        return response.data.data;
    } catch (error: any) {
        return rejectWithValue(error.response.data);
    }
});

const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    resetStatus: (state) => {
        state.status = 'idle';
        state.error = null;
    }
  },
  extraReducers: (builder) => {
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
        state.items.unshift(action.payload);
      });
  },
});

export const { resetStatus } = transactionSlice.actions;
export default transactionSlice.reducer;