import { useEffect, useRef } from 'react';
import { ArrowLeft, AlertCircle, Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/Button';
import { ConversationStatusBadge } from './ConversationStatusBadge';
import { MessageTimeline } from './MessageTimeline';
import { CHANNEL_LABELS } from '../../features/customers/customerUtils';
import { CONVERSATION_STATUS_LABELS, conversationTitle } from '../../features/conversations/conversationUtils';
import {
  MESSAGE_PAGE_LIMIT,
  useConversationMessages,
  useSendReply,
  useUpdateConversation,
  useUpdateConversationStatus,
} from '../../features/conversations/hooks';
import { useEmployees } from '../../features/users/hooks';
import { CONVERSATION_STATUSES, type Conversation, type ConversationStatus } from '../../features/conversations/types';
import type { Customer } from '../../features/customers/types';
import { getErrorMessage } from '../../utils/apiError';

const MAX_REPLY_CHARS = 5000;

interface ConversationDetailProps {
  conversation: Conversation;
  customer: Customer | null;
  canReadMessages: boolean;
  canUpdate: boolean;
  canSend: boolean;
  canReadEmployees: boolean;
  /** Unsent reply text, kept by the page so it survives switching conversations. */
  draft: string;
  onDraftChange: (value: string) => void;
  onBack: () => void;
}

const selectClass =
  'h-9 rounded-md border border-slate-300 bg-white px-2 text-sm dark:border-slate-700 dark:bg-slate-950';

export function ConversationDetail({
  conversation,
  customer,
  canReadMessages,
  canUpdate,
  canSend,
  canReadEmployees,
  draft,
  onDraftChange,
  onBack,
}: ConversationDetailProps) {
  const messagesQuery = useConversationMessages(conversation._id, canReadMessages);
  const statusMutation = useUpdateConversationStatus();
  const updateMutation = useUpdateConversation();
  const replyMutation = useSendReply(conversation._id);
  const employeesQuery = useEmployees(canReadEmployees);
  const endRef = useRef<HTMLDivElement | null>(null);

  const messages = messagesQuery.data ?? [];
  const mode = conversation.handlingMode ?? 'AI';
  const teamHandling = mode === 'HUMAN';
  const teammates = (employeesQuery.data ?? []).filter((e) => e.status === 'active' && !e.isDeleted);

  useEffect(() => {
    endRef.current?.scrollIntoView?.({ block: 'end' });
  }, [messages.length]);

  const changeStatus = async (status: ConversationStatus) => {
    if (status === conversation.status) return;
    try {
      await statusMutation.mutateAsync({ id: conversation._id, status });
      toast.success(`Conversation marked ${CONVERSATION_STATUS_LABELS[status].toLowerCase()}.`);
    } catch {
      // Shown below via statusMutation.error; the displayed status stays at the server value.
    }
  };

  const runUpdate = async (patch: { handlingMode?: 'AI' | 'HUMAN'; assigneeId?: string | null }, success: string) => {
    updateMutation.reset();
    try {
      await updateMutation.mutateAsync({ id: conversation._id, patch });
      toast.success(success);
    } catch {
      // Shown below via updateMutation.error; nothing changed on the server.
    }
  };

  const sendDraft = async () => {
    const body = draft.trim();
    if (!body || replyMutation.isPending) return;
    try {
      await replyMutation.mutateAsync(body);
      onDraftChange('');
    } catch {
      // Shown below via replyMutation.error; the draft is kept so nothing is lost.
    }
  };

  const composer = () => {
    if (conversation.status === 'archived') {
      return <p className="text-sm text-slate-500">This conversation is archived, so it can’t receive replies.</p>;
    }
    if (!teamHandling) {
      return (
        <p className="text-sm text-slate-500">
          {canUpdate
            ? 'The AI assistant is handling this conversation. Take over to reply yourself.'
            : 'The AI assistant is handling this conversation.'}
        </p>
      );
    }
    if (!canSend) {
      return <p className="text-sm text-slate-500">You don’t have permission to send replies.</p>;
    }
    return (
      <form
        className="space-y-2"
        onSubmit={(e) => {
          e.preventDefault();
          void sendDraft();
        }}
      >
        <label htmlFor="reply-body" className="sr-only">
          Reply
        </label>
        <textarea
          id="reply-body"
          rows={3}
          maxLength={MAX_REPLY_CHARS}
          value={draft}
          disabled={replyMutation.isPending}
          placeholder="Write a reply to the customer…"
          onChange={(e) => onDraftChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              void sendDraft();
            }
          }}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
        />
        {replyMutation.error && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {getErrorMessage(replyMutation.error)}
          </p>
        )}
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500">Ctrl or ⌘ + Enter to send</span>
          <Button type="submit" size="sm" disabled={replyMutation.isPending || draft.trim() === ''}>
            {replyMutation.isPending ? 'Sending…' : 'Send reply'}
          </Button>
        </div>
      </form>
    );
  };

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

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <span data-testid="handling-label">
            Handled by:{' '}
            <strong>{mode === 'AI' ? 'AI assistant' : mode === 'HUMAN' ? 'Your team' : 'AI and your team'}</strong>
          </span>
          {canUpdate && (
            <Button
              variant="outline"
              size="sm"
              disabled={updateMutation.isPending}
              onClick={() =>
                teamHandling
                  ? void runUpdate({ handlingMode: 'AI' }, 'Handed back to the AI assistant.')
                  : void runUpdate({ handlingMode: 'HUMAN' }, 'You’re now handling this conversation.')
              }
            >
              {teamHandling ? 'Hand back to AI' : 'Take over'}
            </Button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          {canUpdate && (
            <div className="flex items-center gap-2">
              <label htmlFor="conversation-status" className="font-medium">
                Status
              </label>
              <select
                id="conversation-status"
                value={conversation.status}
                onChange={(e) => void changeStatus(e.target.value as ConversationStatus)}
                disabled={statusMutation.isPending}
                className={selectClass}
              >
                {CONVERSATION_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {CONVERSATION_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
          )}
          {canUpdate && canReadEmployees && (
            <div className="flex items-center gap-2">
              <label htmlFor="conversation-assignee" className="font-medium">
                Assigned to
              </label>
              <select
                id="conversation-assignee"
                value={conversation.assigneeId ?? ''}
                disabled={updateMutation.isPending || employeesQuery.isLoading}
                onChange={(e) => {
                  const value = e.target.value;
                  void runUpdate({ assigneeId: value === '' ? null : value }, 'Assignment updated.');
                }}
                className={selectClass}
              >
                <option value="">Unassigned</option>
                {teammates.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {statusMutation.error && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {getErrorMessage(statusMutation.error)}
          </p>
        )}
        {updateMutation.error && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {getErrorMessage(updateMutation.error)}
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
            <div ref={endRef} />
          </>
        )}
      </div>

      <div className="border-t border-slate-200 dark:border-slate-800 p-3">{composer()}</div>
    </div>
  );
}
