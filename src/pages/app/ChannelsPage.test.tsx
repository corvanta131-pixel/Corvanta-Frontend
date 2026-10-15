import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { toast } from 'sonner';
import { ChannelsPage } from './ChannelsPage';
import { parseOrigins } from '../../components/channels/WebChatPanel';
import authReducer from '../../features/auth/authSlice';
import * as channelApi from '../../services/api/channel';
import * as agentApi from '../../services/api/agent';
import type { User } from '../../features/auth/types';
import type { Channel, WidgetView } from '../../features/channels/types';

vi.mock('../../services/api/channel', () => ({
  fetchChannels: vi.fn(),
  createWebchatChannel: vi.fn(),
  fetchWidgetSettings: vi.fn(),
  saveWidgetSettings: vi.fn(),
}));
vi.mock('../../services/api/agent', () => ({ fetchAgents: vi.fn() }));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const ch = vi.mocked(channelApi);
const ag = vi.mocked(agentApi);

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

const webchat: Channel = {
  _id: 'ch-1',
  companyId: 'c1',
  name: 'Website chat',
  type: 'webchat',
  status: 'inactive',
  createdAt: '',
  updatedAt: '',
};

const SNIPPET = '<script src="https://api.example.com/api/v1/widget/embed.js" data-key="wk_abc123abc123" async></script>';

function view(over: Partial<WidgetView> = {}): WidgetView {
  return {
    channelId: 'ch-1',
    enabled: false,
    ready: false,
    problems: ['Choose an AI agent to answer visitors.', 'The widget is switched off.'],
    widget: {
      key: 'wk_abc123abc123',
      allowedOrigins: ['https://shop.example.com'],
      agentId: null,
      agentName: null,
      agentStatus: null,
      title: 'Chat with us',
      welcomeMessage: 'Hi! How can we help you today?',
      color: '#4f46e5',
    },
    embedSnippet: SNIPPET,
    ...over,
  };
}

const ALL = ['channels:read', 'channels:create', 'channels:update', 'agents:read'];

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
          <ChannelsPage />
        </MemoryRouter>
      </QueryClientProvider>
    </Provider>
  );
}

describe('parseOrigins', () => {
  it('splits on new lines and commas and drops blanks', () => {
    expect(parseOrigins('https://a.com\n\n https://b.com , https://c.com ')).toEqual([
      'https://a.com',
      'https://b.com',
      'https://c.com',
    ]);
    expect(parseOrigins('   ')).toEqual([]);
  });
});

