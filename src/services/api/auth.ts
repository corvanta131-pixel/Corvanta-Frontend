export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('auth_token', token);
}

export function removeAuthToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth_token');
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

export interface User {
  _id: string;
  name: string;
  email: string;
  companyId: string;
  roleId: string;
  status: 'active' | 'invited' | 'disabled';
  isEmailVerified: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export async function login(email: string, password: string): Promise<{ user: User; token: string }> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }

  const { user, token } = await response.json();
  setAuthToken(token);
  return { user, token };
}

export async function logout(): Promise<void> {
  removeAuthToken();
  // Clear any stored refresh tokens, etc.
}

export async function checkAuthStatus(): Promise<boolean> {
  // Check if the auth token is valid
  const token = getAuthToken();
  if (!token) return false;

  try {
    const response = await fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}