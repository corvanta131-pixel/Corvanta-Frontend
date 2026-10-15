export type AgentStatus = 'draft' | 'active' | 'disabled' | 'archived';

/** The few agent fields other screens need (full agent management arrives with its own stage). */
export interface AgentSummary {
  _id: string;
  name: string;
  status: AgentStatus;
  description?: string | undefined;
}
