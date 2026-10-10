export interface Customer {
  _id: string;
  companyId: string;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  status: 'active' | 'inactive' | 'archived';
  tags: string[];
  customFields: Record<string, unknown>;
  lastConversationAt: string | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Conversation {
  _id: string;
  companyId: string;
  customerId: string;
  channelId: string;
  status: 'open' | 'closed' | 'pending' | 'snoozed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  subject: string | null;
  assigneeId: string | null;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  unreadCount: number;
  tags: string[];
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Agent {
  _id: string;
  companyId: string;
  name: string;
  description: string | null;
  avatar: string | null;
  model: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  knowledgeBaseIds: string[];
  channelIds: string[];
  fallbackEnabled: boolean;
  fallbackMessage: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Channel {
  _id: string;
  companyId: string;
  name: string;
  type: 'email' | 'whatsapp' | 'instagram' | 'messenger' | 'webchat' | 'sms';
  provider: string;
  providerConfig: Record<string, unknown>;
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  isDefault: boolean;
  webhookUrl: string | null;
  lastSyncAt: string | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface KnowledgeBase {
  _id: string;
  companyId: string;
  name: string;
  description: string | null;
  visibility: 'private' | 'public' | 'internal';
  documentCount: number;
  chunkCount: number;
  embeddingModel: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Workflow {
  _id: string;
  companyId: string;
  name: string;
  description: string | null;
  definition: Record<string, unknown>;
  version: number;
  status: 'draft' | 'active' | 'paused' | 'archived';
  triggerType: 'manual' | 'event' | 'schedule';
  triggerConfig: Record<string, unknown>;
  isActive: boolean;
  lastExecutedAt: string | null;
  executionCount: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Employee {
  _id: string;
  companyId: string;
  name: string;
  email: string;
  roleId: string | { _id: string; name: string; slug: string };
  employeeCode: string;
  department: string;
  title: string;
  managerId: string | null;
  status: 'active' | 'inactive' | 'pending';
  avatar: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
}