describe('ChannelsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ch.fetchChannels.mockResolvedValue([webchat]);
    ch.fetchWidgetSettings.mockResolvedValue(view());
    ag.fetchAgents.mockResolvedValue([
      { _id: 'a-1', name: 'Support bot', status: 'active' },
      { _id: 'a-2', name: 'Draft bot', status: 'draft' },
    ]);
  });

  it('is restricted and makes no requests without channels:read', () => {
    renderPage(['customers:read']);
    expect(screen.getByText('Restricted access')).toBeInTheDocument();
    expect(ch.fetchChannels).not.toHaveBeenCalled();
  });

  it('shows loading, then an error with retry', async () => {
    const user = userEvent.setup();
    ch.fetchChannels.mockReturnValueOnce(new Promise(() => {}));
    const first = renderPage();
    expect(screen.getByRole('status', { name: /loading channels/i })).toBeInTheDocument();
    first.unmount();

    ch.fetchChannels.mockRejectedValueOnce(new Error('Channels offline'));
    renderPage();
    expect(await screen.findByText('Channels offline')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /try again/i }));
    expect(await screen.findByText('Website chat status')).toBeInTheDocument();
  });

  it('offers to set up website chat when none exists, and creates it', async () => {
    const user = userEvent.setup();
    ch.fetchChannels.mockResolvedValue([]);
    ch.createWebchatChannel.mockResolvedValue(webchat);
    renderPage();
    await user.click(await screen.findByRole('button', { name: /set up website chat/i }));
    await waitFor(() => expect(ch.createWebchatChannel).toHaveBeenCalledTimes(1));
    expect(ch.createWebchatChannel.mock.calls[0]?.[0]).toBe('Website chat');
    await waitFor(() => expect(toast.success).toHaveBeenCalled());
  });

  it('hides the set-up button without channels:create and shows a failure message when creation fails', async () => {
    ch.fetchChannels.mockResolvedValue([]);
    const first = renderPage(['channels:read']);
    expect(await screen.findByText(/ask a workspace owner to set up website chat/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /set up website chat/i })).not.toBeInTheDocument();
    first.unmount();

    const user = userEvent.setup();
    ch.createWebchatChannel.mockRejectedValue(new Error('A channel of type webchat already exists.'));
    renderPage();
    await user.click(await screen.findByRole('button', { name: /set up website chat/i }));
    expect(await screen.findByText(/already exists/i)).toBeInTheDocument();
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('shows the real readiness problems from the backend and a prefilled form', async () => {
    renderPage();
    expect(await screen.findByText('Not live yet')).toBeInTheDocument();
    expect(screen.getByText('Choose an AI agent to answer visitors.')).toBeInTheDocument();
    expect(screen.getByLabelText('Chat title')).toHaveValue('Chat with us');
    expect(screen.getByLabelText('Websites where the chat may appear')).toHaveValue('https://shop.example.com');
    expect(screen.getByLabelText('Chat is switched on')).not.toBeChecked();
  });

  it('shows the ready state with the agent name', async () => {
    ch.fetchWidgetSettings.mockResolvedValue(
      view({
        enabled: true,
        ready: true,
        problems: [],
        widget: { ...view().widget, agentId: 'a-1', agentName: 'Support bot', agentStatus: 'active' },
      })
    );
    renderPage();
    expect(await screen.findByText(/Ready\. Visitors on your allowed websites can chat with “Support bot”/)).toBeInTheDocument();
  });

  it('saves the exact settings payload and confirms only after success', async () => {
    const user = userEvent.setup();
    ch.saveWidgetSettings.mockResolvedValue(view({ enabled: true, ready: true, problems: [] }));
    renderPage();
    await screen.findByText('Not live yet');

    await screen.findByRole('option', { name: 'Support bot' });
    await user.selectOptions(screen.getByLabelText('AI agent that answers visitors'), 'a-1');
    const origins = screen.getByLabelText('Websites where the chat may appear');
    await user.clear(origins);
    await user.type(origins, 'https://a.com{enter}https://b.com');
    await user.click(screen.getByLabelText('Chat is switched on'));
    await user.click(screen.getByRole('button', { name: 'Save settings' }));

    await waitFor(() => expect(ch.saveWidgetSettings).toHaveBeenCalledTimes(1));
    expect(ch.saveWidgetSettings.mock.calls[0]?.[0]).toBe('ch-1');
    expect(ch.saveWidgetSettings.mock.calls[0]?.[1]).toEqual({
      enabled: true,
      title: 'Chat with us',
      welcomeMessage: 'Hi! How can we help you today?',
      color: '#4f46e5',
      agentId: 'a-1',
      allowedOrigins: ['https://a.com', 'https://b.com'],
    });
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Chat settings saved.'));
  });

  it('shows the server error and no success message when saving fails', async () => {
    const user = userEvent.setup();
    ch.saveWidgetSettings.mockRejectedValue(new Error('Use only the scheme and host, for example https://example.com'));
    renderPage();
    await screen.findByText('Not live yet');
    await user.click(screen.getByRole('button', { name: 'Save settings' }));
    expect(await screen.findByText(/Use only the scheme and host/)).toBeInTheDocument();
    expect(toast.success).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Chat title')).toHaveValue('Chat with us');
  });

  it('is read-only without channels:update', async () => {
    renderPage(['channels:read', 'agents:read']);
    await screen.findByText('Not live yet');
    expect(screen.getByLabelText('Chat title')).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Save settings' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /generate a new code/i })).not.toBeInTheDocument();
  });

  it('warns when there is no active agent and does not request agents without agents:read', async () => {
    ag.fetchAgents.mockResolvedValue([{ _id: 'a-2', name: 'Draft bot', status: 'draft' }]);
    const first = renderPage();
    expect(await screen.findByText(/no active agents/i)).toBeInTheDocument();
    first.unmount();

    vi.clearAllMocks();
    ch.fetchChannels.mockResolvedValue([webchat]);
    ch.fetchWidgetSettings.mockResolvedValue(view());
    renderPage(['channels:read', 'channels:update']);
    expect(await screen.findByText(/permission to list agents/i)).toBeInTheDocument();
    expect(ag.fetchAgents).not.toHaveBeenCalled();
  });

  it('shows the embed code and copies it', async () => {
    const user = userEvent.setup();
    renderPage();
    const box = await screen.findByLabelText('Embed code');
    expect(box).toHaveValue(SNIPPET);
    await user.click(screen.getByRole('button', { name: /copy code/i }));
    expect(await navigator.clipboard.readText()).toBe(SNIPPET);
    expect(toast.success).toHaveBeenCalledWith('Embed code copied.');
  });

  it('asks before generating a new embed code, and does nothing on cancel', async () => {
    const user = userEvent.setup();
    ch.saveWidgetSettings.mockResolvedValue(view());
    renderPage();
    await user.click(await screen.findByRole('button', { name: /generate a new code/i }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText(/stop working immediately/i)).toBeInTheDocument();
    expect(ch.saveWidgetSettings).not.toHaveBeenCalled();

    await user.click(within(dialog).getByRole('button', { name: /cancel/i }));
    expect(ch.saveWidgetSettings).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: /generate a new code/i }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: /generate new code/i }));
    await waitFor(() => expect(ch.saveWidgetSettings).toHaveBeenCalledTimes(1));
    expect(ch.saveWidgetSettings.mock.calls[0]?.[1]).toEqual({ rotateKey: true });
  });

  it('says plainly that other channels are not available yet', async () => {
    renderPage();
    expect(await screen.findByText(/WhatsApp, Instagram, Messenger, SMS, Email are not available yet/)).toBeInTheDocument();
  });
});
