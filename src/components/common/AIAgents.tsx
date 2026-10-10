import { motion } from 'motion/react';
import { Bot, FileText, Database, Shield, Settings, Sparkles } from 'lucide-react';

const agentFeatures = [
  {
    icon: Bot,
    title: 'Customer Communication',
    description: 'AI agents handle customer inquiries across all channels with contextual understanding.',
    details: 'Agents respond to emails, chats, and messages using your company knowledge and brand voice.',
  },
  {
    icon: FileText,
    title: 'Knowledge-Grounded Responses',
    description: 'Every AI response is grounded in your actual business documents and knowledge bases.',
    details: 'Vector search retrieves relevant context. No hallucination—only factual, sourced answers.',
  },
  {
    icon: Database,
    title: 'Operational Workflows',
    description: 'Agents don\'t just chat—they execute workflows, update records, and trigger actions.',
    details: 'Create tickets, update customer profiles, escalate to humans, send notifications.',
  },
  {
    icon: Shield,
    title: 'Controlled Automation',
    description: 'Full control over when and how agents operate with fallback and approval workflows.',
    details: 'Confidence thresholds, human handoff rules, conversation monitoring, audit trails.',
  },
];

const agentConfigItems = [
  { label: 'Provider', value: 'OpenAI, Anthropic, Custom' },
  { label: 'Model', value: 'GPT-4, Claude, Llama' },
  { label: 'Temperature', value: '0.0 – 1.0 (configurable)' },
  { label: 'Max Tokens', value: 'Configurable per agent' },
  { label: 'Prompt Template', value: 'Full customization' },
  { label: 'Knowledge Bases', value: 'Multiple, selectable' },
  { label: 'Response Config', value: 'Length, tone, format' },
  { label: 'Fallback Config', value: 'Human handoff, retry, default' },
];

export function AIAgents() {
  return (
    <section id="ai-agents" className="py-20 lg:py-28 bg-white dark:bg-slate-950" aria-labelledby="ai-agents-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-50 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-800 mb-4">
            <Sparkles className="h-4 w-4 text-violet-600 dark:text-violet-400" aria-hidden="true" />
            <span className="text-sm font-medium text-violet-700 dark:text-violet-300">
              AI Agents
            </span>
          </div>
          <h2 id="ai-agents-heading" className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950 dark:text-slate-50 mb-4">
            AI Agents Built for Business
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Not generic chatbots. Corvanta agents are configured with your company knowledge, brand voice, and operational workflows.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <div className="space-y-8">
            {agentFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex gap-4"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white">
                  <feature.icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-950 dark:text-slate-50 mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-1">
                    {feature.description}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {feature.details}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 lg:p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white">
                  <Settings className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-950 dark:text-slate-50">
                    Agent Configuration
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Every setting backed by actual backend schema
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {agentConfigItems.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.3 + index * 0.05 }}
                    className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-4 hover:border-violet-300 dark:hover:border-violet-700 transition-colors"
                  >
                    <dt className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                      {item.label}
                    </dt>
                    <dd className="text-sm font-medium text-slate-950 dark:text-slate-50">
                      {item.value}
                    </dd>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}