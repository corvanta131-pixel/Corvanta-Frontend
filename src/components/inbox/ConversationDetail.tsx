import { useState } from 'react';
import { MessageSquare, Archive, X, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import type { Conversation } from '../../features/conversations/types';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { formatDistanceToNow } from 'date-fns';

interface ConversationDetailProps {
  conversation: Conversation | null;
  onClose: () => void;
}

export function ConversationDetail({ conversation, onClose }: ConversationDetailProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!conversation) {
    return (
      <Card className="h-full">
        <CardContent className="flex flex-col items-center justify-center h-full text-slate-600 dark:text-slate-400">
          <MessageSquare className="h-12 w-12 mb-4 opacity-50" />
          <h2 className="text-lg font-medium mb-2">Select a conversation</h2>
          <p className="text-sm">Choose a conversation from the list to view its details.</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = () => {
    switch (conversation.status) {
      case 'open':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'waiting':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'resolved':
        return <Archive className="h-4 w-4 text-blue-600" />;
      case 'archived':
        return <Archive className="h-4 w-4 text-gray-600" />;
      default:
        return <MessageSquare className="h-4 w-4 text-slate-600" />;
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardContent className="flex-1 overflow-auto p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                {conversation.title || `Conversation with customer`}
              </h2>
              <Badge variant="outline" className="mt-1">
                {conversation._id}
              </Badge>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">Conversation Details</h3>
              <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="font-medium">
                    <ConversationStatusBadge status={conversation.status} />
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Channel:</span>
                  <span>{conversation.channelType}</span>
                </div>
                <div className="flex justify-between">
                  <span>Customer ID:</span>
                  <span>{conversation.customerId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Created:</span>
                  <span>{formatDistanceToNow(new Date(conversation.createdAt), { addSuffix: true })}</span>
                </div>
                {conversation.lastMessageAt && (
                  <div className="flex justify-between">
                    <span>Last Message:</span>
                    <span>{formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: true })}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">Handling</h3>
              <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Mode:</span>
                  <span>{conversation.handlingMode || 'Not set'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Agent:</span>
                  <span>{conversation.agentId || 'Unassigned'}</span>
                </div>
                {conversation.channelId && (
                  <div className="flex justify-between">
                    <span>Channel ID:</span>
                    <span className="font-mono text-xs">{conversation.channelId}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">Timeline</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Conversation Created</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {new Date(conversation.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                {conversation.lastMessageAt && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-1" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Last Message</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {new Date(conversation.lastMessageAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
