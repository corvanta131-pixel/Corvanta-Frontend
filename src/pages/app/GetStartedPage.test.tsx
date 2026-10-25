import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { GetStartedPage } from './GetStartedPage';
import authReducer from '../../features/auth/authSlice';
import * as agentApi from '../../services/api/agent';
import * as docApi from '../../services/api/knowledgeDocument';
import * as channelApi from '../../services/api/channel';
import * as convApi from '../../services/api/conversation';
import * as empApi from '../../services/api/employee';
import type { User } from '../../features/auth/types';
import type { Agent } from '../../features/agents/types';
import type { Channel, WidgetView } from '../../features/channels/types';
import type { Conversation } from '../../features/conversations/types';
import type { KnowledgeDocument } from '../../features/knowledge/types';
import type { Employee } from '../../features/users/types';

vi.mock('../../services/api/agent', () => ({
  fetchAgents: vi.fn(),
  listAgents: vi.fn(),
  createAgent: vi.fn(),
  updateAgent: vi.fn(),
  deleteAgent: vi.fn(),
  fetchAgentOptions: vi.fn(),
}));
vi.mock('../../services/api/knowledgeDocument', () => ({
  listDocuments: vi.fn(),
  createDocument: vi.fn(),
  updateDocument: vi.fn(),
  deleteDocument: vi.fn(),
  indexDocument: vi.fn(),
  removeDocumentIndex: vi.fn(),
  searchKnowledge: vi.fn(),
}));
vi.mock('../../services/api/channel', () => ({
  fetchChannels: vi.fn(),
  createWebchatChannel: vi.fn(),
  fetchWidgetSettings: vi.fn(),
  saveWidgetSettings: vi.fn(),
}));
vi.mock('../../services/api/conversation', () => ({
  fetchConversations: vi.fn(),
  fetchMessages: vi.fn(),
  updateConversationStatus: vi.fn(),
  updateConversation: vi.fn(),
  sendReply: vi.fn(),
}));
vi.mock('../../services/api/employee', () => ({
  fetchEmployees: vi.fn(),
  fetchEmployee: vi.fn(),
  createEmployee: vi.fn(),
  updateEmployee: vi.fn(),
  deleteEmployee: vi.fn(),
}));

const ag = vi.mocked(agentApi);
const docs = vi.mocked(docApi);
const ch = vi.mocked(channelApi);
const conv = vi.mocked(convApi);
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

const agent: Agent = {
  _id: 'a-1',
  name: 'Support bot',
  slug: 'support-bot',
  status: 'active',
  provider: 'mock',
  model: 'mock-model',
  temperature: 0.2,
  maxTokens: 512,
  promptTemplate: 'Help.',
  knowledgeBaseIds: ['kb-1'],
  createdAt: '',
  updatedAt: '',
};
const publishedDoc: KnowledgeDocument = { _id: 'd-1', knowledgeBaseId: 'kb-1', title: 'FAQ', status: 'published', indexingState: 'unindexed', chunkCount: 0, createdAt: '', updatedAt: '' };
const webchat: Channel = { _id: 'ch-1', companyId: 'c1', name: 'Website chat', type: 'webchat', status: 'active', createdAt: '', updatedAt: '' };
const readyWidget: WidgetView = {
  channelId: 'ch-1',
  enabled: true,
  ready: true,
  problems: [],
  widget: { key: 'wk_x', allowedOrigins: ['https://a.com'], agentId: 'a-1', agentName: 'Support bot', agentStatus: 'active', title: 'Chat', welcomeMessage: '', color: '#4f46e5' },
  embedSnippet: '<script></script>',
};
const visitorChat: Conversation = { _id: 'cv-1', companyId: 'c1', customerId: 'cu-1', channelType: 'webchat', status: 'open', createdAt: '', updatedAt: '' };
function employee(id: string): Employee {
  return {
    _id: id,
    companyId: 'c1',
    name: id,
    email: `${id}@x.com`,
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
  };
}

const ALL = ['agents:read', 'knowledge:read', 'channels:read', 'conversations:read', 'employees:read'];

function renderPage(permissions: string[] = ALL) {
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
        <MemoryRouter>
          <GetStartedPage />
        </MemoryRouter>
      </QueryClientProvider>
    </Provider>
  );
}

/** Waits for checking to finish: the progress text only settles once every step has an answer. */
const steps = async () => within(await screen.findByRole('list', { name: 'Setup steps' }));

