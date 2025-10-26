// mobile/store/slices/reportSlice.ts

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../api/client'; // Your Axios client

interface ReportData {
  totalIncome: number;
  totalExpense: number;
}

interface ReportState {
  data: ReportData | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ReportState = {
  data: null,
  isLoading: false,
  error: null,
};

// Async thunk to fetch the report data from our new endpoint
export const fetchReportSummary = createAsyncThunk(
  'reports/fetchSummary',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get<ReportData>('/reports/summary');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch reports'
      );
    }
  }
);

const reportSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReportSummary.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReportSummary.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(fetchReportSummary.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default reportSlice.reducer;