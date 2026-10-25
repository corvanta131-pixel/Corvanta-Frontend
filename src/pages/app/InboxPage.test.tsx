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
import * as empApi from '../../services/api/employee';
import type { User } from '../../features/auth/types';
import type { Conversation, Message } from '../../features/conversations/types';
import type { Customer } from '../../features/customers/types';
import type { Employee } from '../../features/users/types';

vi.mock('../../services/api/conversation', () => ({
  fetchConversations: vi.fn(),
  fetchMessages: vi.fn(),
  updateConversationStatus: vi.fn(),
  updateConversation: vi.fn(),
  sendReply: vi.fn(),
}));
vi.mock('../../services/api/customer', () => ({ fetchCustomers: vi.fn() }));
vi.mock('../../services/api/employee', () => ({
  fetchEmployees: vi.fn(),
  fetchEmployee: vi.fn(),
  createEmployee: vi.fn(),
  updateEmployee: vi.fn(),
  deleteEmployee: vi.fn(),
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const conv = vi.mocked(convApi);
const cust = vi.mocked(custApi);
const emp = vi.mocked(empApi);

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
    channelType: 'webchat',
    handlingMode: 'AI',
    status: 'open',
    createdAt: '2025-01-02T00:00:00.000Z',
    updatedAt: '2025-01-02T00:00:00.000Z',
    ...o,
  };
}

function employee(o: Partial<Employee>): Employee {
  return {
    _id: 'x',
    companyId: 'c1',
    name: 'Name',
    email: 'n@x.com',
    roleId: null,
    employeeCode: '',
    department: '',
    title: '',
    managerId: null,
    status: 'active',
    isEmailVerified: false,
    isDeleted: false,
    lastLoginAt: null,
    createdAt: '',
    updatedAt: '',
    __v: 0,
    ...o,
  };
}

const c1 = conversation({ _id: 'c-1', title: 'Order enquiry', customerId: 'cu-1' });
const c2 = conversation({ _id: 'c-2', title: 'Refund request', customerId: 'cu-2', channelType: 'email', status: 'waiting' });
const c3 = conversation({ _id: 'c-3', title: 'Delivery delay', customerId: 'cu-1', handlingMode: 'HUMAN' });

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

const ALL = [
  'conversations:read',
  'conversations:messages:read',
  'conversations:update',
  'conversations:send',
  'customers:read',
  'employees:read',
];

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

/** Waits for the list to appear (the page shows a loading skeleton first), then scopes queries to it. */
const findList = async () => within(await screen.findByRole('list', { name: 'Conversations' }));

describe('InboxPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    conv.fetchConversations.mockResolvedValue([c1, c2]);
    conv.fetchMessages.mockResolvedValue(messages);
    cust.fetchCustomers.mockResolvedValue([ada, ben]);
    emp.fetchEmployees.mockResolvedValue([
      employee({ _id: 'emp-1', name: 'Sam Staff' }),
      employee({ _id: 'emp-2', name: 'Dee Disabled', status: 'disabled' }),
    ]);
  });

  it('lists conversations with real customer names and a count', async () => {
    renderPage();
    expect(await (await findList()).findByText('Order enquiry')).toBeInTheDocument();
    const list = await findList();
    expect(list.getByText(/Ada Lovelace/)).toBeInTheDocument();
    expect(list.getByText(/Ben Carter/)).toBeInTheDocument();
    expect(screen.getByText('2 conversations')).toBeInTheDocument();
  });

  it('marks conversations a person is handling', async () => {
    conv.fetchConversations.mockResolvedValue([c1, c3]);
    renderPage();
    const list = await findList();
    expect(await list.findByText(/Team handling/)).toBeInTheDocument();
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
    expect(await (await findList()).findByText('Order enquiry')).toBeInTheDocument();
  });

  it('is restricted and makes no requests without conversations:read', () => {
    renderPage(['customers:read']);
    expect(screen.getByText('Restricted access')).toBeInTheDocument();
    expect(conv.fetchConversations).not.toHaveBeenCalled();
  });

  it('does not request customers without customers:read', async () => {
    renderPage(['conversations:read']);
    expect(await (await findList()).findByText('Order enquiry')).toBeInTheDocument();
    expect(cust.fetchCustomers).not.toHaveBeenCalled();
  });

  it('searches by title or customer and filters by status', async () => {
    const user = userEvent.setup();
    renderPage();
    await (await findList()).findByText('Order enquiry');

    await user.type(screen.getByLabelText('Search conversations'), 'ben');
    expect((await findList()).getByText('Refund request')).toBeInTheDocument();
    expect((await findList()).queryByText('Order enquiry')).not.toBeInTheDocument();

    await user.clear(screen.getByLabelText('Search conversations'));
    await user.selectOptions(screen.getByLabelText('Filter by status'), 'waiting');
    expect((await findList()).getByText('Refund request')).toBeInTheDocument();
    expect((await findList()).queryByText('Order enquiry')).not.toBeInTheDocument();

    await user.type(screen.getByLabelText('Search conversations'), 'zzz');
    expect(screen.getByText('No matching conversations')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /clear filters/i }));
    expect(await (await findList()).findByText('Order enquiry')).toBeInTheDocument();
  });

  it('opens a conversation, loads its messages and shows customer context', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(await (await findList()).findByRole('button', { name: /Order enquiry/ }));

    const thread = within(await screen.findByRole('list', { name: 'Messages' }));
    expect(thread.getByText('Where is my order?')).toBeInTheDocument();
    expect(thread.getByText('It ships today.')).toBeInTheDocument();
    expect(thread.getByText(/AI agent · mock-model/)).toBeInTheDocument();
    expect(conv.fetchMessages).toHaveBeenCalledWith('c-1', 100);
    const region = within(screen.getByRole('region', { name: 'Conversation' }));
    expect(region.getByText('ada@x.com')).toBeInTheDocument();
  });

  it('opens the conversation named in the URL', async () => {
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

  it('hides status, handoff and assignment controls without conversations:update', async () => {
    renderPage(['conversations:read', 'conversations:messages:read'], '/inbox?c=c-1');
    await screen.findByText('Where is my order?');
    expect(screen.queryByLabelText('Status')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /take over/i })).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Assigned to')).not.toBeInTheDocument();
    expect(screen.getByText(/The AI assistant is handling this conversation\.$/)).toBeInTheDocument();
  });

  it('shows what the channel provider said about delivery, including failures with the reason', async () => {
    conv.fetchMessages.mockResolvedValue([
      { _id: 'm1', companyId: 'c1', conversationId: 'c-1', senderType: 'user', body: 'On our way', createdAt: '2025-01-02T10:00:00.000Z', updatedAt: '', delivery: { status: 'delivered', error: null, channelType: 'whatsapp' } },
      { _id: 'm2', companyId: 'c1', conversationId: 'c-1', senderType: 'user', body: 'Second note', createdAt: '2025-01-02T10:01:00.000Z', updatedAt: '', delivery: { status: 'failed', error: 'Outside the 24-hour window', channelType: 'whatsapp' } },
    ]);
    renderPage(ALL, '/inbox?c=c-1');
    const thread = within(await screen.findByRole('list', { name: 'Messages' }));
    expect(await thread.findByText('Delivered')).toBeInTheDocument();
    expect(thread.getByRole('alert')).toHaveTextContent('Not delivered: Outside the 24-hour window');
  });

  it('shows no delivery line for messages without delivery information', async () => {
    renderPage(ALL, '/inbox?c=c-1');
    const thread = within(await screen.findByRole('list', { name: 'Messages' }));
    await thread.findByText('Where is my order?');
    expect(thread.queryByRole('alert')).not.toBeInTheDocument();
    expect(thread.queryByText('Delivered')).not.toBeInTheDocument();
  });

  // ---- handoff, assignment and replying ---------------------------------------------------

  it('shows who is handling the conversation and no reply box while the AI is', async () => {
    renderPage(ALL, '/inbox?c=c-1');
    await screen.findByText('Where is my order?');
    expect(screen.getByTestId('handling-label')).toHaveTextContent('AI assistant');
    expect(screen.queryByLabelText('Reply')).not.toBeInTheDocument();
    expect(screen.getByText(/Take over to reply yourself/i)).toBeInTheDocument();
  });

  it('takes over with the exact payload, then offers the reply box', async () => {
    const user = userEvent.setup();
    conv.fetchConversations.mockResolvedValueOnce([c1, c2]).mockResolvedValue([{ ...c1, handlingMode: 'HUMAN' }, c2]);
    conv.updateConversation.mockResolvedValue({ ...c1, handlingMode: 'HUMAN' });
    renderPage(ALL, '/inbox?c=c-1');
    await screen.findByText('Where is my order?');

    await user.click(screen.getByRole('button', { name: 'Take over' }));
    await waitFor(() => expect(conv.updateConversation).toHaveBeenCalledTimes(1));
    expect(conv.updateConversation.mock.calls[0]).toEqual(['c-1', { handlingMode: 'HUMAN' }]);
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('You’re now handling this conversation.'));
    expect(await screen.findByLabelText('Reply')).toBeInTheDocument();
    expect(screen.getByTestId('handling-label')).toHaveTextContent('Your team');
    expect(screen.getByRole('button', { name: 'Hand back to AI' })).toBeInTheDocument();
  });

  it('hands back to the AI, and shows the server reason when it cannot', async () => {
    const user = userEvent.setup();
    conv.updateConversation.mockRejectedValue(new Error('This conversation has no active AI agent to hand back to.'));
    conv.fetchConversations.mockResolvedValue([c1, c2, c3]);
    renderPage(ALL, '/inbox?c=c-3');
    await screen.findByLabelText('Reply');

    await user.click(screen.getByRole('button', { name: 'Hand back to AI' }));
    await waitFor(() => expect(conv.updateConversation).toHaveBeenCalledTimes(1));
    expect(conv.updateConversation.mock.calls[0]).toEqual(['c-3', { handlingMode: 'AI' }]);
    expect(await screen.findByText(/no active AI agent to hand back to/i)).toBeInTheDocument();
    expect(toast.success).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Reply')).toBeInTheDocument();
  });

  it('sends a reply with the exact text and clears the box only after success', async () => {
    const user = userEvent.setup();
    conv.fetchConversations.mockResolvedValue([c3]);
    conv.sendReply.mockResolvedValue({ _id: 'm-new', companyId: 'c1', conversationId: 'c-3', senderType: 'user', body: 'We are looking into it.', createdAt: '2025-01-02T11:00:00.000Z', updatedAt: '' });
    renderPage(ALL, '/inbox?c=c-3');

    const box = await screen.findByLabelText('Reply');
    expect(screen.getByRole('button', { name: 'Send reply' })).toBeDisabled();
    await user.type(box, '  We are looking into it.  ');
    await user.click(screen.getByRole('button', { name: 'Send reply' }));

    await waitFor(() => expect(conv.sendReply).toHaveBeenCalledTimes(1));
    expect(conv.sendReply.mock.calls[0]).toEqual(['c-3', 'We are looking into it.']);
    await waitFor(() => expect(screen.getByLabelText('Reply')).toHaveValue(''));
  });

  it('keeps the draft and shows the reason when a reply fails', async () => {
    const user = userEvent.setup();
    conv.fetchConversations.mockResolvedValue([c3]);
    conv.sendReply.mockRejectedValue(new Error('Take over this conversation before replying.'));
    renderPage(ALL, '/inbox?c=c-3');

    await user.type(await screen.findByLabelText('Reply'), 'Hello there');
    await user.click(screen.getByRole('button', { name: 'Send reply' }));
    expect(await screen.findByText('Take over this conversation before replying.')).toBeInTheDocument();
    expect(screen.getByLabelText('Reply')).toHaveValue('Hello there');
    expect(screen.getByRole('button', { name: 'Send reply' })).toBeEnabled();
  });

  it('sends with Ctrl+Enter', async () => {
    const user = userEvent.setup();
    conv.fetchConversations.mockResolvedValue([c3]);
    conv.sendReply.mockResolvedValue({ _id: 'm-new', companyId: 'c1', conversationId: 'c-3', senderType: 'user', body: 'Quick', createdAt: '2025-01-02T11:00:00.000Z', updatedAt: '' });
    renderPage(ALL, '/inbox?c=c-3');
    await user.type(await screen.findByLabelText('Reply'), 'Quick{Control>}{Enter}{/Control}');
    await waitFor(() => expect(conv.sendReply).toHaveBeenCalledTimes(1));
    expect(conv.sendReply.mock.calls[0]).toEqual(['c-3', 'Quick']);
  });

  it('hides the reply box without conversations:send, and for archived conversations', async () => {
    conv.fetchConversations.mockResolvedValue([c3]);
    const first = renderPage(['conversations:read', 'conversations:messages:read'], '/inbox?c=c-3');
    expect(await screen.findByText(/permission to send replies/i)).toBeInTheDocument();
    expect(screen.queryByLabelText('Reply')).not.toBeInTheDocument();
    first.unmount();

    conv.fetchConversations.mockResolvedValue([{ ...c3, status: 'archived' }]);
    renderPage(ALL, '/inbox?c=c-3');
    expect(await screen.findByText(/archived, so it can’t receive replies/i)).toBeInTheDocument();
    expect(screen.queryByLabelText('Reply')).not.toBeInTheDocument();
  });

  it('keeps an unsent draft when switching to another conversation and back', async () => {
    const user = userEvent.setup();
    conv.fetchConversations.mockResolvedValue([c2, c3]);
    renderPage(ALL, '/inbox?c=c-3');
    await user.type(await screen.findByLabelText('Reply'), 'Half written');

    await user.click((await findList()).getByRole('button', { name: /Refund request/ }));
    await screen.findByRole('heading', { name: 'Refund request' });
    expect(screen.queryByLabelText('Reply')).not.toBeInTheDocument();

    await user.click((await findList()).getByRole('button', { name: /Delivery delay/ }));
    expect(await screen.findByLabelText('Reply')).toHaveValue('Half written');
  });

  it('assigns to an active teammate with the exact payload and can unassign', async () => {
    const user = userEvent.setup();
    conv.updateConversation.mockResolvedValue({ ...c1, assigneeId: 'emp-1' });
    renderPage(ALL, '/inbox?c=c-1');
    await screen.findByText('Where is my order?');

    await screen.findByRole('option', { name: 'Sam Staff' });
    expect(screen.queryByRole('option', { name: 'Dee Disabled' })).not.toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Assigned to'), 'emp-1');
    await waitFor(() => expect(conv.updateConversation).toHaveBeenCalledTimes(1));
    expect(conv.updateConversation.mock.calls[0]).toEqual(['c-1', { assigneeId: 'emp-1' }]);
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Assignment updated.'));
  });

  it('unassigns with a null assignee', async () => {
    const user = userEvent.setup();
    conv.fetchConversations.mockResolvedValue([{ ...c1, assigneeId: 'emp-1' }]);
    conv.updateConversation.mockResolvedValue({ ...c1, assigneeId: null });
    renderPage(ALL, '/inbox?c=c-1');
    await screen.findByRole('option', { name: 'Sam Staff' });
    await waitFor(() => expect(screen.getByLabelText('Assigned to')).toHaveValue('emp-1'));

    await user.selectOptions(screen.getByLabelText('Assigned to'), '');
    await waitFor(() => expect(conv.updateConversation).toHaveBeenCalledTimes(1));
    expect(conv.updateConversation.mock.calls[0]).toEqual(['c-1', { assigneeId: null }]);
  });

  it('does not request employees or show assignment without employees:read', async () => {
    renderPage(['conversations:read', 'conversations:messages:read', 'conversations:update'], '/inbox?c=c-1');
    await screen.findByText('Where is my order?');
    expect(emp.fetchEmployees).not.toHaveBeenCalled();
    expect(screen.queryByLabelText('Assigned to')).not.toBeInTheDocument();
  });
});
