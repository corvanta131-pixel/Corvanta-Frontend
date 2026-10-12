import { useCustomerConversations } from '../../features/customers/hooks';
import { CHANNEL_LABELS } from '../../features/customers/customerUtils';
import { formatDate } from '../../features/users/employeeUtils';
import { getErrorMessage } from '../../utils/apiError';

/** Read-only conversation history. Opening a conversation arrives with the Inbox stage. */
export function CustomerConversations({ customerId }: { customerId: string }) {
  const { data, isLoading, isError, error, refetch } = useCustomerConversations(customerId);

  return (
    <section aria-labelledby="conversations-heading" className="space-y-3">
      <h3 id="conversations-heading" className="text-sm font-semibold text-slate-950 dark:text-slate-50">
        Conversation history
      </h3>
      {isLoading ? (
        <p role="status" className="text-sm text-slate-500">Loading conversations…</p>
      ) : isError ? (
        <div role="alert" className="text-sm text-red-600 dark:text-red-400">
          {getErrorMessage(error, 'Couldn’t load conversations.')}{' '}
          <button type="button" className="underline" onClick={() => void refetch()}>Retry</button>
        </div>
      ) : !data || data.length === 0 ? (
        <p className="text-sm text-slate-500">No conversations with this customer yet.</p>
      ) : (
        <ul className="divide-y divide-slate-200 dark:divide-slate-800 rounded-lg border border-slate-200 dark:border-slate-800">
          {data.map((c) => (
            <li key={c._id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
              <div className="min-w-0">
                <div className="font-medium truncate">{c.title || 'Untitled conversation'}</div>
                <div className="text-slate-500">
                  {CHANNEL_LABELS[c.channelType] ?? c.channelType} · {formatDate(c.lastMessageAt ?? c.updatedAt)}
                </div>
              </div>
              <span className="capitalize text-slate-600 dark:text-slate-300">{c.status}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
