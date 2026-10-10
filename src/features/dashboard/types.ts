import type { Customer, Conversation, Agent, Channel, KnowledgeBase, Workflow, Employee } from '../../types/dashboard';

export interface DashboardStats {
  customers: Customer[];
  conversations: Conversation[];
  agents: Agent[];
  channels: Channel[];
  knowledgeBases: KnowledgeBase[];
  workflows: Workflow[];
  employees: Employee[];
}