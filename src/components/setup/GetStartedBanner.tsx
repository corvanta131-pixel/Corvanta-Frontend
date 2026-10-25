import { Link } from 'react-router-dom';
import { Rocket } from 'lucide-react';

/** A plain link card: it makes no network calls, so the dashboard stays fast and predictable. */
export function GetStartedBanner() {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-indigo-200 bg-indigo-50 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-indigo-900 dark:bg-indigo-900/20">
      <div className="flex items-start gap-3">
        <Rocket className="mt-0.5 h-5 w-5 flex-shrink-0 text-indigo-600 dark:text-indigo-300" aria-hidden="true" />
        <div>
          <p className="font-semibold text-slate-950 dark:text-slate-50">Set up your AI assistant</p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Follow the checklist to take customer chats live on your website.
          </p>
        </div>
      </div>
      <Link
        to="/get-started"
        className="inline-flex h-10 items-center justify-center rounded-md bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
      >
        See the checklist
      </Link>
    </div>
  );
}