describe('GetStartedPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ag.listAgents.mockResolvedValue([]);
    docs.listDocuments.mockResolvedValue([]);
    ch.fetchChannels.mockResolvedValue([]);
    ch.fetchWidgetSettings.mockResolvedValue(readyWidget);
    conv.fetchConversations.mockResolvedValue([]);
    emp.fetchEmployees.mockResolvedValue([employee('e-1')]);
  });

  it('shows a brand-new workspace as 0 of 4 with a link for each step', async () => {
    renderPage();
    expect(await screen.findByText('0 of 4 steps done')).toBeInTheDocument();
    const list = await steps();
    await waitFor(() => expect(list.getAllByRole('link')).toHaveLength(5));
    expect(list.getByRole('link', { name: 'Open AI Agents' })).toHaveAttribute('href', '/agents');
    expect(list.getByRole('link', { name: 'Open Knowledge' })).toHaveAttribute('href', '/knowledge');
    expect(list.getByRole('link', { name: 'Open Channels' })).toHaveAttribute('href', '/channels');
    expect(list.getByRole('link', { name: 'Open Inbox' })).toHaveAttribute('href', '/inbox');
    expect(list.getByRole('link', { name: 'Open Team' })).toHaveAttribute('href', '/team');
    expect(screen.queryByText(/You’re live/)).not.toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Setup progress' })).toHaveAttribute('aria-valuenow', '0');
  });

  it('shows "You’re live" only when the data proves every required step', async () => {
    ag.listAgents.mockResolvedValue([agent]);
    docs.listDocuments.mockResolvedValue([publishedDoc]);
    ch.fetchChannels.mockResolvedValue([webchat]);
    conv.fetchConversations.mockResolvedValue([visitorChat]);
    emp.fetchEmployees.mockResolvedValue([employee('e-1'), employee('e-2')]);
    renderPage();

    expect(await screen.findByText('4 of 4 steps done')).toBeInTheDocument();
    expect(await screen.findByText(/You’re live/)).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Setup progress' })).toHaveAttribute('aria-valuenow', '4');
    expect(docs.listDocuments).toHaveBeenCalledWith('kb-1');
    expect(ch.fetchWidgetSettings).toHaveBeenCalledWith('ch-1');
    const list = await steps();
    expect(list.queryByRole('link')).not.toBeInTheDocument();
  });

  it('shows the server’s own reason when website chat is not ready', async () => {
    ag.listAgents.mockResolvedValue([agent]);
    ch.fetchChannels.mockResolvedValue([webchat]);
    ch.fetchWidgetSettings.mockResolvedValue({ ...readyWidget, ready: false, problems: ['Add the website address where the chat will appear.'] });
    renderPage();
    expect(await screen.findByText('Add the website address where the chat will appear.')).toBeInTheDocument();
    expect(screen.getByText(/1 of 4 steps done/)).toBeInTheDocument();
  });

  it('explains what is missing when knowledge is attached but nothing is published', async () => {
    ag.listAgents.mockResolvedValue([agent]);
    docs.listDocuments.mockResolvedValue([{ ...publishedDoc, status: 'draft' }]);
    renderPage();
    expect(await screen.findByText(/Add a document to the attached knowledge base and keep it Published/)).toBeInTheDocument();
  });

  it('does not count a conversation from another channel as proof the website chat works', async () => {
    ag.listAgents.mockResolvedValue([agent]);
    conv.fetchConversations.mockResolvedValue([{ ...visitorChat, channelType: 'email' }]);
    renderPage();
    expect(await screen.findByText(/Paste the embed code on your website/)).toBeInTheDocument();
  });

  it('only checks what the user is allowed to, and says the rest cannot be checked', async () => {
    renderPage(['agents:read']);
    expect(await screen.findByText(/cannot be checked with your role/)).toBeInTheDocument();
    expect(ag.listAgents).toHaveBeenCalled();
    expect(ch.fetchChannels).not.toHaveBeenCalled();
    expect(conv.fetchConversations).not.toHaveBeenCalled();
    expect(emp.fetchEmployees).not.toHaveBeenCalled();
    expect(docs.listDocuments).not.toHaveBeenCalled();
    const list = await steps();
    expect(list.getAllByText(/Your role cannot check this step/).length).toBeGreaterThanOrEqual(3);
  });

  it('reports a failed check instead of pretending, and offers the link', async () => {
    ag.listAgents.mockRejectedValue(new Error('Agents offline'));
    renderPage();
    const list = await steps();
    expect((await list.findAllByText(/We could not check this step/)).length).toBeGreaterThan(0);
    expect(list.getByRole('link', { name: 'Open AI Agents' })).toBeInTheDocument();
    expect(screen.queryByText(/You’re live/)).not.toBeInTheDocument();
  });

  it('checks again on request', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('0 of 4 steps done');
    const before = ag.listAgents.mock.calls.length;
    await user.click(screen.getByRole('button', { name: /check again/i }));
    await waitFor(() => expect(ag.listAgents.mock.calls.length).toBeGreaterThan(before));
  });

  it('labels the teammate step optional and leaves it out of the total', async () => {
    renderPage();
    const list = await steps();
    expect(await list.findByText('Optional')).toBeInTheDocument();
    expect(screen.getByText('0 of 4 steps done')).toBeInTheDocument();
  });
});
