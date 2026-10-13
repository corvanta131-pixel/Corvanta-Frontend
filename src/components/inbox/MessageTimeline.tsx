import { SENDER_LABELS } from '../../features/conversations/conversationUtils';
import type { Message } from '../../features/conversations/types';

function formatTime(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
}

/** Plain-text rendering only: message bodies are never interpreted as HTML. */
export function MessageTimeline({ messages }: { messages: Message[] }) {
  return (
    <ol className="space-y-4" aria-label="Messages">
      {messages.map((m) => {
        const fromCustomer = m.senderType === 'customer';
        return (
          <li key={m._id} className={`flex ${fromCustomer ? 'justify-start' : 'justify-end'}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                fromCustomer
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-950 dark:text-slate-50'
                  : m.senderType === 'system'
                    ? 'bg-amber-50 dark:bg-amber-900/20 text-slate-800 dark:text-slate-200'
                    : 'bg-indigo-600 text-white'
              }`}
            >
              <div className="text-xs font-medium opacity-80">
                {SENDER_LABELS[m.senderType] ?? m.senderType}
                {m.senderType === 'agent' && m.metadata?.model ? ` · ${m.metadata.model}` : ''}
              </div>
              <p className="mt-1 whitespace-pre-wrap break-words text-sm">{m.body}</p>
              <time dateTime={m.createdAt} className="mt-1 block text-xs opacity-70">
                {formatTime(m.createdAt)}
              </time>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
