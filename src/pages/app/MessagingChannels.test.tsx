import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { toast } from 'sonner';
import { ChannelsPage } from './ChannelsPage';
import authReducer from '../../features/auth/authSlice';
import * as channelApi from '../../services/api/channel';
import * as agentApi from '../../services/api/agent';
import type { User } from '../../features/auth/types';
import type { Channel, ConnectorView } from '../../features/channels/types';

vi.mock('../../services/api/channel', () => ({
  fetchChannels: vi.fn(),
  createWebchatChannel: vi.fn(),
  createChannel: vi.fn(),
  fetchWidgetSettings: vi.fn(),
  saveWidgetSettings: vi.fn(),
  fetchConnector: vi.fn(),
  saveConnector: vi.fn(),
  testConnector: vi.fn(),
  rotateSigningSecret: vi.fn(),
  clearConnector: vi.fn(),
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
    roleId: { _id: 'r', companyId: 'c1', name: 'Owner', slug: 'owner', permissions, isSystem: true, createdBy: null, createdAt: '', updatedAt: '', __v: 0 },
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

const whatsapp: Channel = { _id: 'ch-wa', companyId: 'c1', name: 'WhatsApp', type: 'whatsapp', status: 'inactive', createdAt: '', updatedAt: '' };
const emailCh: Channel = { _id: 'ch-em', companyId: 'c1', name: 'Email', type: 'email', status: 'inactive', createdAt: '', updatedAt: '' };

function waView(over: Partial<ConnectorView> = {}): ConnectorView {
  return {
    channelId: 'ch-wa',
    type: 'whatsapp',
    label: 'WhatsApp',
    status: 'inactive',
    enabled: false,
    storageReady: true,
    credentialsSaved: true,
    verified: false,
    ready: false,
    problems: ['Press Test connection to confirm the credentials work.', 'The channel is switched off.'],
    fields: [
      { name: 'phoneNumberId', label: 'Phone number ID', secret: false, required: true, help: 'From WhatsApp > API Setup.', configured: true, display: '1234567890' },
      { name: 'accessToken', label: 'Access token', secret: true, required: true, help: 'A permanent token.', configured: true, display: '••••9999' },
      { name: 'appSecret', label: 'App secret', secret: true, required: true, help: 'Meta app secret.', configured: false, display: null },
    ],
    webhook: { url: 'https://api.example.com/api/v1/webhooks/c/ck_abc', verifyToken: 'verify-me-123', needsSigningSecret: false },
    settings: { agentId: null, agentName: null, agentStatus: null, aiReplies: true },
    lastTest: null,
    ...over,
  };
}

function emailView(over: Partial<ConnectorView> = {}): ConnectorView {
  return {
    ...waView(),
    channelId: 'ch-em',
    type: 'email',
    label: 'Email',
    fields: [
      { name: 'apiKey', label: 'Resend API key', secret: true, required: true, help: 'From resend.com.', configured: true, display: '••••abcd' },
      { name: 'fromAddress', label: 'Send replies from', secret: false, required: true, help: 'A verified sender.', configured: true, display: 'Support <support@shop.com>' },
    ],
    webhook: { url: 'https://api.example.com/api/v1/webhooks/c/ck_email', verifyToken: null, needsSigningSecret: true },
    ...over,
  };
}

const ALL = ['channels:read', 'channels:create', 'channels:update', 'agents:read'];

function renderPage(permissions: string[] = ALL) {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: { user: makeUser(permissions), company: null, accessToken: 'a', refreshToken: 'r', isAuthenticated: true, isInitializing: false, isLoading: false, error: null },
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

const messaging = async () => within(await screen.findByRole('list', { name: 'Messaging channels' }));

describe('Messaging channels', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ch.fetchChannels.mockResolvedValue([whatsapp, emailCh]);
    ch.fetchConnector.mockImplementation(async (id) => (id === 'ch-em' ? emailView() : waView()));
    ag.fetchAgents.mockResolvedValue([{ _id: 'a-1', name: 'Support bot', status: 'active' }]);
  });

  it('lists the five providers with their real state', async () => {
    renderPage();
    const list = await messaging();
    for (const name of ['WhatsApp', 'Messenger', 'Instagram', 'SMS', 'Email']) {
      expect(list.getByRole('heading', { name })).toBeInTheDocument();
    }
    expect(list.getByRole('button', { name: 'Manage WhatsApp' })).toBeInTheDocument();
    expect(list.getByRole('button', { name: 'Set up Messenger' })).toBeInTheDocument();
    expect(list.getAllByText('Not set up')).toHaveLength(3);
  });

  it('creates the channel for a provider with the exact name and type', async () => {
    const user = userEvent.setup();
    ch.createChannel.mockResolvedValue({ ...whatsapp, _id: 'ch-sms', type: 'sms', name: 'SMS' });
    renderPage();
    await user.click((await messaging()).getByRole('button', { name: 'Set up SMS' }));
    await waitFor(() => expect(ch.createChannel).toHaveBeenCalledTimes(1));
    expect(ch.createChannel.mock.calls[0]).toEqual(['SMS', 'sms']);
    await waitFor(() => expect(toast.success).toHaveBeenCalled());
  });

  it('shows the server error when a channel cannot be created, and hides set-up without permission', async () => {
    const user = userEvent.setup();
    ch.createChannel.mockRejectedValue(new Error('A channel of type sms already exists.'));
    const first = renderPage();
    await user.click((await messaging()).getByRole('button', { name: 'Set up SMS' }));
    expect(await screen.findByText(/already exists/)).toBeInTheDocument();
    first.unmount();

    renderPage(['channels:read']);
    const list = await messaging();
    expect(list.queryByRole('button', { name: /^Set up/ })).not.toBeInTheDocument();
    expect(list.getAllByText(/Ask a workspace owner/).length).toBeGreaterThan(0);
  });

  it('shows what is missing and never calls a channel live until the server says so', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click((await messaging()).getByRole('button', { name: 'Manage WhatsApp' }));
    expect(await screen.findByText('Not live yet')).toBeInTheDocument();
    expect(screen.getByText('Press Test connection to confirm the credentials work.')).toBeInTheDocument();
    expect(ch.fetchConnector).toHaveBeenCalledWith('ch-wa');
    expect(screen.queryByText(/is connected and switched on/)).not.toBeInTheDocument();
  });

  it('never shows a saved secret, only a hint, and sends only the fields that changed', async () => {
    const user = userEvent.setup();
    ch.saveConnector.mockResolvedValue(waView());
    renderPage();
    await user.click((await messaging()).getByRole('button', { name: 'Manage WhatsApp' }));

    const token = await screen.findByLabelText('Access token');
    expect(token).toHaveValue('');
    expect(token).toHaveAttribute('placeholder', expect.stringContaining('••••9999'));
    expect(token).toHaveAttribute('type', 'password');
    expect(screen.getByLabelText('Phone number ID')).toHaveValue('1234567890');

    await user.type(screen.getByLabelText('App secret'), 'a-brand-new-app-secret');
    await user.selectOptions(screen.getByLabelText('AI agent'), 'a-1');
    await user.click(screen.getByLabelText('This channel is switched on'));
    await user.click(screen.getByRole('button', { name: 'Save settings' }));

    await waitFor(() => expect(ch.saveConnector).toHaveBeenCalledTimes(1));
    expect(ch.saveConnector.mock.calls[0]?.[0]).toBe('ch-wa');
    expect(ch.saveConnector.mock.calls[0]?.[1]).toEqual({
      credentials: { appSecret: 'a-brand-new-app-secret' },
      agentId: 'a-1',
      aiReplies: true,
      enabled: true,
    });
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('WhatsApp settings saved.'));
  });

  it('sends no credentials when none were edited, and shows server errors without success messages', async () => {
    const user = userEvent.setup();
    ch.saveConnector.mockRejectedValue(new Error('Phone number ID must be 5-30 characters.'));
    renderPage();
    await user.click((await messaging()).getByRole('button', { name: 'Manage WhatsApp' }));
    await screen.findByLabelText('Access token');
    await user.click(screen.getByRole('button', { name: 'Save settings' }));
    expect(await screen.findByText('Phone number ID must be 5-30 characters.')).toBeInTheDocument();
    expect(ch.saveConnector.mock.calls[0]?.[1]).toEqual({ agentId: null, aiReplies: true, enabled: false });
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('tests the connection and reports the provider’s answer, good or bad', async () => {
    const user = userEvent.setup();
    ch.testConnector.mockResolvedValueOnce(waView({ verified: true, lastTest: { ok: true, at: '', message: 'Connected to +234 801 234 5678.' } }));
    renderPage();
    await user.click((await messaging()).getByRole('button', { name: 'Manage WhatsApp' }));
    await screen.findByLabelText('Access token');

    await user.click(screen.getByRole('button', { name: 'Test connection' }));
    await waitFor(() => expect(ch.testConnector).toHaveBeenCalledWith('ch-wa'));
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Connected to +234 801 234 5678.'));

    ch.testConnector.mockResolvedValueOnce(waView({ lastTest: { ok: false, at: '', message: 'The access token is invalid or has expired.' } }));
    await user.click(screen.getByRole('button', { name: 'Test connection' }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('The access token is invalid or has expired.'));
  });

  it('only allows a test once the credentials are saved and unchanged', async () => {
    const user = userEvent.setup();
    ch.fetchConnector.mockResolvedValue(waView({ credentialsSaved: false }));
    const first = renderPage();
    await user.click((await messaging()).getByRole('button', { name: 'Manage WhatsApp' }));
    await screen.findByLabelText('Access token');
    expect(screen.getByRole('button', { name: 'Test connection' })).toBeDisabled();
    first.unmount();

    ch.fetchConnector.mockResolvedValue(waView());
    renderPage();
    await user.click((await messaging()).getByRole('button', { name: 'Manage WhatsApp' }));
    await user.type(await screen.findByLabelText('App secret'), 'typed-but-not-saved');
    expect(screen.getByRole('button', { name: 'Test connection' })).toBeDisabled();
    expect(screen.getByText(/Save your changes, then test the connection/)).toBeInTheDocument();
  });

  it('shows the webhook address and verify token, and copies them', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click((await messaging()).getByRole('button', { name: 'Manage WhatsApp' }));
    expect(await screen.findByLabelText('Webhook address')).toHaveValue('https://api.example.com/api/v1/webhooks/c/ck_abc');
    expect(screen.getByLabelText('Verify token')).toHaveValue('verify-me-123');
    await user.click(screen.getByRole('button', { name: 'Copy webhook address' }));
    expect(await navigator.clipboard.readText()).toBe('https://api.example.com/api/v1/webhooks/c/ck_abc');
  });

  it('email: shows a new signing secret once, and rotating asks first', async () => {
    const user = userEvent.setup();
    ch.saveConnector.mockResolvedValue(emailView({ revealed: { signingSecret: 'secret-shown-once-123' } }));
    ch.rotateSigningSecret.mockResolvedValue(emailView({ revealed: { signingSecret: 'rotated-secret-456' } }));
    renderPage();
    await user.click((await messaging()).getByRole('button', { name: 'Manage Email' }));
    await screen.findByLabelText('Resend API key');
    expect(screen.queryByLabelText('Verify token')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Save settings' }));
    expect(await screen.findByText('secret-shown-once-123')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Create a new signing secret' }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText(/old secret stops working immediately/i)).toBeInTheDocument();
    expect(ch.rotateSigningSecret).not.toHaveBeenCalled();
    await user.click(within(dialog).getByRole('button', { name: /create new secret/i }));
    await waitFor(() => expect(ch.rotateSigningSecret).toHaveBeenCalledWith('ch-em'));
    expect(await screen.findByText('rotated-secret-456')).toBeInTheDocument();
  });

  it('asks before removing credentials, and does nothing on cancel', async () => {
    const user = userEvent.setup();
    ch.clearConnector.mockResolvedValue(waView({ credentialsSaved: false }));
    renderPage();
    await user.click((await messaging()).getByRole('button', { name: 'Manage WhatsApp' }));
    await user.click(await screen.findByRole('button', { name: 'Remove credentials' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: /cancel/i }));
    expect(ch.clearConnector).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Remove credentials' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Remove credentials' }));
    await waitFor(() => expect(ch.clearConnector).toHaveBeenCalledWith('ch-wa'));
  });

  it('is read-only without channels:update', async () => {
    const user = userEvent.setup();
    renderPage(['channels:read', 'agents:read']);
    await user.click((await messaging()).getByRole('button', { name: 'Manage WhatsApp' }));
    expect(await screen.findByLabelText('Phone number ID')).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Save settings' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Test connection' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Remove credentials' })).not.toBeInTheDocument();
  });

  it('shows an error with retry when the connection cannot be loaded', async () => {
    const user = userEvent.setup();
    ch.fetchConnector.mockRejectedValueOnce(new Error('Connection store offline'));
    renderPage();
    await user.click((await messaging()).getByRole('button', { name: 'Manage WhatsApp' }));
    expect(await screen.findByText('Connection store offline')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /try again/i }));
    expect(await screen.findByLabelText('Phone number ID')).toBeInTheDocument();
  });
});
