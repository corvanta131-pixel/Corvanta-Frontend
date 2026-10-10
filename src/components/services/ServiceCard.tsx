import { Link } from 'react-router-dom';
import {
  MessageSquare,
  Bot,
  MessageCircle,
  BookOpen,
  GitBranch,
  Users,
  Users as UsersIcon,
} from 'lucide-react';
import { getServiceStatusLabel } from '../../features/services/catalog';
import type { Service } from '../../features/services/catalog';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';

const iconMap: Record<string, React.ReactNode> = {
  'message-square': <MessageSquare className="h-5 w-5" />,
  bot: <Bot className="h-5 w-5" />,
  'message-circle': <MessageCircle className="h-5 w-5" />,
  'book-open': <BookOpen className="h-5 w-5" />,
  'git-branch': <GitBranch className="h-5 w-5" />,
  users: <Users className="h-5 w-5" />,
  'users-2': <UsersIcon className="h-5 w-5" />,
};

export function ServiceCard({ service, onClick }: { service: Service; onClick?: () => void }) {
  const status = getServiceStatusLabel(service.status);

  return (
    <Card
      className="group transition-shadow duration-150 hover:shadow-md"
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); }} : undefined}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className={`w-10 h-10 rounded-xl bg-${getCategoryColor(service.category)}/10 dark:bg-${getCategoryColor(service.category)}/900/30 flex items-center justify-center`}>
            {iconMap[service.icon] || <MessageSquare className="h-5 w-5" />}
          </div>
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${status.className}`}>
            {status.label}
          </span>
        </div>
        <CardTitle className="mt-3">{service.name}</CardTitle>
        <CardDescription>{service.description}</CardDescription>
      </CardHeader>

      <CardContent>
        <ul className="space-y-1.5 text-sm" role="list">
          {service.capabilities.slice(0, 3).map((cap) => (
            <li key={cap} className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <span className="w-1 h-1 rounded-full bg-slate-400 flex-shrink-0" aria-hidden="true" />
              {cap}
            </li>
          ))}
          {service.capabilities.length > 3 && (
            <li className="text-xs text-slate-500 dark:text-slate-400">
              +{service.capabilities.length - 3} more
            </li>
          )}
        </ul>
      </CardContent>

      <CardFooter>
        {service.status === 'coming_soon' ? (
          <Button variant="outline" size="sm" disabled>
            Coming Soon
          </Button>
        ) : service.learnMoreHref ? (
          <Link to={service.learnMoreHref}>
            <Button variant="outline" size="sm">
              Learn More
            </Button>
          </Link>
        ) : (
          <Button variant="outline" size="sm" disabled>
            Learn More
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    communication: 'indigo',
    'ai-automation': 'violet',
    'customer-management': 'blue',
    knowledge: 'purple',
    'team-operations': 'emerald',
  };
  return colors[category] || 'slate';
}

export { getServiceStatusLabel };