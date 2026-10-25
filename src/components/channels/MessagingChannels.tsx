import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/Button';
import { ConnectorPanel } from './ConnectorPanel';
import { useCreateChannel } from '../../features/channels/hooks';
import { MESSAGING_TYPES, type Channel, type MessagingType } from '../../features/channels/types';
import { CHANNEL_LABELS } from '../../features/customers/customerUtils';
import { getErrorMessage } from '../../utils/apiError';

interface MessagingChannelsProps {
  channels: Channel[];
  canCreate: boolean;
  canUpdate: boolean;
  canReadAgents: boolean;
}

const BLURB: Record<MessagingType, string> = {
  whatsapp: 'Answer customers on WhatsApp through the WhatsApp Business Cloud API.',
  messenger: 'Answer messages sent to your Facebook Page.',
  instagram: 'Answer direct messages sent to your Instagram professional account.',
  sms: 'Answer text messages sent to your Twilio phone number.',
  email: 'Send replies from your own address and receive customer emails.',
};

const STATUS_TEXT: Record<Channel['status'], string> = {
  active: 'Switched on',
  inactive: 'Switched off',
  connecting: 'Connecting',
  error: 'Needs attention',
};

export function MessagingChannels({ channels, canCreate, canUpdate, canReadAgents }: MessagingChannelsProps) {
  const create = useCreateChannel();
  const [openType, setOpenType] = useState<MessagingType | null>(null);
  const [creating, setCreating] = useState<MessagingType | null>(null);
  const [error, setError] = useState<{ type: MessagingType; message: string } | null>(null);

  const setUp = async (type: MessagingType) => {
    setCreating(type);
    setError(null);
    try {
      await create.mutateAsync({ name: CHANNEL_LABELS[type], type });
      setOpenType(type);
      toast.success(`${CHANNEL_LABELS[type]} channel created. Add your credentials below.`);
    } catch (e) {
      setError({ type, message: getErrorMessage(e) });
    } finally {
      setCreating(null);
    }
  };

  return (
    <ul className="space-y-3" aria-label="Messaging channels">
      {MESSAGING_TYPES.map((type) => {
        const channel = channels.find((c) => c.type === type) ?? null;
        const open = openType === type && channel !== null;
        return (
          <li key={type} className="list-none rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-semibold">{CHANNEL_LABELS[type]}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{BLURB[type]}</p>
                <p className="mt-1 text-xs text-slate-500">{channel ? STATUS_TEXT[channel.status] : 'Not set up'}</p>
              </div>
              {channel ? (
                <Button
                  variant="outline"
                  size="sm"
                  aria-expanded={open}
                  onClick={() => setOpenType(open ? null : type)}
                  aria-label={`${open ? 'Hide' : 'Manage'} ${CHANNEL_LABELS[type]}`}
                >
                  {open ? 'Hide' : 'Manage'}
                </Button>
              ) : canCreate ? (
                <Button size="sm" disabled={creating === type} onClick={() => void setUp(type)} aria-label={`Set up ${CHANNEL_LABELS[type]}`}>
                  {creating === type ? 'Setting up…' : 'Set up'}
                </Button>
              ) : (
                <span className="text-xs text-slate-500">Ask a workspace owner to set this up.</span>
              )}
            </div>
            {error && error.type === type && (
              <p role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">
                {error.message}
              </p>
            )}
            {open && channel && (
              <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-800">
                <ConnectorPanel channelId={channel._id} canEdit={canUpdate} canReadAgents={canReadAgents} />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
