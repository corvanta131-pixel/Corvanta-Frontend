import { motion } from 'motion/react';
import { Database, Brain, Zap, ArrowRight, FileText, Search, GitBranch, Sparkles } from 'lucide-react';

const flowSteps = [
  {
    icon: FileText,
    title: 'Business Knowledge',
    description: 'Upload documents, FAQs, policies, product info, and procedures.',
    color: 'indigo',
  },
  {
    icon: Database,
    title: 'Index & Embed',
    description: 'Automatic chunking, embedding generation, and vector storage.',
    color: 'blue',
  },
  {
    icon: Search,
    title: 'Vector Search',
    description: 'Semantic retrieval finds relevant context for any query.',
    color: 'violet',
  },
  {
    icon: Brain,
    title: 'AI Understanding',
    description: 'Agents synthesize knowledge into accurate, contextual responses.',
    color: 'purple',
  },
  {
    icon: Zap,
    title: 'Workflow Action',
    description: 'Trigger automations: create tickets, update records, send notifications.',
    color: 'cyan',
  },
  {
    icon: GitBranch,
    title: 'Customer Interaction',
    description: 'Deliver intelligent responses across all communication channels.',
    color: 'emerald',
  },
];

export function KnowledgeWorkflows() {
  return (
    <section id="knowledge-workflows" className="py-20 lg:py-28 bg-slate-50 dark:bg-slate-900" aria-labelledby="knowledge-workflows-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 mb-4">
            <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" aria-hidden="true" />
            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
              Knowledge + Workflows
            </span>
          </div>
          <h2 id="knowledge-workflows-heading" className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950 dark:text-slate-50 mb-4">
            Business Knowledge → AI Understanding → Action
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Corvanta transforms static documents into intelligent, actionable workflows. This is what differentiates us from basic chatbots.
          </p>
        </motion.div>

        <div className="relative">
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-gradient-to-b from-indigo-500 via-purple-500 to-emerald-500 opacity-30" />

          <div className="space-y-8">
            {flowSteps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative flex flex-col lg:flex-row items-center gap-8 ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}
              >
                <div className={`flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color}-500 to-${step.color}-600 flex items-center justify-center text-white relative z-10`}>
                  <step.icon className="h-7 w-7" aria-hidden="true" />
                </div>

                <div className="lg:w-1/2 lg:pr-12 text-center lg:text-left">
                  <h3 className="text-xl font-bold text-slate-950 dark:text-slate-50 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    {step.description}
                  </p>
                </div>

                {index < flowSteps.length - 1 && (
                  <motion.div
                    className="hidden lg:block absolute left-1/2 top-full h-8 w-px -translate-x-1/2 bg-gradient-to-b from-transparent to-indigo-500 opacity-50"
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  >
                    <ArrowRight className="absolute bottom-0 left-1/2 -translate-x-1/2 text-indigo-500" aria-hidden="true" />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 grid md:grid-cols-3 gap-6"
        >
          <article className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white mb-4">
              <Database className="h-6 w-6" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-semibold text-slate-950 dark:text-slate-50 mb-2">Knowledge Management</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
              Create knowledge bases, upload documents, manage chunks, track indexing status.
            </p>
            <ul className="space-y-1 text-sm text-slate-500 dark:text-slate-400" role="list">
              <li>• Document upload & auto-indexing</li>
              <li>• Chunk count & embedding tracking</li>
              <li>• Indexing state monitoring</li>
              <li>• Vector search testing</li>
            </ul>
          </article>

          <article className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 hover:border-violet-300 dark:hover:border-violet-700 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white mb-4">
              <Brain className="h-6 w-6" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-semibold text-slate-950 dark:text-slate-50 mb-2">AI Knowledge Association</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
              Associate knowledge bases with agents for grounded, accurate responses.
            </p>
            <ul className="space-y-1 text-sm text-slate-500 dark:text-slate-400" role="list">
              <li>• Multiple KBs per agent</li>
              <li>• Retrieval configuration</li>
              <li>• Response citation</li>
              <li>• Confidence scoring</li>
            </ul>
          </article>

          <article className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 hover:border-cyan-300 dark:hover:border-cyan-700 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-600 flex items-center justify-center text-white mb-4">
              <Zap className="h-6 w-6" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-semibold text-slate-950 dark:text-slate-50 mb-2">Workflow Automation</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
              Visual builder for triggers, conditions, and actions with execution history.
            </p>
            <ul className="space-y-1 text-sm text-slate-500 dark:text-slate-400" role="list">
              <li>• message.received, conversation.created triggers</li>
              <li>• Assign agent, send message, update records</li>
              <li>• Preview & test before activation</li>
              <li>• Execution logs & debugging</li>
            </ul>
          </article>
        </motion.div>
      </div>
    </section>
  );
}