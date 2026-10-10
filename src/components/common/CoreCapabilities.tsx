import { motion } from 'motion/react';
import { Users, MessageSquare, Bot, Database, GitBranch, Workflow } from 'lucide-react';

const capabilities = [
  {
    icon: Users,
    title: 'Customers',
    description: 'Manage customer information and relationships with a unified view across all touchpoints.',
    features: ['Customer profiles', 'Activity timeline', 'Segmentation', 'Custom fields'],
    color: 'indigo',
    gradient: 'from-indigo-500 to-indigo-600',
    bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
    borderColor: 'border-indigo-200 dark:border-indigo-800',
  },
  {
    icon: MessageSquare,
    title: 'Conversations',
    description: 'Centralize customer conversations across all channels in one intelligent inbox.',
    features: ['Omnichannel inbox', 'Message history', 'Assignments', 'Internal notes'],
    color: 'blue',
    gradient: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
  },
  {
    icon: Bot,
    title: 'AI Agents',
    description: 'Create and manage AI agents powered by your company knowledge for customer communication.',
    features: ['Custom prompts', 'Knowledge grounding', 'Response config', 'Fallback handling'],
    color: 'violet',
    gradient: 'from-violet-500 to-violet-600',
    bgColor: 'bg-violet-50 dark:bg-violet-900/20',
    borderColor: 'border-violet-200 dark:border-violet-800',
  },
  {
    icon: Database,
    title: 'Knowledge',
    description: 'Manage knowledge bases and business documents with automatic indexing and vector search.',
    features: ['Document upload', 'Auto-indexing', 'Chunk management', 'Vector search'],
    color: 'purple',
    gradient: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    borderColor: 'border-purple-200 dark:border-purple-800',
  },
  {
    icon: GitBranch,
    title: 'Channels',
    description: 'Manage communication channels and their connection status across platforms.',
    features: ['Email', 'WhatsApp', 'Instagram', 'Messenger', 'Webchat', 'SMS'],
    color: 'cyan',
    gradient: 'from-cyan-500 to-cyan-600',
    bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
    borderColor: 'border-cyan-200 dark:border-cyan-800',
  },
  {
    icon: Workflow,
    title: 'Workflows',
    description: 'Create, preview, activate, and manage automated business workflows with visual builder.',
    features: ['Visual builder', 'Triggers & actions', 'Execution history', 'Version control'],
    color: 'emerald',
    gradient: 'from-emerald-500 to-emerald-600',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
  },
];

export function CoreCapabilities() {
  return (
    <section id="capabilities" className="py-20 lg:py-28 bg-white dark:bg-slate-950" aria-labelledby="capabilities-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 id="capabilities-heading" className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950 dark:text-slate-50 mb-4">
            Core Capabilities
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Built on actual backend architecture. Each capability connects to real APIs for customers, conversations, AI agents, knowledge, channels, and workflows.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {capabilities.map((capability, index) => (
            <motion.article
              key={capability.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`group relative p-6 rounded-2xl border ${capability.bgColor} ${capability.borderColor} hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-300 hover:shadow-xl`}
            >
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${capability.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none`} />
              <div className="relative z-10">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${capability.gradient} flex items-center justify-center mb-4 text-white shadow-lg`}>
                  <capability.icon className="h-7 w-7" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-semibold text-slate-950 dark:text-slate-50 mb-2">
                  {capability.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                  {capability.description}
                </p>
                <ul className="space-y-2" role="list">
                  {capability.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-br ${capability.gradient}`} aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}