import api from './client';
import { hasStringField, pathId, unwrap } from './envelope';
import type { ApiEnvelope } from '../../features/users/types';
import type { Conversation, ConversationStatus, HandlingMode, Message } from '../../features/conversations/types';

function assertConversation(value: unknown, label: string): Conversation {
  if (!hasStringField(value, '_id') || !hasStringField(value, 'status')) {
    throw new Error(`Received an invalid conversation record while ${label}.`);
  }
  return value as unknown as Conversation;
}

export async function fetchConversations(): Promise<Conversation[]> {
  const res = await api.get<ApiEnvelope<Conversation[]>>('/conversations/');
  const data = unwrap(res.data, 'loading conversations');
  if (!Array.isArray(data)) throw new Error('Received an invalid conversation list.');
  return data.map((c) => assertConversation(c, 'loading conversations'));
}

/** PATCH accepts partial bodies for conversations; only the status is sent here. */
export async function updateConversationStatus(id: string, status: ConversationStatus): Promise<Conversation> {
  const res = await api.patch<ApiEnvelope<Conversation>>(pathId('/conversations', id, 'Conversation'), { status });
  return assertConversation(unwrap(res.data, 'updating the conversation'), 'updating the conversation');
}

/** Latest messages, oldest first. The backend caps `limit` at 100. */
export async function fetchMessages(conversationId: string, limit = 100): Promise<Message[]> {
  const base = pathId('/conversations', conversationId, 'Conversation');
  const res = await api.get<ApiEnvelope<Message[]>>(`${base}/messages`, { params: { limit } });
  const data = unwrap(res.data, 'loading messages');
  if (!Array.isArray(data)) throw new Error('Received an invalid message list.');
  return data.map((m) => {
    if (!hasStringField(m, '_id') || !hasStringField(m, 'body')) {
      throw new Error('Received an invalid message record while loading messages.');
    }
    return m as unknown as Message;
  });
}

/** Fields the dashboard may change on a conversation besides its status. */
export interface ConversationPatch {
  handlingMode?: HandlingMode;
  /** A team member's id, or null to unassign. */
  assigneeId?: string | null;
}

/** Hand a conversation to a person (HUMAN) or back to the AI, and/or (re)assign it. */
export async function updateConversation(id: string, patch: ConversationPatch): Promise<Conversation> {
  const res = await api.patch<ApiEnvelope<Conversation>>(pathId('/conversations', id, 'Conversation'), patch);
  return assertConversation(unwrap(res.data, 'updating the conversation'), 'updating the conversation');
}

/**
 * A team member's reply to the customer (no AI involved). The backend only accepts it while the
 * conversation is handled by a person.
 */
export async function sendReply(conversationId: string, body: string): Promise<Message> {
  const base = pathId('/conversations', conversationId, 'Conversation');
  const res = await api.post<ApiEnvelope<Message>>(`${base}/replies`, { body });
  const message = unwrap(res.data, 'sending the reply');
  if (!hasStringField(message, '_id') || !hasStringField(message, 'body')) {
    throw new Error('Received an invalid message record while sending the reply.');
  }
  return message;
}
