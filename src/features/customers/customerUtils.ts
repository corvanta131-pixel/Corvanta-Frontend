import type { ChannelType, Customer, CustomerStatus } from './types';

export const CUSTOMER_STATUS_LABELS: Record<CustomerStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  prospect: 'Prospect',
  archived: 'Archived',
};

export const CUSTOMER_STATUS_STYLES: Record<CustomerStatus, string> = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  prospect: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  inactive: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  archived: 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
};

export const CHANNEL_LABELS: Record<ChannelType | 'api', string> = {
  email: 'Email',
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  messenger: 'Messenger',
  webchat: 'Web chat',
  sms: 'SMS',
  api: 'API',
};

export interface CustomerFilterState {
  search: string;
  status: '' | CustomerStatus;
}

export function filterCustomers(customers: Customer[], filters: CustomerFilterState): Customer[] {
  const q = filters.search.trim().toLowerCase();
  return customers.filter((c) => {
    if (filters.status && c.status !== filters.status) return false;
    if (!q) return true;
    return [c.name, c.email ?? '', c.phone ?? ''].some((v) => v.toLowerCase().includes(q));
  });
}
