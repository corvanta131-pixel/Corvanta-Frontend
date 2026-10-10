import { motion } from 'motion/react';
import { Button } from '../ui/Button';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Users, MessageSquare, Bot, Database, GitBranch, Workflow } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface CapabilityItem {
  icon: LucideIcon;
  label: string;
  color: string;
}

const capabilities: CapabilityItem[] = [
  { icon: Users, label: 'Customers', color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30' },
  { icon: MessageSquare, label: 'Conversations', color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
  { icon: Bot, label: 'AI Agents', color: 'text-violet-600 bg-violet-100 dark:bg-violet-900/30' },
  { icon: Database, label: 'Knowledge', color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' },
  { icon: GitBranch, label: 'Channels', color: 'text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30' },
  { icon: Workflow, label: 'Workflows', color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30' },
];

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden" aria-labelledby="hero-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800"
          >
            <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
            <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
              New: AI-powered customer communication platform
            </span>
          </motion.div>

          <motion.h1
            id="hero-heading"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-950 dark:text-slate-50 mb-6"
          >
            One intelligent control center for{' '}
            <span className="text-indigo-600 dark:text-indigo-400">customer communication</span>{' '}
            and business operations
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
            className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto"
          >
            Corvanta connects customers, conversations, employees, AI agents, knowledge, communication channels, and workflows into one intelligent system.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/register">
              <Button size="lg" className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3">
                Get Started
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="px-8 py-3">
                Sign In
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.4 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-3 text-sm text-slate-500 dark:text-slate-400"
          >
            <span className="flex items-center gap-1">
              <span className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 font-medium text-slate-700 dark:text-slate-300">No credit card required</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 font-medium text-slate-700 dark:text-slate-300">14-day free trial</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 font-medium text-slate-700 dark:text-slate-300">Cancel anytime</span>
            </span>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
          className="mt-16 relative"
        >
          <CentralIntelligenceVisual capabilities={capabilities} />
        </motion.div>
      </div>
    </section>
  );
}

interface CentralIntelligenceVisualProps {
  capabilities: CapabilityItem[];
}

function CentralIntelligenceVisual({ capabilities }: CentralIntelligenceVisualProps) {
  return (
    <div className="relative" role="img" aria-label="Corvanta central intelligence connecting capabilities">
      <div className="relative z-10">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-24 h-24 lg:w-32 lg:h-32">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-500 opacity-20 blur-2xl animate-pulse" />
            <div className="absolute inset-0 rounded-full border-2 border-indigo-500/30 dark:border-indigo-400/30" />
            <div className="absolute inset-4 rounded-full border-2 border-violet-500/20 dark:border-violet-400/20" />
            <div className="absolute inset-8 rounded-full border-2 border-purple-500/10 dark:border-purple-400/10" />
            <div className="relative z-10 w-full h-full rounded-full bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 flex items-center justify-center shadow-2xl">
              <Sparkles className="h-10 w-10 lg:h-12 lg:w-12 text-white" aria-hidden="true" />
            </div>
          </div>
        </div>

        <div className="absolute inset-0 flex items-center justify-center -z-10">
          {capabilities.map((capability, index) => {
            const angle = (index / capabilities.length) * 2 * Math.PI - Math.PI / 2;
            const radius = 180;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            return (
              <motion.div
                key={capability.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1, ease: 'easeOut' }}
                style={{ transform: `translate(${x}px, ${y}px)`, zIndex: 5 }}
                className="flex flex-col items-center gap-2"
              >
                <div
                  className={`relative p-4 rounded-2xl ${capability.color} shadow-lg transition-all hover:shadow-xl hover:scale-105`}
                  style={{ width: 80, height: 80 }}
                >
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: index * 0.3 }}
                  >
                    <capability.icon className="h-7 w-7" aria-hidden="true" />
                  </motion.div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-indigo-500/30 to-transparent" />
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap mt-2">
                  {capability.label}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}