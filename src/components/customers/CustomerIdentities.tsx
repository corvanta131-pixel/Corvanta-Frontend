import { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import {
  useCustomerIdentities,
  useCreateCustomerIdentity,
  useDeleteCustomerIdentity,
} from '../../features/customers/hooks';
import { CHANNEL_LABELS } from '../../features/customers/customerUtils';
import { CHANNEL_TYPES, type ChannelType } from '../../features/customers/types';
import { getErrorMessage } from '../../utils/apiError';

interface Props {
  customerId: string;
  canCreate: boolean;
  canDelete: boolean;
}

/** Linked channel identities (one per channel per customer, per backend unique index). */
export function CustomerIdentities({ customerId, canCreate, canDelete }: Props) {
  const { data, isLoading, isError, error, refetch } = useCustomerIdentities(customerId);
  const createMutation = useCreateCustomerIdentity();
  const deleteMutation = useDeleteCustomerIdentity(customerId);
  const [channelType, setChannelType] = useState<ChannelType | ''>('');
  const [externalId, setExternalId] = useState('');
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const identities = data ?? [];
  const linked = new Set(identities.map((i) => i.channelType));
  const available = CHANNEL_TYPES.filter((c) => !linked.has(c));
  const trimmed = externalId.trim();
  const canSubmit = channelType !== '' && trimmed.length > 0 && trimmed.length <= 255;

  const add = async () => {
    if (!canSubmit || channelType === '') return;
    try {
      await createMutation.mutateAsync({ customerId, channelType, externalId: trimmed });
      setChannelType('');
      setExternalId('');
    } catch {
      // Shown below via createMutation.error; the form keeps its values.
    }
  };

  const remove = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      setConfirmId(null);
    } catch {
      // Shown below via deleteMutation.error; the identity stays listed.
    }
  };

  return (
    <section aria-labelledby="identities-heading" className="space-y-3">
      <h3 id="identities-heading" className="text-sm font-semibold text-slate-950 dark:text-slate-50">
        Channel identities
      </h3>

      {isLoading ? (
        <p role="status" className="text-sm text-slate-500">Loading identities…</p>
      ) : isError ? (
        <div role="alert" className="text-sm text-red-600 dark:text-red-400">
          {getErrorMessage(error, 'Couldn’t load identities.')}{' '}
          <button type="button" className="underline" onClick={() => void refetch()}>Retry</button>
        </div>
      ) : identities.length === 0 ? (
        <p className="text-sm text-slate-500">No channel identities linked yet.</p>
      ) : (
        <ul className="divide-y divide-slate-200 dark:divide-slate-800 rounded-lg border border-slate-200 dark:border-slate-800">
          {identities.map((i) => (
            <li key={i._id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
              <div className="min-w-0">
                <span className="font-medium">{CHANNEL_LABELS[i.channelType]}</span>
                <span className="ml-2 text-slate-500 break-all">{i.externalId}</span>
              </div>
              {canDelete &&
                (confirmId === i._id ? (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => void remove(i._id)}
                      disabled={deleteMutation.isPending}
                      aria-label={`Confirm remove ${CHANNEL_LABELS[i.channelType]} identity`}
                    >
                      {deleteMutation.isPending ? 'Removing…' : 'Confirm'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setConfirmId(null);
                        deleteMutation.reset();
                      }}
                      disabled={deleteMutation.isPending}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setConfirmId(i._id)}
                    aria-label={`Remove ${CHANNEL_LABELS[i.channelType]} identity`}
                  >
                    Remove
                  </Button>
                ))}
            </li>
          ))}
        </ul>
      )}

      {deleteMutation.error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">{getErrorMessage(deleteMutation.error)}</p>
      )}

      {canCreate && !isLoading && !isError && (
        available.length === 0 ? (
          <p className="text-sm text-slate-500">Every supported channel is already linked.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-[10rem_1fr_auto] gap-2 items-end">
            <div className="space-y-1">
              <Label htmlFor="identity-channel">Channel</Label>
              <select
                id="identity-channel"
                value={channelType}
                onChange={(e) => setChannelType(e.target.value as ChannelType | '')}
                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
              >
                <option value="">Select…</option>
                {available.map((c) => (
                  <option key={c} value={c}>{CHANNEL_LABELS[c]}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="identity-external">Identifier</Label>
              <Input
                id="identity-external"
                value={externalId}
                onChange={(e) => setExternalId(e.target.value)}
                placeholder="Phone number, handle, or address"
                maxLength={255}
              />
            </div>
            <Button onClick={() => void add()} disabled={!canSubmit || createMutation.isPending}>
              {createMutation.isPending ? 'Linking…' : 'Link identity'}
            </Button>
          </div>
        )
      )}
      {createMutation.error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">{getErrorMessage(createMutation.error)}</p>
      )}
    </section>
  );
}
