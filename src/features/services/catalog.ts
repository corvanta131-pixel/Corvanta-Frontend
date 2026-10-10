export type ServiceStatus = 'available' | 'active' | 'inactive' | 'coming_soon';

export type ServiceCategory =
  | 'communication'
  | 'ai-automation'
  | 'customer-management'
  | 'knowledge'
  | 'team-operations';

export interface Service {
  id: string;
  name: string;
  description: string;
  category: ServiceCategory;
  icon: string;
  status: ServiceStatus;
  capabilities: string[];
  relatedModules: string[];
  learnMoreHref?: string;
  comingSoonDate?: string;
}

export interface ServiceWithSubscription extends Service {
  isSubscribed?: boolean;
  subscriptionStatus?: 'active' | 'inactive' | 'trial' | 'expired';
}

export const SERVICE_CATEGORIES: Record<ServiceCategory, { label: string; description: string }> = {
  communication: {
    label: 'Communication',
    description: 'Unified customer communication across channels',
  },
  'ai-automation': {
    label: 'AI & Automation',
    description: 'AI-powered customer support and automation',
  },
  'customer-management': {
    label: 'Customer Management',
    description: 'Customer profiles, identities and organization',
  },
  knowledge: {
    label: 'Knowledge',
    description: 'Company knowledge bases, documents and RAG',
  },
  'team-operations': {
    label: 'Team & Operations',
    description: 'Employees, roles and permissions',
  },
};

// Current service catalog - frontend configuration only.
// These will be replaced by /api/v1/services when the backend adds Services endpoints.
// DO NOT treat these as live subscription data.
export const SERVICE_CATALOG: Service[] = [
  {
    id: 'customer-communications',
    name: 'Customer Communications',
    description: 'Centralize customer conversations across all channels in one intelligent inbox.',
    category: 'communication',
    icon: 'message-square',
    status: 'available',
    capabilities: ['Omnichannel inbox', 'Real-time messaging', 'Conversation routing', 'Internal notes'],
    relatedModules: ['Conversations', 'Channels'],
    learnMoreHref: '/channels',
  },
  {
    id: 'ai-agents',
    name: 'AI Agents',
    description: 'Create and manage AI agents powered by your company knowledge for automated customer communication.',
    category: 'ai-automation',
    icon: 'bot',
    status: 'available',
    capabilities: ['Custom prompts', 'Knowledge grounding', 'Fallback handling', 'Response configuration'],
    relatedModules: ['Conversations', 'Channels', 'Knowledge Bases'],
    learnMoreHref: '/agents',
  },
  {
    id: 'omnichannel-messaging',
    name: 'Omnichannel Messaging',
    description: 'WhatsApp, Instagram, Messenger, web chat, SMS and email integrations.',
    category: 'communication',
    icon: 'message-circle',
    status: 'available',
    capabilities: ['Email channels', 'WhatsApp integration', 'Instagram Messenger', 'Web chat widget', 'SMS'],
    relatedModules: ['Conversations'],
    learnMoreHref: '/channels',
  },
  {
    id: 'knowledge-rag',
    name: 'Knowledge & RAG',
    description: 'Manage knowledge bases and documents with automatic indexing and vector search for AI grounding.',
    category: 'knowledge',
    icon: 'book-open',
    status: 'available',
    capabilities: ['Document upload', 'Auto-indexing', 'Chunk management', 'Vector search'],
    relatedModules: ['AI Agents', 'Conversations'],
    learnMoreHref: '/knowledge',
  },
  {
    id: 'workflow-automation',
    name: 'Workflow Automation',
    description: 'Create automated business workflows triggered by events across your customer operations.',
    category: 'ai-automation',
    icon: 'git-branch',
    status: 'available',
    capabilities: ['Visual workflow builder', 'Triggers & actions', 'Execution history', 'Version control'],
    relatedModules: ['Customers', 'Conversations', 'AI Agents'],
    learnMoreHref: '/workflows',
  },
  {
    id: 'customer-management',
    name: 'Customer Management',
    description: 'Manage customer profiles, identities and customer organization.',
    category: 'customer-management',
    icon: 'users',
    status: 'available',
    capabilities: ['Customer profiles', 'Activity timeline', 'Segmentation', 'Custom fields'],
    relatedModules: ['Conversations', 'Workflows'],
    learnMoreHref: '/customers',
  },
  {
    id: 'team-collaboration',
    name: 'Team Collaboration',
    description: 'Team management with employees, roles and granular permissions.',
    category: 'team-operations',
    icon: 'users-2',
    status: 'available',
    capabilities: ['Role-based permissions', 'Employee management', 'Manager hierarchy', 'Access control'],
    relatedModules: ['Audit', 'Settings'],
    learnMoreHref: '/team',
  },
];

export const getServicesByCategory = (services: Service[] = SERVICE_CATALOG) => {
  const result: Record<string, Service[]> = {};
  for (const service of services) {
    const key = service.category;
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(service);
  }
  return result;
};

export const getServiceById = (id: string, services: Service[] = SERVICE_CATALOG) => {
  return services.find((s) => s.id === id);
};

export const getServiceStatusLabel = (status: ServiceStatus): { label: string; className: string } => {
  const variants: Record<ServiceStatus, { label: string; className: string }> = {
    available: { label: 'Available', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
    active: { label: 'Active', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
    inactive: { label: 'Inactive', className: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
    coming_soon: { label: 'Coming Soon', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  };
  return variants[status];
};