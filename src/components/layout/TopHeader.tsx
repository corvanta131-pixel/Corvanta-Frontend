import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu,
  Bell,
  ChevronRight,
  LayoutDashboard,
  Users,
  MessageSquare,
  Bot,
  MessageCircle,
  BookOpen,
  GitBranch,
  FileText,
  Settings,
  Building2,
  Sparkles,
} from 'lucide-react';
import { UserMenu } from './UserMenu';
import { useAppSelector } from '../../hooks';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

const routeBreadcrumbs: Record<string, BreadcrumbItem[]> = {
  '/dashboard': [{ label: 'Dashboard' }],
  '/company': [{ label: 'Company' }],
  '/services': [{ label: 'Company' }, { label: 'Services' }],
  '/team': [{ label: 'Company' }, { label: 'Team' }],
  '/customers': [{ label: 'Customers' }],
  '/inbox': [{ label: 'Inbox' }],
  '/agents': [{ label: 'AI Agents' }],
  '/channels': [{ label: 'Channels' }],
  '/knowledge': [{ label: 'Knowledge' }],
  '/workflows': [{ label: 'Workflows' }],
  '/audit': [{ label: 'Audit' }],
  '/settings': [{ label: 'Settings' }],
};

export function TopHeader() {
  const location = useLocation();
  const { user, company } = useAppSelector((state) => state.auth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const breadcrumbs = routeBreadcrumbs[location.pathname] || [
    { label: location.pathname.split('/')[1] || 'Dashboard' },
  ];

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
      <div className="h-full flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 lg:gap-6">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 rounded-md text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            aria-label="Open menu"
            aria-expanded={mobileMenuOpen}
          >
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>

          <nav className="hidden sm:flex sm:items-center sm:gap-1" aria-label="Breadcrumb">
            <ol className="flex items-center gap-1" role="list">
              {breadcrumbs.map((crumb, index) => (
                <li key={crumb.label} className="flex items-center gap-1">
                  {index > 0 && (
                    <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" aria-hidden="true" />
                  )}
                  {crumb.href ? (
                    <Link
                      to={crumb.href}
                      className="text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-sm font-medium text-slate-950 dark:text-slate-50" aria-current="page">
                      {crumb.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <button
              className="relative p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" aria-hidden="true" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" aria-label="3 unread notifications" />
            </button>
          </div>

          <div className="hidden lg:flex lg:items-center lg:gap-4 px-3 py-1.5 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" aria-hidden="true" />
            <div className="text-right">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Workspace</p>
              <p className="text-sm font-semibold text-slate-950 dark:text-slate-50 truncate max-w-[160px]">
                {company?.name || 'Unknown Company'}
              </p>
            </div>
          </div>

          <UserMenu user={user} />
        </div>
      </div>

      {mobileMenuOpen && (
        <MobileMenuOverlay onClose={() => setMobileMenuOpen(false)} />
      )}
    </header>
  );
}

function MobileMenuOverlay({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile navigation"
    >
      <div
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className="absolute inset-y-0 right-0 w-72 bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800">
          <span className="text-lg font-semibold text-slate-950 dark:text-slate-50">Navigation</span>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label="Close menu"
          >
            <ChevronRight className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <nav className="p-4 space-y-6 overflow-y-auto">
          <MobileNavSection title="Main" items={[
            { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
            { label: 'Customers', href: '/customers', icon: <Users className="h-5 w-5" /> },
            { label: 'Inbox', href: '/inbox', icon: <MessageSquare className="h-5 w-5" /> },
            { label: 'AI Agents', href: '/agents', icon: <Bot className="h-5 w-5" /> },
            { label: 'Channels', href: '/channels', icon: <MessageCircle className="h-5 w-5" /> },
            { label: 'Knowledge', href: '/knowledge', icon: <BookOpen className="h-5 w-5" /> },
            { label: 'Workflows', href: '/workflows', icon: <GitBranch className="h-5 w-5" /> },
          ]} onClose={onClose} />
          <MobileNavSection title="Company" items={[
            { label: 'Company', href: '/company', icon: <Building2 className="h-5 w-5" /> },
            { label: 'Services', href: '/services', icon: <Sparkles className="h-5 w-5" /> },
            { label: 'Team', href: '/team', icon: <Users className="h-5 w-5" /> },
          ]} onClose={onClose} />
          <MobileNavSection title="Administration" items={[
            { label: 'Audit', href: '/audit', icon: <FileText className="h-5 w-5" /> },
            { label: 'Settings', href: '/settings', icon: <Settings className="h-5 w-5" /> },
          ]} onClose={onClose} />
        </nav>
      </aside>
    </div>
  );
}

function MobileNavSection({
  title,
  items,
  onClose,
}: {
  title: string;
  items: { label: string; href: string; icon: React.ReactNode }[];
  onClose: () => void;
}) {
  return (
    <div>
      <h3 className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        {title}
      </h3>
      <ul className="space-y-1 mt-1" role="list">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              to={item.href}
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-colors"
            >
              {item.icon}
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}