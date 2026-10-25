import { AlertCircle, Lock, MessageCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { PageTitle } from '../../components/ui/PageTitle';
import { Button } from '../../components/ui/Button';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/Alert';
import { Card, CardContent } from '../../components/ui/Card';
import { WebChatPanel } from '../../components/channels/WebChatPanel';
import { MessagingChannels } from '../../components/channels/MessagingChannels';
import { useAppSelector } from '../../hooks';
import { can } from '../../utils/permissions';
import { getErrorMessage, isForbiddenError } from '../../utils/apiError';
import { useChannels, useCreateWebchatChannel } from '../../features/channels/hooks';

export function ChannelsPage() {
  const user = useAppSelector((state) => state.auth.user);
  const canRead = can('channels:read', user);
  const canCreate = can('channels:create', user);
  const canUpdate = can('channels:update', user);
  const canReadAgents = can('agents:read', user);

  const { data, isLoading, isError, error, refetch, isFetching } = useChannels(canRead);
  const createMutation = useCreateWebchatChannel();

  const webchat = (data ?? []).find((c) => c.type === 'webchat') ?? null;

  const setUp = async () => {
    try {
      await createMutation.mutateAsync('Website chat');
      toast.success('Website chat created. Finish the settings below.');
    } catch {
      // Shown below via createMutation.error.
    }
  };

  return (
    <div className="space-y-6">
      <PageTitle
        title="Channels"
        description="Where your customers can reach you"
        icon={MessageCircle}
      />

      {!canRead ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <Lock className="h-8 w-8 text-slate-400" aria-hidden="true" />
            <h2 className="text-lg font-semibold">Restricted access</h2>
            <p className="max-w-md text-sm text-slate-600 dark:text-slate-400">
              You don’t have permission to view channels. Ask a workspace owner if you need access.
            </p>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div role="status" aria-label="Loading channels" className="space-y-3">
          {[0, 1].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
      ) : isError ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          <div>
            <AlertTitle>{isForbiddenError(error) ? 'Access denied' : 'Couldn’t load channels'}</AlertTitle>
            <AlertDescription>
              <p>{getErrorMessage(error, 'We couldn’t load channels.')}</p>
              {!isForbiddenError(error) && (
                <Button variant="outline" size="sm" className="mt-3" onClick={() => void refetch()} disabled={isFetching}>
                  <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
                  Try again
                </Button>
              )}
            </AlertDescription>
          </div>
        </Alert>
      ) : (
        <>
          <section aria-labelledby="webchat-heading" className="space-y-4">
            <h2 id="webchat-heading" className="text-lg font-semibold">
              Website chat
            </h2>
            {webchat ? (
              <WebChatPanel channelId={webchat._id} canEdit={canUpdate} canReadAgents={canReadAgents} />
            ) : (
              <Card>
                <CardContent className="flex flex-col items-start gap-3 py-8">
                  <p className="max-w-xl text-sm text-slate-600 dark:text-slate-400">
                    Add a chat bubble to your website. Visitors talk to your AI agent, and every conversation lands in
                    your Inbox.
                  </p>
                  {canCreate ? (
                    <Button onClick={() => void setUp()} disabled={createMutation.isPending}>
                      {createMutation.isPending ? 'Setting up…' : 'Set up website chat'}
                    </Button>
                  ) : (
                    <p className="text-sm text-slate-500">Ask a workspace owner to set up website chat.</p>
                  )}
                  {createMutation.error && (
                    <p role="alert" className="text-sm text-red-600 dark:text-red-400">
                      {getErrorMessage(createMutation.error)}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </section>

          <section aria-labelledby="messaging-heading" className="space-y-4">
            <h2 id="messaging-heading" className="text-lg font-semibold">
              Messaging channels
            </h2>
            <MessagingChannels
              channels={data ?? []}
              canCreate={canCreate}
              canUpdate={canUpdate}
              canReadAgents={canReadAgents}
            />
          </section>

          <section aria-labelledby="other-channels-heading">
            <h2 id="other-channels-heading" className="text-lg font-semibold">
              Not available yet
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              X (Twitter) and TikTok are not available yet. Their messaging access needs approved business API accounts, which Corvanta
              does not connect to today.
            </p>
          </section>
        </>
      )}
    </div>
  );
}
