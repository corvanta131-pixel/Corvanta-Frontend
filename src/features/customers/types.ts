export type CustomerStatus = 'active' | 'inactive' | 'prospect' | 'archived';
export const CUSTOMER_STATUSES: readonly CustomerStatus[] = ['active', 'inactive', 'prospect', 'archived'];

/** Customer as returned by /customers (verified against backend Customer model + customerService). */
export interface Customer {
  _id: string;
  companyId: string;
  name: string;
  email?: string | undefined;
  phone?: string | undefined;
  status: CustomerStatus;
  notes?: string | undefined;
  metadata?: Record<string, unknown> | undefined;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  __v?: number | undefined;
}

/** POST /customers/. Backend: name 2-150, email valid if present, phone 2-30, notes <= 2000. */
export interface CreateCustomerRequest {
  name: string;
  email?: string;
  phone?: string;
  status?: CustomerStatus;
  notes?: string;
}

/** PATCH /customers/:id. Backend validator still requires `name` on update. */
export interface UpdateCustomerRequest {
  name: string;
  email?: string;
  phone?: string;
  status?: CustomerStatus;
  notes?: string;
}

/** Only the filters the backend actually honours (status, exact email). */
export interface CustomerListParams {
  status?: CustomerStatus;
}

export type ChannelType = 'email' | 'whatsapp' | 'instagram' | 'messenger' | 'webchat' | 'sms';
export const CHANNEL_TYPES: readonly ChannelType[] = ['email', 'whatsapp', 'instagram', 'messenger', 'webchat', 'sms'];

/** /customer-identities. Backend allows one identity per channel per customer. */
export interface CustomerIdentity {
  _id: string;
  companyId: string;
  customerId: string;
  channelType: ChannelType;
  externalId: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerIdentityRequest {
  customerId: string;
  channelType: ChannelType;
  externalId: string;
}
