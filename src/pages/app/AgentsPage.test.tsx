import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { toast } from 'sonner';
import { AgentsPage } from './AgentsPage';
import { buildAgentPayload, makeAgentSchema } from '../../components/agents/AgentForm';
import authReducer from '../../features/auth/authSlice';
import * as agentApi from '../../services/api/agent';
import * as kbApi from '../../services/api/knowledgeBase';
import type { User } from '../../features/auth/types';
import type { Agent, AgentOptions } from '../../features/agents/types';

vi.mock('../../services/api/agent', () => ({
  fetchAgents: vi.fn(),
  listAgents: vi.fn(),
  createAgent: vi.fn(),
  updateAgent: vi.fn(),
  deleteAgent: vi.fn(),
  fetchAgentOptions: vi.fn(),
}));
vi.mock('../../services/api/knowledgeBase', () => ({ fetchKnowledgeBases: vi.fn() }));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const ag = vi.mocked(agentApi);
const kb = vi.mocked(kbApi);

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

const options: AgentOptions = {
  providers: [
    { id: 'mock', label: 'Test mode (no real AI)', configured: true },
    { id: 'openai', label: 'OpenAI', configured: false },
  ],
  models: [
    { id: 'mock-model', provider: 'mock' },
    { id: 'gpt-4o-mini', provider: 'openai' },
  ],
  defaults: { temperature: 0.2, maxTokens: 512 },
  limits: {
    temperature: { min: 0, max: 2 },
    maxTokens: { min: 1, max: 1024 },
    nameLength: { min: 2, max: 120 },
    descriptionMax: 2000,
    promptTemplateMax: 20000,
  },
};

function agent(over: Partial<Agent> = {}): Agent {
  return {
    _id: 'a-1',
    name: 'Support assistant',
    slug: 'support-assistant',
    description: 'Answers customer questions',
    status: 'active',
    provider: 'mock',
    model: 'mock-model',
    temperature: 0.2,
    maxTokens: 512,
    promptTemplate: 'Be helpful.',
    knowledgeBaseIds: [],
    createdAt: '',
    updatedAt: '',
    ...over,
  };
}

const support = agent();
const drafty = agent({ _id: 'a-2', name: 'Sales draft', status: 'draft', provider: 'openai', model: 'gpt-4o-mini', description: undefined });

const ALL = ['agents:read', 'agents:create', 'agents:update', 'agents:delete', 'knowledge:read'];

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
          <AgentsPage />
        </MemoryRouter>
      </QueryClientProvider>
    </Provider>
  );
}

/** Waits for the list (the page shows a loading skeleton first). */
const findList = async () => within(await screen.findByRole('list', { name: 'AI agents' }));

describe('agent form helpers', () => {
  it('builds a trimmed payload with every field', () => {
    expect(
      buildAgentPayload({
        name: 'Bot',
        description: '  hi  ',
        status: 'draft',
        provider: 'mock',
        model: 'mock-model',
        temperature: 0.5,
        maxTokens: 100,
        promptTemplate: 'x',
        knowledgeBaseIds: ['kb-1'],
      })
    ).toEqual({
      name: 'Bot',
      description: 'hi',
      status: 'draft',
      provider: 'mock',
      model: 'mock-model',
      temperature: 0.5,
      maxTokens: 100,
      promptTemplate: 'x',
      knowledgeBaseIds: ['kb-1'],
    });
  });

  it('enforces the server limits from the options', () => {
    const schema = makeAgentSchema(options.limits);
    const base = buildAgentPayload({
      name: 'Bot',
      description: '',
      status: 'draft',
      provider: 'mock',
      model: 'mock-model',
      temperature: 0.2,
      maxTokens: 512,
      promptTemplate: '',
      knowledgeBaseIds: [],
    });
    expect(schema.safeParse(base).success).toBe(true);
    expect(schema.safeParse({ ...base, name: 'B' }).success).toBe(false);
    expect(schema.safeParse({ ...base, temperature: 2.1 }).success).toBe(false);
    expect(schema.safeParse({ ...base, temperature: Number.NaN }).success).toBe(false);
    expect(schema.safeParse({ ...base, maxTokens: 1025 }).success).toBe(false);
    expect(schema.safeParse({ ...base, maxTokens: 10.5 }).success).toBe(false);
    expect(schema.safeParse({ ...base, status: 'bogus' }).success).toBe(false);
    expect(schema.safeParse({ ...base, promptTemplate: 'x'.repeat(20001) }).success).toBe(false);
  });
});

