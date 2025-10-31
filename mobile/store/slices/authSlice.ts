import { createSlice, createAsyncThunk, PayloadAction, ActionReducerMapBuilder } from '@reduxjs/toolkit';
import * as SecureStore from 'expo-secure-store';
import apiClient, { API_BASE_URL } from '../../api/client';

interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
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

const resolveAvatarUrl = (url?: string | null): string | null => {
  if (!url) {
    return null;
  }

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  if (!API_BASE_URL) {
    return url.startsWith('/') ? url : `/${url}`;
  }

  const base = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${base}${path}`;
};

// --- ASYNC THUNKS ---

export const changeName = createAsyncThunk(
  'auth/changeName',
  async (data: { newName: string, currentPassword: string }, { rejectWithValue }) => {
    try {
  const response = await apiClient.post('/user/change-name', data);
  return response.data.user;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const changeEmail = createAsyncThunk(
  'auth/changeEmail',
  async (data: { newEmail: string, currentPassword: string }, { rejectWithValue }) => {
    try {
  const response = await apiClient.post('/user/change-email', data);
  return response.data.user;
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

export const uploadAvatar = createAsyncThunk(
  'auth/uploadAvatar',
  async (payload: { image: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/user/avatar', payload);
      return response.data.user;
    } catch (error: any) {
      return rejectWithValue(error.response?.data ?? { message: 'Failed to upload avatar.' });
    }
  }
);

export const removeAvatar = createAsyncThunk(
  'auth/removeAvatar',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.delete('/user/avatar');
      return response.data.user;
    } catch (error: any) {
      return rejectWithValue(error.response?.data ?? { message: 'Failed to remove avatar.' });
    }
  }
);

export const fetchAvatar = createAsyncThunk(
  'auth/fetchAvatar',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/user/avatar');
      return response.data.avatarUrl as string | null;
    } catch (error: any) {
      return rejectWithValue(error.response?.data ?? { message: 'Failed to fetch avatar.' });
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
      const normalizedUser = { ...user, avatarUrl: resolveAvatarUrl(user.avatarUrl) };
      state.user = normalizedUser;
      state.isAuthenticated = true;
      state.isLoading = false;
      SecureStore.setItemAsync('token', token);
      SecureStore.setItemAsync('user', JSON.stringify(normalizedUser));
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
      .addCase(changeName.fulfilled, (state, action) => {
        if (state.user) {
          state.user.name = action.payload.name;
          state.user.avatarUrl = resolveAvatarUrl(action.payload.avatarUrl);
          SecureStore.setItemAsync('user', JSON.stringify(state.user));
        }
      })
      .addCase(changeEmail.fulfilled, (state, action) => {
        if (state.user) {
          state.user.email = action.payload.email;
          state.user.avatarUrl = resolveAvatarUrl(action.payload.avatarUrl);
          SecureStore.setItemAsync('user', JSON.stringify(state.user));
        }
      })
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        if (state.user) {
          state.user.avatarUrl = resolveAvatarUrl(action.payload.avatarUrl);
          SecureStore.setItemAsync('user', JSON.stringify(state.user));
        }
      })
      .addCase(removeAvatar.fulfilled, (state, action) => {
        if (state.user) {
          state.user.avatarUrl = resolveAvatarUrl(action.payload.avatarUrl);
          SecureStore.setItemAsync('user', JSON.stringify(state.user));
        }
      })
      .addCase(fetchAvatar.fulfilled, (state, action: PayloadAction<string | null>) => {
        if (state.user) {
          state.user.avatarUrl = resolveAvatarUrl(action.payload);
          SecureStore.setItemAsync('user', JSON.stringify(state.user));
        }
      })
      .addCase(deleteAccount.fulfilled, (state) => {
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