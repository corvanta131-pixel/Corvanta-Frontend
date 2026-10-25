import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Circle, Loader2, Lock } from 'lucide-react';
import type { SetupStep } from '../../features/setup/setupSteps';

const STATUS_LABEL: Record<SetupStep['status'], string> = {
  done: 'Done',
  todo: 'To do',
  loading: 'Checking',
  error: 'Could not check',
  unavailable: 'Cannot check',
};

function StatusIcon({ status }: { status: SetupStep['status'] }) {
  const common = 'h-5 w-5 flex-shrink-0';
  switch (status) {
    case 'done':
      return <CheckCircle2 className={`${common} text-green-600 dark:text-green-400`} aria-hidden="true" />;
    case 'loading':
      return <Loader2 className={`${common} animate-spin text-slate-400`} aria-hidden="true" />;
    case 'error':
      return <AlertCircle className={`${common} text-red-600 dark:text-red-400`} aria-hidden="true" />;
    case 'unavailable':
      return <Lock className={`${common} text-slate-400`} aria-hidden="true" />;
    default:
      return <Circle className={`${common} text-slate-400`} aria-hidden="true" />;
  }
}

export function SetupStepItem({ step, index }: { step: SetupStep; index: number }) {
  const showAction = step.status === 'todo' || step.status === 'error';
  return (
    <li className="list-none rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-start gap-3">
        <StatusIcon status={step.status} />
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-slate-950 dark:text-slate-50">
            {step.optional ? step.title : `${index + 1}. ${step.title}`}
            {step.optional && <span className="ml-2 text-xs font-normal text-slate-500">Optional</span>}
          </h3>
          <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">{step.detail}</p>
          <p className="sr-only">Status: {STATUS_LABEL[step.status]}</p>
        </div>
        {showAction && (
          <Link
            to={step.href}
            className="inline-flex h-9 flex-shrink-0 items-center rounded-md border border-slate-300 px-3 text-sm font-medium hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-700 dark:hover:bg-slate-900"
          >
            {step.actionLabel}
          </Link>
        )}
      </div>
    </li>
  );
}
