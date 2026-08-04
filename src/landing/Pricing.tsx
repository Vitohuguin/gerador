import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Star } from 'lucide-react';
import { PLANS } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
};

export default function Pricing() {
  const navigate = useNavigate();

  return (
    <section id="pricing" className="relative py-16 sm:py-24 overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="section-container relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
            Planos{' '}
            <span className="gradient-text">Premium</span>
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto text-sm sm:text-base">
            Escolha o plano ideal para você.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-8 max-w-3xl mx-auto px-0 md:px-4">
          {PLANS.filter(plan => plan.id !== 'none').map((plan, i) => (
            <motion.div
              key={plan.id}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className={`glass-card p-5 lg:p-8 relative flex flex-col ${
                plan.highlighted
                  ? 'border-purple-500/40 shadow-[0_0_40px_rgba(168,85,247,0.15)] scale-105'
                  : ''
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1.5 px-4 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold shadow-lg">
                    <Star size={12} />
                    Mais Popular
                  </div>
                </div>
              )}

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${plan.color}20` }}
                  >
                    {plan.id === 'starter' && <Check size={18} style={{ color: plan.color }} />}
                    {plan.id === 'pro' && <Star size={18} style={{ color: plan.color }} />}
                  </div>
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                </div>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-white">
                    {formatCurrency(plan.price)}
                  </span>
                  <span className="text-zinc-500 text-sm ml-1">/mês</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check size={16} className="text-purple-400 flex-shrink-0 mt-0.5" />
                    <span className="text-zinc-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => navigate('/register')}
                className={plan.highlighted ? 'btn-primary w-full py-3 text-sm font-semibold' : 'btn-glass w-full py-3 text-sm font-semibold'}
              >
                Assinar Agora
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
