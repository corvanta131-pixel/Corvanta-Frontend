import { MessageCircle, Clock, Archive, CheckCircle, AlertCircle } from 'lucide-react';
import type { Conversation } from '../../features/conversations/types';

interface MessageTimelineProps {
  conversation: Conversation;
}

export function MessageTimeline({ conversation }: MessageTimelineProps) {
  const messages = [
    {
      id: '1',
      text: 'Hello, I need help with my account',
      sender: 'customer',
      timestamp: new Date(conversation.createdAt),
      status: 'sent',
    },
    {
      id: '2',
      text: 'Hi! I can help you with that. Let me check your account details.',
      sender: 'agent',
      timestamp: new Date(Date.now() - 3600000),
      status: 'delivered',
    },
    {
      id: '3',
      text: 'Thank you for the information. I have updated your account as requested.',
      sender: 'agent',
      timestamp: new Date(Date.now() - 1800000),
      status: 'read',
    },
  ];

  return (
    <div className="relative pl-6 pb-6">
      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700" />

      {messages.map((message, index) => {
        const isAgent = message.sender === 'agent';
        const isLatest = index === messages.length - 1;

        return (
          <div key={message.id} className="relative flex items-start mb-4">
            <div className="absolute left-[-8px] top-1 w-4 h-4 rounded-full bg-slate-300 dark:bg-slate-600 flex items-center justify-center">
              {isAgent ? (
                <MessageCircle className="w-2 h-2 text-slate-600 dark:text-slate-400" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-green-500" />
              )}
            </div>

            <div className={`flex-1 ml-4 ${isAgent ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-slate-50 dark:bg-slate-800'} rounded-lg p-3 max-w-xs lg:max-w-md`}> 
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-medium ${isAgent ? 'text-blue-700 dark:text-blue-300' : 'text-green-700 dark:text-green-300'}`}> 
                  {isAgent ? 'Support Agent' : 'Customer'}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-sm text-slate-900 dark:text-slate-100"> {message.text} </p>
              <div className="flex items-center gap-2 mt-2">
                {isLatest && (
                  <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                    <CheckCircle className="w-3 h-3" />
                    Read
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                  <Clock className="w-3 h-3" />
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
