import { motion } from 'framer-motion';
import {
  Clock, FileCheck, MonitorSmartphone, FolderTree,
  FileSignature, LayoutGrid,
} from 'lucide-react';
import { BENEFITS } from '@/lib/constants';

const iconMap: Record<string, React.ElementType> = {
  Clock, FileCheck, MonitorSmartphone, FolderTree, FileSignature, LayoutGrid,
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
};

export default function Benefits() {
  return (
    <section className="relative py-16 sm:py-24 overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="section-container relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Por que escolher a{' '}
            <span className="gradient-text">PromptForge AI</span>?
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Uma plataforma completa para criadores digitais que querem acelerar seu workflow com IA.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {BENEFITS.map((benefit, i) => {
            const IconComp = iconMap[benefit.icon];
            return (
              <motion.div
                key={benefit.title}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="glass-card p-6 group"
              >
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-all duration-300">
                  {IconComp && <IconComp size={24} className="text-purple-400" />}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{benefit.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{benefit.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
