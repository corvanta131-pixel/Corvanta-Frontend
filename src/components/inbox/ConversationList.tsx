import { ConversationStatusBadge } from './ConversationStatusBadge';
import { CHANNEL_LABELS } from '../../features/customers/customerUtils';
import { conversationTitle } from '../../features/conversations/conversationUtils';
import { formatDate } from '../../features/users/employeeUtils';
import type { Conversation } from '../../features/conversations/types';

interface ConversationListProps {
  conversations: Conversation[];
  customerNames: Map<string, string>;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function ConversationList({ conversations, customerNames, selectedId, onSelect }: ConversationListProps) {
  return (
    <ul className="divide-y divide-slate-200 dark:divide-slate-800" aria-label="Conversations">
      {conversations.map((c) => {
        const selected = c._id === selectedId;
        const customer = customerNames.get(c.customerId);
        return (
          <li key={c._id}>
            <button
              type="button"
              onClick={() => onSelect(c._id)}
              aria-current={selected ? 'true' : undefined}
              className={`w-full text-left px-4 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 ${
                selected
                  ? 'bg-indigo-50 dark:bg-indigo-900/20'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-900'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-medium text-slate-950 dark:text-slate-50 truncate">{conversationTitle(c)}</span>
                <ConversationStatusBadge status={c.status} />
              </div>
              <div className="mt-1 text-sm text-slate-500 dark:text-slate-400 truncate">
                {customer ?? 'Customer'} · {CHANNEL_LABELS[c.channelType] ?? c.channelType} ·{' '}
                {formatDate(c.lastMessageAt ?? c.updatedAt)}
                {c.handlingMode === 'HUMAN' ? ' · Team handling' : ''}
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
