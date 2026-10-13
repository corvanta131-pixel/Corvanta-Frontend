import { format } from 'date-fns';
import type { Conversation } from '../../features/conversations/types';
import { Badge } from '../../components/ui/Badge';

interface ConversationStatusBadgeProps {
  status: Conversation['status'];
}

export function ConversationStatusBadge({ status }: ConversationStatusBadgeProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'waiting':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
      case 'resolved':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
      case 'archived':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100';
    }
  };

  return (
    <Badge className={getStatusColor()} variant="outline">
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}
