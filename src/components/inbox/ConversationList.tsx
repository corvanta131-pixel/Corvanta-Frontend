import type { Conversation, ConversationStatus } from '../../features/conversations/types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { MessageSquare, Clock, User, Hash, Tag, Archive, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

interface ConversationListProps {
  conversations: Conversation[];
  onConversationClick?: (id: string) => void;
}

export function ConversationList({ conversations, onConversationClick }: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-slate-600 dark:text-slate-400">
          <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No conversations found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {conversations.map((conv) => (
        <Card
          key={conv._id}
          className={`cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${onConversationClick ? 'hover:border-slate-300 dark:hover:border-slate-600' : ''}`}
          onClick={() => onConversationClick?.(conv._id)}
        >
          <CardContent className="pt-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-slate-900 dark:text-slate-100 truncate">
                  {conv.title || `Conversation with customer`}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Customer ID: {conv.customerId}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2 ml-4">
                <ConversationStatusBadge status={conv.status} />
                {conv.handlingMode && (
                  <Badge variant="outline" className="text-xs">
                    {conv.handlingMode}
                  </Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-3 text-xs text-slate-600 dark:text-slate-400">
              {conv.channelType && (
                <div className="flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  <span>{conv.channelType}</span>
                </div>
              )}
              {conv.agentId && (
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>Agent assigned</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>
                  {conv.lastMessageAt
                    ? `Last: ${format(new Date(conv.lastMessageAt), 'MMM d, h:mm a')}`
                    : `Created: ${format(new Date(conv.createdAt), 'MMM d, h:mm a')}`
                  }
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Hash className="h-3 w-3" />
                <span>ID: {conv._id}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
