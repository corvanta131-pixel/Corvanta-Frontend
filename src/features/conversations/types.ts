import type { ChannelType } from '../customers/types';

export type ConversationStatus = 'open' | 'waiting' | 'resolved' | 'archived';
export type HandlingMode = 'AI' | 'HUMAN' | 'HYBRID';

/** Conversation as stored by the backend (fields confirmed from the Conversation model). */
export interface Conversation {
  _id: string;
  companyId: string;
  customerId: string;
  agentId?: string | null;
  channelType: ChannelType | 'api';
  channelId?: string | null;
  handlingMode?: HandlingMode;
  title?: string;
  status: ConversationStatus;
  lastMessageAt?: string | null;
  createdAt: string;
  updatedAt: string;
}
