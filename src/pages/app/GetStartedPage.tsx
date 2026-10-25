import { PartyPopper, RefreshCw, Rocket } from 'lucide-react';
import { PageTitle } from '../../components/ui/PageTitle';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { SetupStepItem } from '../../components/setup/SetupStepItem';
import { useSetupStatus } from '../../features/setup/hooks';

export function GetStartedPage() {
  const { steps, progress, refresh } = useSetupStatus();
  const percent = progress.total === 0 ? 0 : Math.round((progress.done / progress.total) * 100);

  return (
    <div className="space-y-6">
      <PageTitle
        title="Get started"
        description="Take your AI assistant from set-up to live customer chats"
        icon={Rocket}
        action={
          <Button variant="outline" onClick={refresh}>
            <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
            Check again
          </Button>
        }
      />

      <Card>
        <CardContent className="space-y-3 py-5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">
              {progress.done} of {progress.total} steps done
            </span>
            <span className="text-slate-500">{percent}%</span>
          </div>
          <div
            role="progressbar"
            aria-label="Setup progress"
            aria-valuemin={0}
            aria-valuemax={progress.total}
            aria-valuenow={progress.done}
            className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
          >
            <div className="h-full rounded-full bg-indigo-600 transition-[width]" style={{ width: `${percent}%` }} />
          </div>
          {progress.unchecked > 0 && (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {progress.unchecked} {progress.unchecked === 1 ? 'step cannot' : 'steps cannot'} be checked with your role, so the total may be incomplete.
            </p>
          )}
        </CardContent>
      </Card>

      {progress.complete && (
        <div role="status" className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-green-800 dark:border-green-900 dark:bg-green-900/20 dark:text-green-300">
          <PartyPopper className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
          <p className="font-medium">You’re live. Your assistant is answering customers on your website.</p>
        </div>
      )}

      <ol className="space-y-3" aria-label="Setup steps">
        {steps.map((step, index) => (
          <SetupStepItem key={step.id} step={step} index={index} />
        ))}
      </ol>
    </div>
  );
}
