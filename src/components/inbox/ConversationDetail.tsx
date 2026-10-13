import { ArrowLeft, AlertCircle, Mail, Phone } from 'lucide-react';
import { Button } from '../ui/Button';
import { ConversationStatusBadge } from './ConversationStatusBadge';
import { MessageTimeline } from './MessageTimeline';
import { CHANNEL_LABELS } from '../../features/customers/customerUtils';
import {
  CONVERSATION_STATUS_LABELS,
  conversationTitle,
} from '../../features/conversations/conversationUtils';
import { useConversationMessages, useUpdateConversationStatus, MESSAGE_PAGE_LIMIT } from '../../features/conversations/hooks';
import { CONVERSATION_STATUSES, type Conversation, type ConversationStatus } from '../../features/conversations/types';
import type { Customer } from '../../features/customers/types';
import { getErrorMessage } from '../../utils/apiError';
import { toast } from 'sonner';

interface ConversationDetailProps {
  conversation: Conversation;
  customer: Customer | null;
  canReadMessages: boolean;
  canUpdate: boolean;
  onBack: () => void;
}

export function ConversationDetail({ conversation, customer, canReadMessages, canUpdate, onBack }: ConversationDetailProps) {
  const messagesQuery = useConversationMessages(conversation._id, canReadMessages);
  const statusMutation = useUpdateConversationStatus();

  const changeStatus = async (status: ConversationStatus) => {
    if (status === conversation.status) return;
    try {
      await statusMutation.mutateAsync({ id: conversation._id, status });
      toast.success(`Conversation marked ${CONVERSATION_STATUS_LABELS[status].toLowerCase()}.`);
    } catch {
      // Shown below via statusMutation.error; the displayed status stays at the server value.
    }
  };

  const messages = messagesQuery.data ?? [];

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-200 dark:border-slate-800 p-4 space-y-3">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="sm" className="md:hidden -ml-2" onClick={onBack} aria-label="Back to conversations">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </Button>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold truncate">{conversationTitle(conversation)}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {CHANNEL_LABELS[conversation.channelType] ?? conversation.channelType}
              {conversation.handlingMode ? ` · Handled by ${conversation.handlingMode}` : ''}
            </p>
          </div>
          <ConversationStatusBadge status={conversation.status} />
        </div>

        {customer && (
          <div className="rounded-lg bg-slate-50 dark:bg-slate-900 p-3 text-sm space-y-1">
            <div className="font-medium">{customer.name}</div>
            {customer.email && (
              <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                {customer.email}
              </div>
            )}
            {customer.phone && (
              <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                {customer.phone}
              </div>
            )}
          </div>
        )}

        {canUpdate && (
          <div className="flex items-center gap-2">
            <label htmlFor="conversation-status" className="text-sm font-medium">
              Status
            </label>
            <select
              id="conversation-status"
              value={conversation.status}
              onChange={(e) => void changeStatus(e.target.value as ConversationStatus)}
              disabled={statusMutation.isPending}
              className="h-9 rounded-md border border-slate-300 bg-white px-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            >
              {CONVERSATION_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {CONVERSATION_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
        )}
        {statusMutation.error && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {getErrorMessage(statusMutation.error)}
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {!canReadMessages ? (
          <p className="text-sm text-slate-500">You don’t have permission to read messages in this conversation.</p>
        ) : messagesQuery.isLoading ? (
          <p role="status" className="text-sm text-slate-500">Loading messages…</p>
        ) : messagesQuery.isError ? (
          <div role="alert" className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400">
            <AlertCircle className="h-4 w-4 mt-0.5" aria-hidden="true" />
            <div>
              {getErrorMessage(messagesQuery.error, 'Couldn’t load messages.')}{' '}
              <button type="button" className="underline" onClick={() => void messagesQuery.refetch()}>
                Retry
              </button>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <p className="text-sm text-slate-500">No messages in this conversation yet.</p>
        ) : (
          <>
            {messages.length >= MESSAGE_PAGE_LIMIT && (
              <p className="mb-3 text-center text-xs text-slate-500">
                Showing the most recent {MESSAGE_PAGE_LIMIT} messages.
              </p>
            )}
            <MessageTimeline messages={messages} />
          </>
        )}
      </div>

      <div className="border-t border-slate-200 dark:border-slate-800 p-3 text-sm text-slate-500 dark:text-slate-400">
        Replying from the inbox isn’t available yet. This view is read-only for now.
      </div>
    </div>
  );
}
