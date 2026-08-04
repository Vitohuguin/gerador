import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import AuroraBackground from '@/components/ui/AuroraBackground';

export default function CTA() {
  const navigate = useNavigate();

  return (
    <section id="contact" className="relative py-16 sm:py-24 overflow-hidden">
      <AuroraBackground />
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-950/20 to-transparent" />

      <div className="section-container relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2, type: 'spring' }}
            className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center mx-auto mb-6"
          >
            <Sparkles size={32} className="text-purple-400" />
          </motion.div>

          <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
            Pronto para criar{' '}
            <span className="gradient-text">prompts incríveis</span>?
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-zinc-400 max-w-xl mx-auto mb-6 sm:mb-8 px-4">
            Junte-se a milhares de profissionais que já transformaram seu workflow com a PromptForge AI.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <button
              onClick={() => navigate('/register')}
              className="btn-primary text-base sm:text-lg px-8 sm:px-10 py-3.5 sm:py-4 flex items-center gap-2 mx-auto group"
            >
              Começar Agora
              <ArrowRight size={18} className="sm:hidden" />
              <ArrowRight size={20} className="hidden sm:block transition-transform group-hover:translate-x-1" />
            </button>
            <p className="text-[11px] sm:text-xs text-zinc-600 mt-3 sm:mt-4">
              Sem compromisso. Cancele quando quiser.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
