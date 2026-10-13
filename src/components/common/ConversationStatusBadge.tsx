import { CONVERSATION_STATUS_LABELS, CONVERSATION_STATUS_STYLES } from '../../features/conversations/conversationUtils';
import type { ConversationStatus } from '../../features/conversations/types';

export function ConversationStatusBadge({ status }: { status: ConversationStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${CONVERSATION_STATUS_STYLES[status]}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" aria-hidden="true" />
      {CONVERSATION_STATUS_LABELS[status]}
    </span>
  );
}
