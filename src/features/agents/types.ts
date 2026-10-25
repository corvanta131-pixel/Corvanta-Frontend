export type AgentStatus = 'draft' | 'active' | 'disabled' | 'archived';
export const AGENT_STATUSES: readonly AgentStatus[] = ['draft', 'active', 'disabled', 'archived'];

/** The few agent fields other screens need (for example the Channels page). */
export interface AgentSummary {
  _id: string;
  name: string;
  status: AgentStatus;
  description?: string | undefined;
}

/** Agent as returned by /agents (verified against the AIAgent model and agentService). */
export interface Agent extends AgentSummary {
  slug: string;
  provider: string;
  model: string;
  temperature: number;
  maxTokens: number;
  /** The agent's instructions (called promptTemplate by the backend). */
  promptTemplate: string;
  knowledgeBaseIds: string[];
  ownerId?: string | null | undefined;
  createdAt: string;
  updatedAt: string;
}

/** Body for POST /agents and PATCH /agents/:id. The backend requires `name` on update as well. */
export interface AgentInput {
  name: string;
  description: string;
  status: AgentStatus;
  provider: string;
  model: string;
  temperature: number;
  maxTokens: number;
  promptTemplate: string;
  knowledgeBaseIds: string[];
}

/** From GET /agents/options: server policy, so the UI never invents providers or models. */
export interface AgentOptions {
  providers: { id: string; label: string; configured: boolean }[];
  models: { id: string; provider: string }[];
  defaults: { temperature: number; maxTokens: number };
  limits: {
    temperature: { min: number; max: number };
    maxTokens: { min: number; max: number };
    nameLength: { min: number; max: number };
    descriptionMax: number;
    promptTemplateMax: number;
  };
}
