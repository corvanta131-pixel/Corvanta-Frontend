import { CHANNEL_LABELS } from '../customers/customerUtils';
import type { Conversation, ConversationStatus, SenderType } from './types';

export const CONVERSATION_STATUS_LABELS: Record<ConversationStatus, string> = {
  open: 'Open',
  waiting: 'Waiting',
  resolved: 'Resolved',
  archived: 'Archived',
};

export const CONVERSATION_STATUS_STYLES: Record<ConversationStatus, string> = {
  open: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  waiting: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  resolved: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  archived: 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
};

export const SENDER_LABELS: Record<SenderType, string> = {
  customer: 'Customer',
  user: 'Team member',
  agent: 'AI agent',
  system: 'System',
};

export interface ConversationFilterState {
  search: string;
  status: '' | ConversationStatus;
}

export function conversationTitle(c: Conversation): string {
  return c.title?.trim() || 'Untitled conversation';
}

export function filterConversations(
  conversations: Conversation[],
  customerNames: Map<string, string>,
  filters: ConversationFilterState
): Conversation[] {
  const q = filters.search.trim().toLowerCase();
  return conversations.filter((c) => {
    if (filters.status && c.status !== filters.status) return false;
    if (!q) return true;
    const haystack = [
      c.title ?? '',
      customerNames.get(c.customerId) ?? '',
      CHANNEL_LABELS[c.channelType] ?? c.channelType,
    ];
    return haystack.some((v) => v.toLowerCase().includes(q));
  });
}
