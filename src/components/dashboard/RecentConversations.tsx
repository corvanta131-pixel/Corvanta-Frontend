import { Link } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import { EmptyState, ErrorState } from '../dashboard/EmptyState';
import { Button } from '../ui/Button';
import type { Conversation } from '../../types/dashboard';
import { formatDistanceToNow } from 'date-fns';

interface RecentConversationsProps {
  conversations: Conversation[] | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

export function RecentConversations({ conversations, isLoading, isError, onRetry }: RecentConversationsProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg animate-pulse">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
            <div className="flex-1">
              <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded mb-1" />
              <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded mb-1" />
              <div className="h-3 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return <ErrorState onRetry={onRetry} />;
  }

  if (!conversations || conversations.length === 0) {
    return (
      <EmptyState
        icon={<MessageSquare className="h-6 w-6" />}
        title="No conversations yet"
        description="Your conversations will appear here once you start receiving messages."
        action={
          <Link to="/inbox">
            <Button size="sm">Go to Inbox</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-3">
      {conversations.slice(0, 4).map((conversation) => (
        <div
          key={conversation._id}
          className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex-shrink-0 flex items-center justify-center">
            <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="font-medium text-slate-950 dark:text-slate-50 truncate">
                {conversation.subject || 'New conversation'}
              </p>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                conversation.status === 'open'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              }`}>
                {conversation.status}
              </span>
            </div>
            {conversation.lastMessagePreview && (
              <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">
                {conversation.lastMessagePreview}
              </p>
            )}
            {conversation.lastMessageAt && (
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                {formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: true })}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}