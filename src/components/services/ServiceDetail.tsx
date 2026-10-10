import { Link } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/Dialog';
import { Button } from '../ui/Button';
import { getServiceStatusLabel, type Service } from '../../features/services/catalog';
import {
  MessageSquare,
  Bot,
  MessageCircle,
  BookOpen,
  GitBranch,
  Users,
  Users as UsersIcon,
} from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  'message-square': <MessageSquare className="h-6 w-6" />,
  bot: <Bot className="h-6 w-6" />,
  'message-circle': <MessageCircle className="h-6 w-6" />,
  'book-open': <BookOpen className="h-6 w-6" />,
  'git-branch': <GitBranch className="h-6 w-6" />,
  users: <Users className="h-6 w-6" />,
  'users-2': <UsersIcon className="h-6 w-6" />,
};

interface ServiceDetailProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ServiceDetail({ service, isOpen, onClose }: ServiceDetailProps) {
  if (!service) return null;

  const status = getServiceStatusLabel(service.status);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className={`w-12 h-12 rounded-xl bg-${getCategoryColor(service.category)}/10 dark:bg-${getCategoryColor(service.category)}/900/30 flex items-center justify-center flex-shrink-0`}>
              {iconMap[service.icon] || <MessageSquare className="h-6 w-6" />}
            </div>
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${status.className} flex-shrink-0`}>
              {status.label}
            </span>
          </div>
          <DialogTitle className="mt-4">{service.name}</DialogTitle>
          <DialogDescription>{service.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div>
            <h4 className="text-sm font-medium text-slate-950 dark:text-slate-50 mb-2">Key Capabilities</h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2" role="list">
              {service.capabilities.map((cap) => (
                <li key={cap} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0" aria-hidden="true" />
                  {cap}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium text-slate-950 dark:text-slate-50 mb-2">Related Modules</h4>
            <div className="flex flex-wrap gap-2">
              {service.relatedModules.map((module) => (
                <span key={module} className="px-3 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full">
                  {module}
                </span>
              ))}
            </div>
          </div>

          {service.learnMoreHref && (
            <Link to={service.learnMoreHref} className="block">
              <Button variant="outline" className="w-full">
                Go to {service.name}
              </Button>
            </Link>
          )}
        </div>

        <DialogFooter>
          {service.status === 'coming_soon' ? (
            <Button variant="outline" className="w-full" disabled>
              Coming Soon
            </Button>
          ) : service.learnMoreHref ? (
            <Link to={service.learnMoreHref}>
              <Button className="w-full">
                Learn More
              </Button>
            </Link>
          ) : (
            <Button variant="outline" className="w-full" disabled>
              Learn More
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
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