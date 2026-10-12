export type EmployeeStatus = 'active' | 'invited' | 'disabled';

export const EMPLOYEE_STATUSES: readonly EmployeeStatus[] = ['active', 'invited', 'disabled'];

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

/**
 * Employee as returned by GET/POST/PATCH/DELETE /users.
 * Verified against backend employeeService: list/get populate `roleId`
 * (object), create/update/delete return an unpopulated id or null.
 */
export interface Employee {
  _id: string;
  companyId: string;
  name: string;
  email: string;
  roleId: Role | string | null;
  employeeCode: string;
  department: string;
  title: string;
  managerId: string | null;
  status: EmployeeStatus;
  isEmailVerified: boolean;
  isDeleted: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

/** Body for POST /users/. Backend: name 2-120, valid email, department/title 2-100 if present. */
export interface CreateEmployeeRequest {
  name: string;
  email: string;
  /** Optional initial password (backend: min 8). Without it the account cannot sign in. */
  password?: string;
  department?: string;
  title?: string;
  status?: EmployeeStatus;
  managerId?: string | null;
}

/** Body for PATCH /users/:id. Backend validator requires name and email on update too. */
export interface UpdateEmployeeRequest {
  name: string;
  email: string;
  department?: string;
  title?: string;
  status?: EmployeeStatus;
  managerId?: string | null;
}

export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
}
