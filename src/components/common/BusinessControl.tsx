import { motion } from 'motion/react';
import { Building2, Users, Shield, Activity, Settings, Key, Sparkles } from 'lucide-react';

const controlAreas = [
  {
    icon: Building2,
    title: 'Companies',
    description: 'Multi-tenant organization management with company profiles, settings, and status.',
    backend: 'GET/POST/PATCH /companies',
  },
  {
    icon: Users,
    title: 'Employees & Teams',
    description: 'Invite, manage, and organize team members with roles and departments.',
    backend: 'GET/POST/PATCH/DELETE /users',
  },
  {
    icon: Shield,
    title: 'Roles & Permissions',
    description: 'Granular permission system with system roles and custom role creation.',
    backend: 'Roles with 40+ permissions',
  },
  {
    icon: Key,
    title: 'Authentication & Security',
    description: 'JWT access/refresh tokens, rotation, session management, and audit trails.',
    backend: 'Auth endpoints + audit logs',
  },
  {
    icon: Activity,
    title: 'Operational Visibility',
    description: 'Real-time monitoring of conversations, agents, workflows, and team activity.',
    backend: 'Conversations, agents, workflows APIs',
  },
  {
    icon: Settings,
    title: 'Account & Settings',
    description: 'Profile, security, notifications, and preferences for each user.',
    backend: 'User profile endpoints',
  },
];

export function BusinessControl() {
  return (
    <section id="business-control" className="py-20 lg:py-28 bg-white dark:bg-slate-950" aria-labelledby="business-control-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-50 dark:bg-cyan-900/30 border border-cyan-200 dark:border-cyan-800 mb-4">
            <Sparkles className="h-4 w-4 text-cyan-600 dark:text-cyan-400" aria-hidden="true" />
            <span className="text-sm font-medium text-cyan-700 dark:text-cyan-300">
              Business Control
            </span>
          </div>
          <h2 id="business-control-heading" className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950 dark:text-slate-50 mb-4">
            Centralized Visibility & Control
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Every control is backed by real backend APIs. Owners and employees see exactly what their permissions allow.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {controlAreas.map((area, index) => (
            <motion.article
              key={area.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 hover:border-cyan-300 dark:hover:border-cyan-700 transition-all duration-300 hover:shadow-xl"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center text-white">
                  <area.icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-slate-950 dark:text-slate-50 mb-1">
                    {area.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-2">
                    {area.description}
                  </p>
                  <p className="text-xs font-medium text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/30 px-2 py-1 rounded inline-block">
                    {area.backend}
                  </p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16"
        >
          <div className="bg-gradient-to-r from-slate-950 via-indigo-900/50 to-slate-950 dark:from-slate-950 dark:via-indigo-900/50 dark:to-slate-950 rounded-3xl border border-slate-800 p-8 lg:p-12 text-center">
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Owner & Employee Model
            </h3>
            <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
              Corvanta presents business-facing roles&mdash;<strong className="text-white">Owner</strong> and <strong className="text-white">Employee</strong>&mdash;while preserving the backend&apos;s sophisticated permission architecture with 40+ granular permissions.
            </p>
            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto text-left">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-cyan-400" aria-hidden="true" />
                  Owner Capabilities
                </h4>
                <ul className="space-y-2 text-slate-300 text-sm" role="list">
                  <li>• Company profile & settings</li>
                  <li>• Employee invite & management</li>
                  <li>• Role & permission assignment</li>
                  <li>• AI agent configuration</li>
                  <li>• Channel connections</li>
                  <li>• Knowledge base management</li>
                  <li>• Workflow activation</li>
                  <li>• Audit log access</li>
                  <li>• Billing & subscription</li>
                </ul>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Users className="h-5 w-5 text-indigo-400" aria-hidden="true" />
                  Employee Capabilities
                </h4>
                <ul className="space-y-2 text-slate-300 text-sm" role="list">
                  <li>• Dashboard access</li>
                  <li>• Customer management</li>
                  <li>• Conversation handling</li>
                  <li>• Assigned AI agent tools</li>
                  <li>• Knowledge base access</li>
                  <li>• Channel usage</li>
                  <li>• Workflow execution</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}