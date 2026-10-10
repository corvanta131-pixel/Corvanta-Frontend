import { Link, useLocation } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Menu, X, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '#capabilities', label: 'Capabilities' },
    { href: '#how-it-works', label: 'How It Works' },
    { href: '#ai-agents', label: 'AI Agents' },
    { href: '#business-control', label: 'Business Control' },
  ];

  const handleLinkClick = (href: string) => {
    setIsOpen(false);
    if (location.pathname === '/') {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.location.href = `${window.location.origin}${href}`;
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm shadow-sm border-b border-slate-200 dark:border-slate-800'
          : 'bg-transparent'
      }`}
      role="banner"
    >
      <nav
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 rounded-md"
              aria-label="Corvanta Home"
            >
              <Sparkles className="h-8 w-8 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
              <span className="text-xl font-bold text-slate-950 dark:text-slate-50">
                Corvanta
              </span>
            </Link>

            <div className="hidden md:flex md:items-center md:gap-6">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => handleLinkClick(link.href)}
                  className="text-sm font-medium text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 rounded-md px-2 py-1"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          <div className="hidden md:flex md:items-center md:gap-4">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Get Started
              </Button>
            </Link>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="hidden sm:flex">
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white hidden sm:flex">
                Get Started
              </Button>
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        <div
          id="mobile-menu"
          className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
            isOpen ? 'max-h-64 opacity-100 pb-4' : 'max-h-0 opacity-0'
          }`}
          role="navigation"
          aria-label="Mobile navigation"
        >
          <div className="flex flex-col gap-2 pt-4">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleLinkClick(link.href)}
                className="text-left px-2 py-2 text-base font-medium text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
              >
                {link.label}
              </button>
            ))}
            <div className="flex flex-col gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
              <Link to="/login">
                <Button variant="outline" className="w-full justify-center">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button className="w-full justify-center">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}