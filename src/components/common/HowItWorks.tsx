import { motion } from 'motion/react';
import { Link, Brain, Zap, Settings } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Link,
    title: 'Connect',
    description: 'Bring your communication channels, customer data, and business knowledge into Corvanta.',
    details: [
      'Email, WhatsApp, Instagram, Messenger, Webchat, SMS',
      'Import existing customer records and conversation history',
      'Upload documents and knowledge bases for AI grounding',
    ],
    color: 'indigo',
    gradient: 'from-indigo-500 to-indigo-600',
  },
  {
    number: '02',
    icon: Brain,
    title: 'Understand',
    description: 'Corvanta\'s AI analyzes conversations, extracts insights, and builds contextual understanding of your business.',
    details: [
      'Natural language understanding of customer intent',
      'Sentiment analysis and conversation categorization',
      'Knowledge retrieval from company documents',
      'Pattern recognition across customer interactions',
    ],
    color: 'violet',
    gradient: 'from-violet-500 to-violet-600',
  },
  {
    number: '03',
    icon: Zap,
    title: 'Automate',
    description: 'Create workflows that turn understanding into action—responses, routing, escalations, and business processes.',
    details: [
      'Visual workflow builder with triggers and actions',
      'AI agent responses grounded in company knowledge',
      'Automated routing, assignments, and escalations',
      'Integration with existing tools and APIs',
    ],
    color: 'purple',
    gradient: 'from-purple-500 to-purple-600',
  },
  {
    number: '04',
    icon: Settings,
    title: 'Operate',
    description: 'Monitor, measure, and optimize your customer communication and operations from one control center.',
    details: [
      'Real-time conversation monitoring and analytics',
      'AI agent performance and accuracy tracking',
      'Workflow execution history and debugging',
      'Team productivity and customer satisfaction metrics',
    ],
    color: 'cyan',
    gradient: 'from-cyan-500 to-cyan-600',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 lg:py-28 bg-slate-50 dark:bg-slate-900" aria-labelledby="how-it-works-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 id="how-it-works-heading" className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950 dark:text-slate-50 mb-4">
            How It Works
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Four steps to unify communication, intelligence, and operations.
          </p>
        </motion.div>

        <div className="relative">
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-gradient-to-b from-indigo-500 via-violet-500 to-cyan-500 opacity-30" />

          <div className="space-y-16">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className={`relative flex flex-col lg:flex-row lg:flex-row-reverse items-start gap-8 ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}
              >
                <div className="relative lg:w-1/2 lg:pr-12 lg:pl-0 lg:self-start">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
                      {step.number}
                    </div>
                    <div>
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${step.gradient} flex items-center justify-center text-white mb-4`}>
                        <step.icon className="h-6 w-6" aria-hidden="true" />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-950 dark:text-slate-50 mb-2">
                        {step.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                        {step.description}
                      </p>
                      <ul className="space-y-2" role="list">
                        {step.details.map((detail, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                            <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 bg-gradient-to-br ${step.gradient}`} aria-hidden="true" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="lg:w-1/2 lg:pl-12 relative">
                  <div className={`relative p-6 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-lg ${index % 2 === 0 ? 'lg:-ml-12' : 'lg:-mr-12'}`}>
                    <div className="aspect-video rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-violet-500/10 to-cyan-500/10" />
                      <div className="relative z-10 text-center p-8">
                        <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center text-white`}>
                          <step.icon className="h-8 w-8" aria-hidden="true" />
                        </div>
                        <h4 className="text-lg font-semibold text-slate-950 dark:text-slate-50 mb-2">
                          {step.title} Visualization
                        </h4>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">
                          Interactive workflow builder showing {step.title.toLowerCase()} in action
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}