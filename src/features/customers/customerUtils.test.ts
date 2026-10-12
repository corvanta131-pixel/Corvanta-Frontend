import { describe, it, expect } from 'vitest';
import { filterCustomers } from './customerUtils';
import type { Customer } from './types';

function cust(o: Partial<Customer>): Customer {
  return {
    _id: 'x',
    companyId: 'c',
    name: 'Name',
    email: '',
    phone: '',
    status: 'active',
    isDeleted: false,
    deletedAt: null,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    ...o,
  };
}

const list = [
  cust({ _id: '1', name: 'Ada Lovelace', email: 'ada@x.com', phone: '+2348011111111' }),
  cust({ _id: '2', name: 'Ben Carter', email: 'ben@x.com', status: 'prospect' }),
  cust({ _id: '3', name: 'Cy Young', status: 'archived' }),
];

describe('filterCustomers', () => {
  it('searches name, email and phone case-insensitively', () => {
    expect(filterCustomers(list, { search: 'ADA', status: '' }).map((c) => c._id)).toEqual(['1']);
    expect(filterCustomers(list, { search: 'ben@', status: '' }).map((c) => c._id)).toEqual(['2']);
    expect(filterCustomers(list, { search: '0801', status: '' }).map((c) => c._id)).toEqual(['1']);
  });

  it('filters by status and tolerates customers without email/phone', () => {
    expect(filterCustomers(list, { search: '', status: 'archived' }).map((c) => c._id)).toEqual(['3']);
    const sparse = [{ ...cust({ _id: '4', name: 'No Contact' }), email: undefined, phone: undefined }];
    expect(filterCustomers(sparse, { search: 'zzz', status: '' })).toEqual([]);
    expect(filterCustomers(sparse, { search: 'contact', status: '' })).toHaveLength(1);
  });
});
