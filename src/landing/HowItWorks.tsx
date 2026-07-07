import { motion } from 'framer-motion';
import { Layers, HelpCircle, Brain, CopyCheck } from 'lucide-react';
import { HOW_IT_WORKS } from '@/lib/constants';

const iconMap: Record<string, React.ElementType> = {
  Layers, HelpCircle, Brain, CopyCheck,
};

const stepVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
};

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-16 sm:py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-purple-950/10 via-transparent to-purple-950/10" />
      <div className="section-container relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Como <span className="gradient-text">funciona</span>
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Em apenas 4 passos simples, você cria prompts profissionais prontos para usar.
          </p>
        </motion.div>

        <div className="relative">
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500/30 via-purple-500/20 to-transparent -translate-x-1/2" />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 lg:gap-6">
            {HOW_IT_WORKS.map((step, i) => {
              const IconComp = iconMap[step.icon];
              return (
                <motion.div
                  key={step.step}
                  custom={i}
                  variants={stepVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-50px' }}
                  className="relative flex flex-col items-center text-center"
                >
                  <div className="relative mb-6">
                    <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center border border-purple-500/20 group-hover:border-purple-500/40 transition-all">
                      {IconComp && <IconComp size={28} className="text-purple-400" />}
                    </div>
                    <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                      {step.step}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed max-w-xs">{step.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
