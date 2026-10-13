import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertCircle, Lock, MessageSquare, RefreshCw, Search } from 'lucide-react';
import { PageTitle } from '../../components/ui/PageTitle';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/Alert';
import { Card, CardContent } from '../../components/ui/Card';
import { ConversationList } from '../../components/inbox/ConversationList';
import { ConversationDetail } from '../../components/inbox/ConversationDetail';
import { useAppSelector } from '../../hooks';
import { can } from '../../utils/permissions';
import { getErrorMessage, isForbiddenError } from '../../utils/apiError';
import { useConversations } from '../../features/conversations/hooks';
import { useCustomerList } from '../../features/customers/hooks';
import {
  CONVERSATION_STATUS_LABELS,
  filterConversations,
  type ConversationFilterState,
} from '../../features/conversations/conversationUtils';
import { CONVERSATION_STATUSES, type ConversationStatus } from '../../features/conversations/types';

const EMPTY: ConversationFilterState = { search: '', status: '' };

export function InboxPage() {
  const user = useAppSelector((state) => state.auth.user);
  const canRead = can('conversations:read', user);
  const canReadMessages = can('conversations:messages:read', user);
  const canUpdate = can('conversations:update', user);
  const canReadCustomers = can('customers:read', user);

  const { data, isLoading, isError, error, refetch, isFetching } = useConversations(canRead);
  const { data: customers } = useCustomerList(canReadCustomers);

  const [searchParams, setSearchParams] = useSearchParams();
  const selectedId = searchParams.get('c');
  const [filters, setFilters] = useState<ConversationFilterState>(EMPTY);

  const conversations = useMemo(() => data ?? [], [data]);
  const customerNames = useMemo(
    () => new Map((customers ?? []).map((c) => [c._id, c.name] as const)),
    [customers]
  );
  const visible = useMemo(
    () => filterConversations(conversations, customerNames, filters),
    [conversations, customerNames, filters]
  );
  const selected = conversations.find((c) => c._id === selectedId) ?? null;
  const selectedCustomer = selected ? (customers ?? []).find((c) => c._id === selected.customerId) ?? null : null;
  const filtersActive = filters.search.trim() !== '' || filters.status !== '';

  const select = (id: string) => setSearchParams({ c: id });
  const clearSelection = () => setSearchParams({});

  return (
    <div className="space-y-6">
      <PageTitle
        title="Inbox"
        description={
          canRead && data
            ? `${conversations.length} ${conversations.length === 1 ? 'conversation' : 'conversations'}${
                filtersActive ? ` · showing ${visible.length}` : ''
              }`
            : 'Customer conversations across all channels'
        }
        icon={MessageSquare}
      />

      {!canRead ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <Lock className="h-8 w-8 text-slate-400" aria-hidden="true" />
            <h2 className="text-lg font-semibold">Restricted access</h2>
            <p className="max-w-md text-sm text-slate-600 dark:text-slate-400">
              You don’t have permission to view conversations. Ask a workspace owner if you need access.
            </p>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div role="status" aria-label="Loading conversations" className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
      ) : isError ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          <div>
            <AlertTitle>{isForbiddenError(error) ? 'Access denied' : 'Couldn’t load conversations'}</AlertTitle>
            <AlertDescription>
              <p>{getErrorMessage(error, 'We couldn’t load conversations.')}</p>
              {!isForbiddenError(error) && (
                <Button variant="outline" size="sm" className="mt-3" onClick={() => void refetch()} disabled={isFetching}>
                  <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
                  Try again
                </Button>
              )}
            </AlertDescription>
          </div>
        </Alert>
      ) : conversations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <MessageSquare className="h-8 w-8 text-slate-400" aria-hidden="true" />
            <h2 className="text-lg font-semibold">No conversations yet</h2>
            <p className="max-w-md text-sm text-slate-600 dark:text-slate-400">
              Conversations from your connected channels will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-[22rem_1fr] rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden md:h-[calc(100vh-14rem)] md:min-h-[28rem]">
          <section
            aria-label="Conversation list"
            className={`${selected || selectedId ? 'hidden md:flex' : 'flex'} flex-col border-r border-slate-200 dark:border-slate-800 min-h-0`}
          >
            <div className="p-3 space-y-2 border-b border-slate-200 dark:border-slate-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" aria-hidden="true" />
                <Input
                  type="search"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  placeholder="Search conversations"
                  className="pl-9"
                  aria-label="Search conversations"
                />
              </div>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value as '' | ConversationStatus })}
                className="h-9 w-full rounded-md border border-slate-300 bg-white px-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                aria-label="Filter by status"
              >
                <option value="">All statuses</option>
                {CONVERSATION_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {CONVERSATION_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 overflow-y-auto">
              {visible.length === 0 ? (
                <div className="p-6 text-center space-y-3">
                  <p className="font-medium">No matching conversations</p>
                  <Button variant="outline" size="sm" onClick={() => setFilters(EMPTY)}>
                    Clear filters
                  </Button>
                </div>
              ) : (
                <ConversationList
                  conversations={visible}
                  customerNames={customerNames}
                  selectedId={selectedId}
                  onSelect={select}
                />
              )}
            </div>
          </section>

          <section
            aria-label="Conversation"
            className={`${selected || selectedId ? 'flex' : 'hidden md:flex'} flex-col min-h-[24rem] md:min-h-0`}
          >
            {selected ? (
              <ConversationDetail
                key={selected._id}
                conversation={selected}
                customer={selectedCustomer}
                canReadMessages={canReadMessages}
                canUpdate={canUpdate}
                onBack={clearSelection}
              />
            ) : selectedId ? (
              <div className="m-auto p-6 text-center space-y-3">
                <p className="font-medium">That conversation wasn’t found.</p>
                <p className="text-sm text-slate-500">It may have been removed, or it belongs to another workspace.</p>
                <Button variant="outline" size="sm" onClick={clearSelection}>
                  Back to conversations
                </Button>
              </div>
            ) : (
              <div className="m-auto p-6 text-center text-slate-500">
                <MessageSquare className="mx-auto h-8 w-8 mb-2" aria-hidden="true" />
                Select a conversation to read it.
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
