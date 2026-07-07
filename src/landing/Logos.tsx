import { motion } from 'framer-motion';
import { LOGOS } from '@/lib/constants';

export default function Logos() {
  return (
    <section className="relative py-16">
      <div className="section-container">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center text-zinc-500 text-sm mb-8"
        >
          Tecnologias compatíveis com a PromptForge AI
        </motion.p>

        <div className="relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-bg-primary to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-bg-primary to-transparent z-10" />

          <motion.div
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 30, repeat: Infinity, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="flex gap-12 w-max"
          >
            {[...LOGOS, ...LOGOS].map((logo, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-6 py-3 rounded-xl glass whitespace-nowrap"
              >
                <span className="text-2xl">{logo.icon}</span>
                <span className="text-sm text-zinc-300 font-medium">{logo.name}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
