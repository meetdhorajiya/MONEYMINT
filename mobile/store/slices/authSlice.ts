import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as SecureStore from 'expo-secure-store';

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
  isLoading: true, // Start with loading true to check for stored token
  user: null,
};

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
});

export const { signIn, signOut, setLoading, hydrateAuth } = authSlice.actions;
export default authSlice.reducer;