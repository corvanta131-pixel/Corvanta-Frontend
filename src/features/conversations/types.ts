import type { ChannelType } from '../customers/types';

export type ConversationStatus = 'open' | 'waiting' | 'resolved' | 'archived';
export const CONVERSATION_STATUSES: readonly ConversationStatus[] = ['open', 'waiting', 'resolved', 'archived'];
export type HandlingMode = 'AI' | 'HUMAN' | 'HYBRID';

/** Conversation as stored by the backend (fields confirmed from the Conversation model). */
export interface Conversation {
  _id: string;
  companyId: string;
  customerId: string;
  agentId?: string | null | undefined;
  channelType: ChannelType | 'api';
  channelId?: string | null | undefined;
  handlingMode?: HandlingMode | undefined;
  title?: string | undefined;
  status: ConversationStatus;
  lastMessageAt?: string | null | undefined;
  createdAt: string;
  updatedAt: string;
}

export type SenderType = 'user' | 'customer' | 'agent' | 'system';

/**
 * Message as exposed by GET /conversations/:id/messages (backend publicMessage).
 * The backend does NOT expose direction, channel or delivery status here, so none is modelled.
 */
export interface Message {
  _id: string;
  companyId: string;
  conversationId: string;
  senderType: SenderType;
  senderId?: string | null | undefined;
  body: string;
  createdAt: string;
  updatedAt: string;
  metadata?: {
    provider?: string | undefined;
    model?: string | undefined;
    latencyMs?: number | undefined;
    finishReason?: string | undefined;
    retrievalMode?: string | undefined;
    sourceCount?: number | undefined;
  } | undefined;
}
