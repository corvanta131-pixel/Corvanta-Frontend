import { describe, it, expect } from 'vitest';
import {
  filterEmployees,
  getDepartments,
  getInitials,
  getManagerName,
  getRoleName,
  formatDate,
} from './employeeUtils';
import type { Employee } from './types';

function emp(overrides: Partial<Employee>): Employee {
  return {
    _id: 'x',
    companyId: 'c1',
    name: 'Name',
    email: 'n@x.com',
    roleId: null,
    employeeCode: '',
    department: '',
    title: '',
    managerId: null,
    status: 'active',
    isEmailVerified: false,
    isDeleted: false,
    lastLoginAt: null,
    createdAt: '2025-01-02T00:00:00.000Z',
    updatedAt: '2025-01-02T00:00:00.000Z',
    __v: 0,
    ...overrides,
  };
}

const list = [
  emp({ _id: '1', name: 'Ada Lovelace', email: 'ada@x.com', department: 'Support', title: 'Agent' }),
  emp({ _id: '2', name: 'Ben Carter', email: 'ben@x.com', department: 'Sales', title: 'Lead', status: 'invited' }),
  emp({ _id: '3', name: 'Cy Young', email: 'cy@x.com', department: 'Support', title: 'Manager', status: 'disabled' }),
];

describe('filterEmployees', () => {
  it('matches search case-insensitively across name, email, department and title', () => {
    expect(filterEmployees(list, { search: 'ADA', status: '', department: '' }).map((e) => e._id)).toEqual(['1']);
    expect(filterEmployees(list, { search: 'sales', status: '', department: '' }).map((e) => e._id)).toEqual(['2']);
    expect(filterEmployees(list, { search: 'manager', status: '', department: '' }).map((e) => e._id)).toEqual(['3']);
  });

  it('combines status and department filters', () => {
    expect(filterEmployees(list, { search: '', status: 'disabled', department: 'Support' }).map((e) => e._id)).toEqual(['3']);
    expect(filterEmployees(list, { search: '', status: 'invited', department: 'Support' })).toEqual([]);
  });

  it('returns everything when no filter is set', () => {
    expect(filterEmployees(list, { search: '  ', status: '', department: '' })).toHaveLength(3);
  });
});

describe('helpers', () => {
  it('derives sorted unique departments and ignores blanks', () => {
    expect(getDepartments([...list, emp({ _id: '4', department: '' })])).toEqual(['Sales', 'Support']);
  });

  it('builds initials safely', () => {
    expect(getInitials('Ada Lovelace')).toBe('AL');
    expect(getInitials('  cher ')).toBe('C');
    expect(getInitials('')).toBe('?');
  });

  it('only returns a role name when the role is populated', () => {
    expect(getRoleName(emp({ roleId: 'abc' }))).toBeNull();
    expect(getRoleName(emp({ roleId: null }))).toBeNull();
    expect(
      getRoleName(
        emp({
          roleId: {
            _id: 'r',
            name: 'Support Lead',
            slug: 'support-lead',
            permissions: [],
            isSystem: false,
            createdBy: null,
            createdAt: '',
            updatedAt: '',
            __v: 0,
          },
        })
      )
    ).toBe('Support Lead');
  });

  it('resolves manager names from the list', () => {
    expect(getManagerName(emp({ managerId: '1' }), list)).toBe('Ada Lovelace');
    expect(getManagerName(emp({ managerId: 'missing' }), list)).toBeNull();
    expect(getManagerName(emp({ managerId: null }), list)).toBeNull();
  });

  it('formats dates and tolerates bad input', () => {
    expect(formatDate('2025-01-02T12:00:00.000Z')).toContain('2025');
    expect(formatDate(null)).toBe('');
    expect(formatDate('not a date')).toBe('');
  });
});
