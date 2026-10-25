import api from './client';
import { hasStringField, isRecord, pathId, unwrap } from './envelope';
import type { ApiEnvelope } from '../../features/users/types';
import type { Agent, AgentInput, AgentOptions, AgentSummary } from '../../features/agents/types';

function assertAgent<T extends AgentSummary>(value: unknown, label: string): T {
  if (!hasStringField(value, '_id') || !hasStringField(value, 'name')) {
    throw new Error(`Received an invalid agent record while ${label}.`);
  }
  return value as T;
}

/** Light list used by screens that only need names and status (for example Channels). */
export async function fetchAgents(): Promise<AgentSummary[]> {
  const res = await api.get<ApiEnvelope<AgentSummary[]>>('/agents/');
  const data = unwrap(res.data, 'loading agents');
  if (!Array.isArray(data)) throw new Error('Received an invalid agent list.');
  return data.map((a) => assertAgent<AgentSummary>(a, 'loading agents'));
}

/** Full agent records for the Agents screen. */
export async function listAgents(): Promise<Agent[]> {
  const res = await api.get<ApiEnvelope<Agent[]>>('/agents/');
  const data = unwrap(res.data, 'loading agents');
  if (!Array.isArray(data)) throw new Error('Received an invalid agent list.');
  return data.map((a) => assertAgent<Agent>(a, 'loading agents'));
}

export async function createAgent(payload: AgentInput): Promise<Agent> {
  const res = await api.post<ApiEnvelope<Agent>>('/agents/', payload);
  return assertAgent<Agent>(unwrap(res.data, 'creating the agent'), 'creating the agent');
}

export async function updateAgent(id: string, payload: AgentInput): Promise<Agent> {
  const res = await api.patch<ApiEnvelope<Agent>>(pathId('/agents', id, 'Agent'), payload);
  return assertAgent<Agent>(unwrap(res.data, 'updating the agent'), 'updating the agent');
}

/** Backend soft-deletes the agent. */
export async function deleteAgent(id: string): Promise<Agent> {
  const res = await api.delete<ApiEnvelope<Agent>>(pathId('/agents', id, 'Agent'));
  return assertAgent<Agent>(unwrap(res.data, 'deleting the agent'), 'deleting the agent');
}

export async function fetchAgentOptions(): Promise<AgentOptions> {
  const res = await api.get<ApiEnvelope<AgentOptions>>('/agents/options');
  const data = unwrap(res.data, 'loading agent options');
  if (!isRecord(data) || !Array.isArray(data['providers']) || !Array.isArray(data['models']) || !isRecord(data['limits'])) {
    throw new Error('Received invalid agent options.');
  }
  return data;
}
