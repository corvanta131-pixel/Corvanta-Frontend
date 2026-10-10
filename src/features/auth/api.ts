import api from '../../services/api/client';
import type { LoginRequest, RegisterRequest, AuthResponse, User } from './types';

export async function login(credentials: LoginRequest): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/login', credentials);
  return response.data;
}

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/register', data);
  return response.data;
}

export async function refreshToken(refreshToken: string): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/refresh', { refreshToken });
  return response.data;
}

export async function logout(): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/logout');
  return response.data;
}

export async function getCurrentUser(): Promise<{ success: boolean; data: User }> {
  const response = await api.get<{ success: boolean; data: User }>('/auth/me');
  return response.data;
}