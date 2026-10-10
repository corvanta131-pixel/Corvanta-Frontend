import api from './client';

export async function ping(): Promise<string> {
  const response = await api.get('/health');
  return response.data;
}

export async function get<T>(url: string): Promise<T> {
  const response = await api.get<T>(url);
  return response.data;
}

export async function post<T>(url: string, data?: unknown): Promise<T> {
  const response = await api.post<T>(url, data);
  return response.data;
}

export async function put<T>(url: string, data?: unknown): Promise<T> {
  const response = await api.put<T>(url, data);
  return response.data;
}

export async function del<T>(url: string): Promise<T> {
  const response = await api.delete<T>(url);
  return response.data;
}