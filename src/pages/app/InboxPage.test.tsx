import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { toast } from 'sonner';
import { InboxPage } from './InboxPage';
import authReducer from '../../features/auth/authSlice';
import * as convApi from '../../services/api/conversation';
import * as custApi from '../../services/api/customer';
import type { User } from '../../features/auth/types';
import type { Conversation, Message } from '../../features/conversations/types';
import type { Customer } from '../../features/customers/types';

vi.mock('../../services/api/conversation', () => ({
  fetchConversations: vi.fn(),
  fetchMessages: vi.fn(),
  updateConversationStatus: vi.fn(),
}));
vi.mock('../../services/api/customer', () => ({ fetchCustomers: vi.fn() }));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const conv = vi.mocked(convApi);
const cust = vi.mocked(custApi);

function makeUser(permissions: string[]): User {
  return {
    _id: 'u1',
    companyId: 'c1',
    name: 'Olivia',
    email: 'o@x.com',
    roleId: {
      _id: 'r',
      companyId: 'c1',
      name: 'Owner',
      slug: 'owner',
      permissions,
      isSystem: true,
      createdBy: null,
      createdAt: '',
      updatedAt: '',
      __v: 0,
    },
    employeeCode: '',
    department: '',
    title: '',
    managerId: null,
    status: 'active',
    isEmailVerified: true,
    isDeleted: false,
    lastLoginAt: null,
    createdAt: '',
    updatedAt: '',
    __v: 0,
  };
}

function conversation(o: Partial<Conversation>): Conversation {
  return {
    _id: 'x',
    companyId: 'c1',
    customerId: 'cu-1',
    channelType: 'whatsapp',
    status: 'open',
    createdAt: '2025-01-02T00:00:00.000Z',
    updatedAt: '2025-01-02T00:00:00.000Z',
    ...o,
  };
}

const c1 = conversation({ _id: 'c-1', title: 'Order enquiry', customerId: 'cu-1' });
const c2 = conversation({ _id: 'c-2', title: 'Refund request', customerId: 'cu-2', channelType: 'email', status: 'waiting' });

const ada: Customer = {
  _id: 'cu-1',
  companyId: 'c1',
  name: 'Ada Lovelace',
  email: 'ada@x.com',
  phone: '+2348011111111',
  status: 'active',
  isDeleted: false,
  deletedAt: null,
  createdAt: '',
  updatedAt: '',
};
const ben: Customer = { ...ada, _id: 'cu-2', name: 'Ben Carter', email: 'ben@x.com' };

const messages: Message[] = [
  { _id: 'm1', companyId: 'c1', conversationId: 'c-1', senderType: 'customer', body: 'Where is my order?', createdAt: '2025-01-02T10:00:00.000Z', updatedAt: '' },
  { _id: 'm2', companyId: 'c1', conversationId: 'c-1', senderType: 'agent', body: 'It ships today.', createdAt: '2025-01-02T10:01:00.000Z', updatedAt: '', metadata: { model: 'mock-model' } },
];

const ALL = ['conversations:read', 'conversations:messages:read', 'conversations:update', 'customers:read'];

function renderPage(permissions: string[] = ALL, url = '/inbox') {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: {
        user: makeUser(permissions),
        company: null,
        accessToken: 'a',
        refreshToken: 'r',
        isAuthenticated: true,
        isInitializing: false,
        isLoading: false,
        error: null,
      },
    },
  });
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[url]}>
          <InboxPage />
        </MemoryRouter>
      </QueryClientProvider>
    </Provider>
  );
}

const list = () => within(screen.getByRole('list', { name: 'Conversations' }));

