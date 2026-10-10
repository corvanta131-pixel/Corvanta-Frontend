import { Link } from 'react-router-dom';
import { Users, Bot, MessageCircle, BookOpen, GitBranch, UserPlus } from 'lucide-react';
import { useAppSelector } from '../../hooks';
import { can } from '../../utils/permissions';

interface QuickActionItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  permission?: string;
  implemented: boolean;
}

export function QuickActions() {
  const { user } = useAppSelector((state) => state.auth);

  const actions: QuickActionItem[] = [
    { label: 'Add Customer', href: '/customers', icon: <Users className="h-4 w-4" />, permission: 'customers:read', implemented: false },
    { label: 'Create AI Agent', href: '/agents', icon: <Bot className="h-4 w-4" />, permission: 'agents:read', implemented: false },
    { label: 'Connect Channel', href: '/channels', icon: <MessageCircle className="h-4 w-4" />, permission: 'channels:read', implemented: false },
    { label: 'Create Knowledge Base', href: '/knowledge', icon: <BookOpen className="h-4 w-4" />, permission: 'knowledge:read', implemented: false },
    { label: 'Create Workflow', href: '/workflows', icon: <GitBranch className="h-4 w-4" />, permission: 'workflows:read', implemented: false },
    { label: 'Invite Team Member', href: '/team', icon: <UserPlus className="h-4 w-4" />, permission: 'employees:read', implemented: false },
  ];

  const filteredActions = actions.filter((action) => !action.permission || can(action.permission, user));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {filteredActions.map((action) => (
        <Link
          key={action.href}
          to={action.href}
          className="flex items-center gap-3 px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 text-left"
        >
          <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
            {action.icon}
          </span>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{action.label}</span>
        </Link>
      ))}
    </div>
  );
}