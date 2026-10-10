import { ChevronDown, LogOut, User, Settings, Building2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useLogout } from '../../features/auth/hooks';
import { useState, useRef, useEffect } from 'react';
import type { User as UserType } from '../../features/auth/types';

interface UserMenuProps {
  user: UserType | null;
}

export function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const { mutate: logout, isPending } = useLogout();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    logout(undefined, {
      onSuccess: () => {
        navigate('/login', { replace: true });
      },
      onError: () => {
        navigate('/login', { replace: true });
      },
    });
    setIsOpen(false);
  };

  if (!user) {
    return (
      <Link
        to="/login"
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-slate-100"
      >
        Sign In
      </Link>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User menu"
      >
        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
          <User className="h-5 w-5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-sm font-medium text-slate-950 dark:text-slate-50 truncate max-w-[140px]">
            {user.name}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[140px]">
            {user.email}
          </p>
        </div>
        <ChevronDown className="h-4 w-4 text-slate-500 flex-shrink-0" aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-lg ring-1 ring-black/5 focus:outline-none animate-in fade-in-0 zoom-in-95 duration-150"
          role="menu"
          aria-orientation="vertical"
        >
          <div className="p-3 border-b border-slate-200 dark:border-slate-800">
            <p className="text-sm font-medium text-slate-950 dark:text-slate-50 truncate">{user.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 capitalize mt-0.5">
              {typeof user.roleId === 'object' ? (user.roleId as { name: string }).name : user.roleId}
            </p>
          </div>

          <div className="py-1">
            <Link
              to="/settings"
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              role="menuitem"
              onClick={() => setIsOpen(false)}
            >
              <Settings className="h-4 w-4" aria-hidden="true" />
              Settings
            </Link>

            <Link
              to="/company"
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              role="menuitem"
              onClick={() => setIsOpen(false)}
            >
              <Building2 className="h-4 w-4" aria-hidden="true" />
              Company
            </Link>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 py-1">
            <button
              onClick={handleLogout}
              disabled={isPending}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 dark:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              role="menuitem"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              {isPending ? 'Signing out...' : 'Logout'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}