describe('InboxPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    conv.fetchConversations.mockResolvedValue([c1, c2]);
    conv.fetchMessages.mockResolvedValue(messages);
    cust.fetchCustomers.mockResolvedValue([ada, ben]);
  });

  it('lists conversations with real customer names and a count', async () => {
    renderPage();
    expect(await list().findByText('Order enquiry')).toBeInTheDocument();
    expect(list().getByText(/Ada Lovelace/)).toBeInTheDocument();
    expect(list().getByText(/Ben Carter/)).toBeInTheDocument();
    expect(screen.getByText('2 conversations')).toBeInTheDocument();
  });

  it('shows loading, empty and error states, and retries', async () => {
    const user = userEvent.setup();
    conv.fetchConversations.mockReturnValueOnce(new Promise(() => {}));
    const a = renderPage();
    expect(screen.getByRole('status', { name: /loading conversations/i })).toBeInTheDocument();
    a.unmount();

    conv.fetchConversations.mockResolvedValueOnce([]);
    const b = renderPage();
    expect(await screen.findByText('No conversations yet')).toBeInTheDocument();
    b.unmount();

    conv.fetchConversations.mockRejectedValueOnce(new Error('Inbox offline'));
    renderPage();
    expect(await screen.findByText('Inbox offline')).toBeInTheDocument();
    expect(screen.queryByText('No conversations yet')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /try again/i }));
    expect(await list().findByText('Order enquiry')).toBeInTheDocument();
  });

  it('is restricted and makes no requests without conversations:read', () => {
    renderPage(['customers:read']);
    expect(screen.getByText('Restricted access')).toBeInTheDocument();
    expect(conv.fetchConversations).not.toHaveBeenCalled();
  });

  it('does not request customers without customers:read and falls back gracefully', async () => {
    renderPage(['conversations:read']);
    expect(await list().findByText('Order enquiry')).toBeInTheDocument();
    expect(cust.fetchCustomers).not.toHaveBeenCalled();
  });

  it('searches by title or customer and filters by status', async () => {
    const user = userEvent.setup();
    renderPage();
    await list().findByText('Order enquiry');

    await user.type(screen.getByLabelText('Search conversations'), 'ben');
    expect(list().getByText('Refund request')).toBeInTheDocument();
    expect(list().queryByText('Order enquiry')).not.toBeInTheDocument();

    await user.clear(screen.getByLabelText('Search conversations'));
    await user.selectOptions(screen.getByLabelText('Filter by status'), 'waiting');
    expect(list().getByText('Refund request')).toBeInTheDocument();
    expect(list().queryByText('Order enquiry')).not.toBeInTheDocument();

    await user.type(screen.getByLabelText('Search conversations'), 'zzz');
    expect(screen.getByText('No matching conversations')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /clear filters/i }));
    expect(await list().findByText('Order enquiry')).toBeInTheDocument();
  });

  it('opens a conversation, loads its messages and shows customer context', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(await list().findByRole('button', { name: /Order enquiry/ }));

    const thread = within(await screen.findByRole('list', { name: 'Messages' }));
    expect(thread.getByText('Where is my order?')).toBeInTheDocument();
    expect(thread.getByText('It ships today.')).toBeInTheDocument();
    expect(thread.getByText(/AI agent · mock-model/)).toBeInTheDocument();
    expect(conv.fetchMessages).toHaveBeenCalledWith('c-1', 100);
    const region = within(screen.getByRole('region', { name: 'Conversation' }));
    expect(region.getByText('ada@x.com')).toBeInTheDocument();
    expect(screen.getByText(/read-only/i)).toBeInTheDocument();
  });

  it('opens the conversation named in the URL and handles an unknown id', async () => {
    renderPage(ALL, '/inbox?c=c-2');
    expect(await screen.findByRole('heading', { name: 'Refund request' })).toBeInTheDocument();
    expect(conv.fetchMessages).toHaveBeenCalledWith('c-2', 100);
  });

  it('says so when the URL points at a conversation that is not in this workspace', async () => {
    renderPage(ALL, '/inbox?c=someone-elses');
    expect(await screen.findByText(/wasn’t found/i)).toBeInTheDocument();
    expect(conv.fetchMessages).not.toHaveBeenCalled();
  });

  it('renders message bodies as plain text, never as HTML', async () => {
    conv.fetchMessages.mockResolvedValue([
      { _id: 'm9', companyId: 'c1', conversationId: 'c-1', senderType: 'customer', body: '<b>bold?</b><img src=x onerror=alert(1)>', createdAt: '2025-01-02T10:00:00.000Z', updatedAt: '' },
    ]);
    renderPage(ALL, '/inbox?c=c-1');
    const thread = await screen.findByRole('list', { name: 'Messages' });
    expect(within(thread).getByText(/<b>bold\?<\/b>/)).toBeInTheDocument();
    expect(thread.querySelector('b')).toBeNull();
    expect(thread.querySelector('img')).toBeNull();
  });

  it('does not request messages without conversations:messages:read', async () => {
    renderPage(['conversations:read'], '/inbox?c=c-1');
    expect(await screen.findByText(/permission to read messages/i)).toBeInTheDocument();
    expect(conv.fetchMessages).not.toHaveBeenCalled();
  });

  it('shows a message error with retry', async () => {
    const user = userEvent.setup();
    conv.fetchMessages.mockRejectedValueOnce(new Error('Messages unavailable'));
    renderPage(ALL, '/inbox?c=c-1');
    expect(await screen.findByText(/Messages unavailable/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByText('Where is my order?')).toBeInTheDocument();
  });

  it('changes status with the exact payload and confirms only after success', async () => {
    const user = userEvent.setup();
    conv.updateConversationStatus.mockResolvedValue({ ...c1, status: 'resolved' });
    renderPage(ALL, '/inbox?c=c-1');
    await screen.findByText('Where is my order?');

    await user.selectOptions(screen.getByLabelText('Status'), 'resolved');
    await waitFor(() => expect(conv.updateConversationStatus).toHaveBeenCalledTimes(1));
    expect(conv.updateConversationStatus.mock.calls[0]).toEqual(['c-1', 'resolved']);
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Conversation marked resolved.'));
  });

  it('shows the server error and keeps the old status when the change fails', async () => {
    const user = userEvent.setup();
    conv.updateConversationStatus.mockRejectedValue(new Error('Cannot update this conversation.'));
    renderPage(ALL, '/inbox?c=c-1');
    await screen.findByText('Where is my order?');

    await user.selectOptions(screen.getByLabelText('Status'), 'archived');
    expect(await screen.findByText('Cannot update this conversation.')).toBeInTheDocument();
    expect(screen.getByLabelText('Status')).toHaveValue('open');
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('hides the status control for users without conversations:update', async () => {
    renderPage(['conversations:read', 'conversations:messages:read'], '/inbox?c=c-1');
    await screen.findByText('Where is my order?');
    expect(screen.queryByLabelText('Status')).not.toBeInTheDocument();
  });
});
