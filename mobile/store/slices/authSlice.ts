import { createSlice, createAsyncThunk, PayloadAction, ActionReducerMapBuilder } from '@reduxjs/toolkit';
import * as SecureStore from 'expo-secure-store';
import apiClient from '../../api/client';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
}

const initialState: AuthState = {
  token: null,
  isAuthenticated: false,
  isLoading: true,
  user: null,
};

// --- ASYNC THUNKS ---

export const changeEmail = createAsyncThunk(
  'auth/changeEmail',
  async (data: { newEmail: string, currentPassword: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/user/change-email', data);
      return response.data.user; // Return the updated user object
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (data: { currentPassword: string, newPassword: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/user/change-password', data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteAccount = createAsyncThunk(
  'auth/deleteAccount',
  async (password: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/user/delete-account', { currentPassword: password });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);


const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    signIn: (state, action: PayloadAction<{ token: string; user: User }>) => {
      const { token, user } = action.payload;
      state.token = token;
      state.user = user;
      state.isAuthenticated = true;
      state.isLoading = false;
      SecureStore.setItemAsync('token', token);
      SecureStore.setItemAsync('user', JSON.stringify(user));
    },
    signOut: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      SecureStore.deleteItemAsync('token');
      SecureStore.deleteItemAsync('user');
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    hydrateAuth: (state, action: PayloadAction<{ token: string; user: User }>) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.isLoading = false;
    }
  },
  extraReducers: (builder: ActionReducerMapBuilder<AuthState>) => {
    builder
      .addCase(changeEmail.fulfilled, (state, action) => {
        if (state.user) {
          state.user.email = action.payload.email;
          // Update the stored user data as well to persist the change
          SecureStore.setItemAsync('user', JSON.stringify(state.user));
        }
      })
      .addCase(deleteAccount.fulfilled, (state) => {
        // When account is deleted, log the user out
        state.token = null;
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        SecureStore.deleteItemAsync('token');
        SecureStore.deleteItemAsync('user');
      });
  },
});

export const { signIn, signOut, setLoading, hydrateAuth } = authSlice.actions;
export default authSlice.reducer;