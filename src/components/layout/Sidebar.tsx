import { Link, useLocation } from 'react-router-dom';
import {
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
  ChevronRight,
} from 'lucide-react';
import { useAppSelector } from '../../hooks';
import { can } from '../../utils/permissions';
import { useState } from 'react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  permission?: string;
  children?: NavItem[];
}

const mainNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Customers', href: '/customers', icon: <Users className="h-5 w-5" />, permission: 'customers:read' },
  { label: 'Inbox', href: '/inbox', icon: <MessageSquare className="h-5 w-5" />, permission: 'conversations:read' },
  { label: 'AI Agents', href: '/agents', icon: <Bot className="h-5 w-5" />, permission: 'agents:read' },
  { label: 'Channels', href: '/channels', icon: <MessageCircle className="h-5 w-5" />, permission: 'channels:read' },
  { label: 'Knowledge', href: '/knowledge', icon: <BookOpen className="h-5 w-5" />, permission: 'knowledge:read' },
  { label: 'Workflows', href: '/workflows', icon: <GitBranch className="h-5 w-5" />, permission: 'workflows:read' },
];

const companyNavItems: NavItem[] = [
  { label: 'Company', href: '/company', icon: <Building2 className="h-5 w-5" />, permission: 'companies:read' },
  { label: 'Services', href: '/services', icon: <Sparkles className="h-5 w-5" />, permission: 'services:read' },
  { label: 'Team', href: '/team', icon: <Users className="h-5 w-5" />, permission: 'employees:read' },
];

const adminNavItems: NavItem[] = [
  { label: 'Audit', href: '/audit', icon: <FileText className="h-5 w-5" />, permission: 'audit:read' },
  { label: 'Settings', href: '/settings', icon: <Settings className="h-5 w-5" />, permission: 'settings:read' },
];

export function Sidebar({ className = '' }: { className?: string }) {
  const location = useLocation();
  const { user } = useAppSelector((state) => state.auth);
  const [expandedSections, setExpandedSections] = useState<{ main: boolean; company: boolean; admin: boolean }>({
    main: true,
    company: true,
    admin: true,
  });

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(href);
  };

  const toggleSection = (section: 'main' | 'company' | 'admin') => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const filteredMainNav = mainNavItems.filter((item) => !item.permission || can(item.permission, user));
  const filteredCompanyNav = companyNavItems.filter((item) => !item.permission || can(item.permission, user));
  const filteredAdminNav = adminNavItems.filter((item) => !item.permission || can(item.permission, user));

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${className}`}
      aria-label="Main navigation"
    >
      <div className="flex flex-col h-full">
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 rounded-md"
            aria-label="Corvanta Dashboard"
          >
            <Sparkles className="h-8 w-8 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
            <span className="text-xl font-bold text-slate-950 dark:text-slate-50">
              Corvanta
            </span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6" aria-label="Sidebar navigation">
          <NavSection
            title="Main"
            items={filteredMainNav}
            isActive={isActive}
            expanded={expandedSections.main}
            onToggle={() => toggleSection('main')}
          />
          <NavSection
            title="Company"
            items={filteredCompanyNav}
            isActive={isActive}
            expanded={expandedSections.company}
            onToggle={() => toggleSection('company')}
          />
          <NavSection
            title="Administration"
            items={filteredAdminNav}
            isActive={isActive}
            expanded={expandedSections.admin}
            onToggle={() => toggleSection('admin')}
          />
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="px-3 py-2 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Version 1.0.0
          </div>
        </div>
      </div>
    </aside>
  );
}

interface NavSectionProps {
  title: string;
  items: NavItem[];
  isActive: (href: string) => boolean;
  expanded: boolean;
  onToggle: () => void;
}

function NavSection({ title, items, isActive, expanded, onToggle }: NavSectionProps) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-1">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
        aria-expanded={expanded}
      >
        {title}
        <ChevronRight
          className={`h-4 w-4 text-slate-400 transition-transform ${expanded ? 'rotate-90' : ''}`}
          aria-hidden="true"
        />
      </button>

      <div className={`transition-all duration-200 ease-in-out ${expanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <ul className="space-y-1 mt-1" role="list">
          {items.map((item) => (
            <li key={item.href}>
              <Link
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950 ${
                  isActive(item.href)
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                }`}
                aria-current={isActive(item.href) ? 'page' : undefined}
              >
                {item.icon}
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}