describe('AgentsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ag.listAgents.mockResolvedValue([support, drafty]);
    ag.fetchAgentOptions.mockResolvedValue(options);
    kb.fetchKnowledgeBases.mockResolvedValue([
      { _id: 'kb-1', name: 'Product FAQ', status: 'active' },
      { _id: 'kb-2', name: 'Returns policy', status: 'active' },
    ]);
  });

  it('is restricted and makes no requests without agents:read', () => {
    renderPage(['customers:read']);
    expect(screen.getByText('Restricted access')).toBeInTheDocument();
    expect(ag.listAgents).not.toHaveBeenCalled();
    expect(ag.fetchAgentOptions).not.toHaveBeenCalled();
  });

  it('shows loading, then an error with retry', async () => {
    const user = userEvent.setup();
    ag.listAgents.mockReturnValueOnce(new Promise(() => {}));
    const first = renderPage();
    expect(screen.getByRole('status', { name: /loading agents/i })).toBeInTheDocument();
    first.unmount();

    ag.listAgents.mockRejectedValueOnce(new Error('Agents offline'));
    renderPage();
    expect(await screen.findByText('Agents offline')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /try again/i }));
    expect(await (await findList()).findByText('Support assistant')).toBeInTheDocument();
  });

  it('lists agents with status, provider, model and attached knowledge', async () => {
    ag.listAgents.mockResolvedValue([agent({ knowledgeBaseIds: ['kb-1', 'kb-2'] }), drafty]);
    renderPage();
    const list = await findList();
    expect(await list.findByText('Support assistant')).toBeInTheDocument();
    expect(list.getByText('Active')).toBeInTheDocument();
    expect(list.getByText('Draft')).toBeInTheDocument();
    expect(list.getByText('Knowledge: Product FAQ, Returns policy')).toBeInTheDocument();
    expect(list.getByText('No knowledge attached')).toBeInTheDocument();
    expect(list.getAllByText('mock-model').length).toBeGreaterThan(0);
  });

  it('warns about agents that cannot reply (provider not set up, no instructions)', async () => {
    ag.listAgents.mockResolvedValue([agent({ _id: 'a-3', name: 'Silent bot', promptTemplate: '' }), drafty]);
    renderPage();
    const list = await findList();
    expect(await list.findByText(/OpenAI is not set up on the server yet/)).toBeInTheDocument();
    expect(list.getByText(/no instructions yet/i)).toBeInTheDocument();
  });

  it('shows an empty state with a create button', async () => {
    ag.listAgents.mockResolvedValue([]);
    renderPage();
    expect(await screen.findByText('No AI agents yet')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create your first agent/i })).toBeInTheDocument();
  });

  it('creates an agent with the exact payload, including chosen knowledge', async () => {
    const user = userEvent.setup();
    ag.createAgent.mockResolvedValue(agent({ _id: 'a-9', name: 'Helper' }));
    renderPage();
    await findList();

    await user.click(screen.getByRole('button', { name: /^add agent$/i }));
    const dialog = screen.getByRole('dialog');
    await user.type(within(dialog).getByLabelText('Name *'), 'Helper');
    await user.type(within(dialog).getByLabelText('Instructions'), 'Be kind.');
    await user.selectOptions(within(dialog).getByLabelText('Status'), 'active');
    await user.click(await within(dialog).findByLabelText('Product FAQ'));
    await user.click(within(dialog).getByRole('button', { name: /create agent/i }));

    await waitFor(() => expect(ag.createAgent).toHaveBeenCalledTimes(1));
    expect(ag.createAgent.mock.calls[0]?.[0]).toEqual({
      name: 'Helper',
      description: '',
      status: 'active',
      provider: 'mock',
      model: 'mock-model',
      temperature: 0.2,
      maxTokens: 512,
      promptTemplate: 'Be kind.',
      knowledgeBaseIds: ['kb-1'],
    });
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Helper was created.'));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('blocks invalid input with field messages and sends nothing', async () => {
    const user = userEvent.setup();
    renderPage();
    await findList();
    await user.click(screen.getByRole('button', { name: /^add agent$/i }));
    const dialog = screen.getByRole('dialog');

    const temperature = within(dialog).getByLabelText('Creativity (0 to 2)');
    await user.clear(temperature);
    await user.type(temperature, '5');
    const tokens = within(dialog).getByLabelText('Maximum reply length');
    await user.clear(tokens);
    await user.type(tokens, '5000');
    await user.click(within(dialog).getByRole('button', { name: /create agent/i }));

    expect(await within(dialog).findByText('Name must be at least 2 characters')).toBeInTheDocument();
    expect(within(dialog).getByText('Must be at most 2')).toBeInTheDocument();
    expect(within(dialog).getByText('The server allows at most 1024')).toBeInTheDocument();
    expect(ag.createAgent).not.toHaveBeenCalled();
  });

  it('offers only the models of the chosen provider and warns when it is not set up', async () => {
    const user = userEvent.setup();
    renderPage();
    await findList();
    await user.click(screen.getByRole('button', { name: /^add agent$/i }));
    const dialog = screen.getByRole('dialog');

    expect(within(dialog).getByRole('option', { name: 'mock-model' })).toBeInTheDocument();
    expect(within(dialog).queryByRole('option', { name: 'gpt-4o-mini' })).not.toBeInTheDocument();

    await user.selectOptions(within(dialog).getByLabelText('Provider'), 'openai');
    expect(await within(dialog).findByRole('option', { name: 'gpt-4o-mini' })).toBeInTheDocument();
    expect(within(dialog).queryByRole('option', { name: 'mock-model' })).not.toBeInTheDocument();
    expect(within(dialog).getByLabelText('Model')).toHaveValue('gpt-4o-mini');
    expect(within(dialog).getByRole('note')).toHaveTextContent(/OpenAI is not set up on the server yet/);
  });

  it('keeps the form open and shows the server error when creation fails', async () => {
    const user = userEvent.setup();
    ag.createAgent.mockRejectedValue(new Error('An AI agent with this slug already exists in this company.'));
    renderPage();
    await findList();
    await user.click(screen.getByRole('button', { name: /^add agent$/i }));
    const dialog = screen.getByRole('dialog');
    await user.type(within(dialog).getByLabelText('Name *'), 'Support assistant');
    await user.click(within(dialog).getByRole('button', { name: /create agent/i }));
    expect(await within(dialog).findByText(/slug already exists/i)).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('prefills edit mode and sends every field including the required name', async () => {
    const user = userEvent.setup();
    ag.updateAgent.mockResolvedValue(agent({ name: 'Support assistant 2' }));
    renderPage();
    const list = await findList();
    await user.click(await list.findByRole('button', { name: 'Edit Support assistant' }));

    const dialog = screen.getByRole('dialog');
    const name = within(dialog).getByLabelText('Name *');
    expect(name).toHaveValue('Support assistant');
    expect(within(dialog).getByLabelText('Instructions')).toHaveValue('Be helpful.');
    expect(within(dialog).getByLabelText('Status')).toHaveValue('active');
    await user.clear(name);
    await user.type(name, 'Support assistant 2');
    await user.click(within(dialog).getByRole('button', { name: /save changes/i }));

    await waitFor(() => expect(ag.updateAgent).toHaveBeenCalledTimes(1));
    expect(ag.updateAgent.mock.calls[0]?.[0]).toBe('a-1');
    expect(ag.updateAgent.mock.calls[0]?.[1]).toEqual({
      name: 'Support assistant 2',
      description: 'Answers customer questions',
      status: 'active',
      provider: 'mock',
      model: 'mock-model',
      temperature: 0.2,
      maxTokens: 512,
      promptTemplate: 'Be helpful.',
      knowledgeBaseIds: [],
    });
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Support assistant 2 was updated.'));
  });

  it('activates and disables with the full payload, and reports failures', async () => {
    const user = userEvent.setup();
    ag.updateAgent.mockResolvedValue(agent({ status: 'disabled' }));
    renderPage();
    const list = await findList();

    await user.click(await list.findByRole('button', { name: 'Disable Support assistant' }));
    await waitFor(() => expect(ag.updateAgent).toHaveBeenCalledTimes(1));
    expect(ag.updateAgent.mock.calls[0]?.[0]).toBe('a-1');
    expect(ag.updateAgent.mock.calls[0]?.[1]).toMatchObject({ name: 'Support assistant', status: 'disabled', provider: 'mock' });
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Support assistant was disabled.'));

    ag.updateAgent.mockRejectedValueOnce(new Error('Cannot activate right now.'));
    await user.click(await list.findByRole('button', { name: 'Activate Sales draft' }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Cannot activate right now.'));
  });

  it('requires confirmation to delete; cancel does nothing; failure keeps the agent', async () => {
    const user = userEvent.setup();
    renderPage();
    const list = await findList();

    await user.click(await list.findByRole('button', { name: 'Delete Support assistant' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: /cancel/i }));
    expect(ag.deleteAgent).not.toHaveBeenCalled();

    ag.deleteAgent.mockRejectedValue(new Error('Agent not found.'));
    await user.click(list.getByRole('button', { name: 'Delete Support assistant' }));
    const dialog = screen.getByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: /delete agent/i }));
    expect(await within(dialog).findByText('Agent not found.')).toBeInTheDocument();
    expect(list.getByText('Support assistant')).toBeInTheDocument();
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('deletes after confirmation with the right id', async () => {
    const user = userEvent.setup();
    ag.listAgents.mockResolvedValueOnce([support, drafty]).mockResolvedValue([drafty]);
    ag.deleteAgent.mockResolvedValue({ ...support });
    renderPage();
    const list = await findList();
    await user.click(await list.findByRole('button', { name: 'Delete Support assistant' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: /delete agent/i }));
    await waitFor(() => expect(ag.deleteAgent).toHaveBeenCalledTimes(1));
    expect(ag.deleteAgent.mock.calls[0]?.[0]).toBe('a-1');
    await waitFor(() => expect(list.queryByText('Support assistant')).not.toBeInTheDocument());
  });

  it('hides write controls for a read-only user', async () => {
    renderPage(['agents:read']);
    const list = await findList();
    await list.findByText('Support assistant');
    expect(screen.queryByRole('button', { name: /add agent/i })).not.toBeInTheDocument();
    expect(list.queryByRole('button', { name: /^edit /i })).not.toBeInTheDocument();
    expect(list.queryByRole('button', { name: /^delete /i })).not.toBeInTheDocument();
    expect(list.queryByRole('button', { name: /^(activate|disable) /i })).not.toBeInTheDocument();
  });

  it('does not request knowledge bases without knowledge:read and says so in the form', async () => {
    const user = userEvent.setup();
    renderPage(['agents:read', 'agents:create']);
    await findList();
    expect(kb.fetchKnowledgeBases).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: /^add agent$/i }));
    expect(within(screen.getByRole('dialog')).getByText(/permission to view knowledge bases/i)).toBeInTheDocument();
  });

  it('asks before discarding unsaved changes', async () => {
    const user = userEvent.setup();
    renderPage();
    const list = await findList();
    await user.click(await list.findByRole('button', { name: 'Edit Support assistant' }));
    let dialog = screen.getByRole('dialog');

    // No changes yet: Cancel closes straight away.
    await user.click(within(dialog).getByRole('button', { name: /^cancel$/i }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await user.click(list.getByRole('button', { name: 'Edit Support assistant' }));
    dialog = screen.getByRole('dialog');
    await user.type(within(dialog).getByLabelText('Name *'), ' edited');
    await user.click(within(dialog).getByRole('button', { name: /^cancel$/i }));
    expect(screen.getByRole('alertdialog', { name: 'Discard changes?' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Keep editing' }));
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(within(screen.getByRole('dialog')).getByLabelText('Name *')).toHaveValue('Support assistant edited');

    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: /^cancel$/i }));
    await user.click(screen.getByRole('button', { name: 'Discard' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(ag.updateAgent).not.toHaveBeenCalled();
  });
});
