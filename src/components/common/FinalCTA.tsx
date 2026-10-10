import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { ArrowRight, Sparkles, Check } from 'lucide-react';

export function FinalCTA() {
  const benefits = [
    '14-day free trial',
    'No credit card required',
    'Cancel anytime',
    'Full feature access',
    'Priority support',
    'Easy team onboarding',
  ];

  return (
    <section className="py-20 lg:py-28 bg-slate-950 dark:bg-slate-950" aria-labelledby="final-cta-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/20 border border-indigo-500/30 mb-4">
            <Sparkles className="h-4 w-4 text-indigo-400" aria-hidden="true" />
            <span className="text-sm font-medium text-indigo-300">
              Ready to get started?
            </span>
          </div>
          <h2 id="final-cta-heading" className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-4">
            Bring your customers, conversations, intelligence, and operations into one place.
          </h2>
          <p className="text-lg text-slate-300">
            Join companies using Corvanta to unify communication, automate workflows, and scale customer operations.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Link to="/register">
            <Button size="lg" className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 text-lg">
              Get Started Free
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="outline" size="lg" className="px-10 py-4 text-lg border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
              Sign In
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 max-w-4xl mx-auto"
        >
          {benefits.map((benefit) => (
            <div
              key={benefit}
              className="flex items-center gap-3 p-4 bg-slate-900/50 rounded-xl border border-slate-800"
            >
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Check className="h-4 w-4" aria-hidden="true" />
              </div>
              <span className="text-sm text-slate-300 font-medium">{benefit}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}