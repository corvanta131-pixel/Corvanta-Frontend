export interface Role {
  _id: string;
  name: string;
  slug: string;
  permissions: string[];
  isSystem: boolean;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Employee {
  _id: string;
  companyId: string;
  name: string;
  email: string;
  roleId: string | null;
  employeeCode: string;
  department: string;
  title: string;
  managerId: string | null;
  status: 'active' | 'invited' | 'disabled';
  isEmailVerified: boolean;
  isDeleted: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface CreateEmployeeRequest {
  name: string;
  email: string;
  department?: string;
  title?: string;
  status?: 'active' | 'invited' | 'disabled';
  managerId?: string | null;
}

export interface UpdateEmployeeRequest {
  name: string;
  email: string;
  department?: string;
  title?: string;
  status?: 'active' | 'invited' | 'disabled';
  managerId?: string | null;
}

export type EmployeeStatus = 'active' | 'invited' | 'disabled';