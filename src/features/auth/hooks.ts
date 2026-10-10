import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { setAuth, clearAuth, setLoading, setError, updateTokens, setInitializing } from './authSlice';
import { login, register, refreshToken, logout, getCurrentUser } from './api';
import type { LoginRequest, RegisterRequest, AuthResponse } from './types';

export const authQueryKeys = {
  user: ['auth', 'user'] as const,
};

export function useLogin() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginRequest) => login(credentials),
    onMutate: () => {
      dispatch(setLoading(true));
      dispatch(setError(null));
    },
    onSuccess: (response: AuthResponse) => {
      if (response.success && response.data) {
        const { user, company, accessToken, refreshToken } = response.data;
        dispatch(setAuth({ user, company, accessToken, refreshToken }));
        queryClient.invalidateQueries({ queryKey: authQueryKeys.user });
      } else {
        dispatch(setError(response.message));
      }
    },
    onError: (error: Error) => {
      dispatch(setError(error.message || 'Login failed'));
    },
    onSettled: () => {
      dispatch(setLoading(false));
    },
  });
}

export function useRegister() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterRequest) => register(data),
    onMutate: () => {
      dispatch(setLoading(true));
      dispatch(setError(null));
    },
    onSuccess: (response: AuthResponse) => {
      if (response.success && response.data) {
        const { user, company, accessToken, refreshToken } = response.data;
        dispatch(setAuth({ user, company, accessToken, refreshToken }));
        queryClient.invalidateQueries({ queryKey: authQueryKeys.user });
      } else {
        dispatch(setError(response.message));
      }
    },
    onError: (error: Error) => {
      dispatch(setError(error.message || 'Registration failed'));
    },
    onSettled: () => {
      dispatch(setLoading(false));
    },
  });
}

export function useRefreshToken() {
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: (refreshTokenValue: string) => refreshToken(refreshTokenValue),
    onSuccess: (response: AuthResponse) => {
      if (response.success && response.data) {
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        dispatch(updateTokens({ accessToken, refreshToken: newRefreshToken }));
      }
    },
    onError: () => {
      dispatch(clearAuth());
    },
  });
}

export function useLogout() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onMutate: () => {
      dispatch(setLoading(true));
    },
    onSuccess: () => {
      dispatch(clearAuth());
      queryClient.clear();
    },
    onError: () => {
      dispatch(clearAuth());
      queryClient.clear();
    },
    onSettled: () => {
      dispatch(setLoading(false));
    },
  });
}

export function useCurrentUser() {
  const { isAuthenticated, accessToken } = useAppSelector((state: { auth: { isAuthenticated: boolean; accessToken: string | null } }) => state.auth);

  return useQuery({
    queryKey: authQueryKeys.user,
    queryFn: getCurrentUser,
    enabled: isAuthenticated && !!accessToken,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });
}

export function useInitializeAuth() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  const { data: storedAccessToken } = useQuery({
    queryKey: ['auth', 'storedAccessToken'],
    queryFn: () => localStorage.getItem('accessToken'),
    staleTime: Infinity,
  });

  const { data: storedRefreshToken } = useQuery({
    queryKey: ['auth', 'storedRefreshToken'],
    queryFn: () => localStorage.getItem('refreshToken'),
    staleTime: Infinity,
  });

  const initializeAuth = async () => {
    const accessToken = localStorage.getItem('accessToken');
    const refreshTokenValue = localStorage.getItem('refreshToken');

    if (!accessToken || !refreshTokenValue) {
      dispatch(setInitializing(false));
      return;
    }

    dispatch(setLoading(true));

    try {
      const response = await refreshToken(refreshTokenValue);
      if (response.success && response.data) {
        const { user, company, accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;
        dispatch(setAuth({ user, company, accessToken: newAccessToken, refreshToken: newRefreshToken }));
        queryClient.invalidateQueries({ queryKey: authQueryKeys.user });
      } else {
        dispatch(clearAuth());
      }
    } catch {
      dispatch(clearAuth());
    } finally {
      dispatch(setLoading(false));
    }
  };

  return { initializeAuth, storedAccessToken, storedRefreshToken };
}