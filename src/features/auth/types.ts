export interface Role {
  _id: string;
  companyId: string;
  name: string;
  slug: string;
  permissions: string[];
  isSystem: boolean;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface User {
  _id: string;
  companyId: string;
  name: string;
  email: string;
  roleId: Role | string;
  employeeCode: string;
  department: string;
  title: string;
  managerId: string | null;
  status: 'active' | 'inactive' | 'pending';
  isEmailVerified: boolean;
  isDeleted: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Company {
  _id: string;
  name: string;
  slug: string;
  industry: string;
  regionId: string | null;
  countryId: string | null;
  cityId: string | null;
  ownerId: string;
  status: 'trial' | 'active' | 'suspended' | 'cancelled';
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    company?: Company;
    accessToken: string;
    refreshToken: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  companyName: string;
  industry: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface AuthState {
  user: User | null;
  company: Company | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  isLoading: boolean;
  error: string | null;
}