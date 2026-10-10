import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, User, Company } from './types';

const initialState: AuthState = {
  user: null,
  company: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isInitializing: true,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setInitializing: (state, action: PayloadAction<boolean>) => {
      state.isInitializing = action.payload;
    },
    setAuth: (state, action: PayloadAction<{ user: User; company: Company | undefined; accessToken: string; refreshToken: string }>) => {
      state.user = action.payload.user;
      state.company = action.payload.company ?? null;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      state.isInitializing = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearAuth: (state) => {
      state.user = null;
      state.company = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.isInitializing = false;
      state.isLoading = false;
      state.error = null;
    },
    updateTokens: (state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
});

export const {
  setInitializing,
  setAuth,
  setLoading,
  setError,
  clearAuth,
  updateTokens,
  updateUser,
} = authSlice.actions;

export default authSlice.reducer;