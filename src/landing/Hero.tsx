import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Monitor, Tablet, Smartphone } from 'lucide-react';
import AuroraBackground from '@/components/ui/AuroraBackground';
import Particles from '@/components/ui/Particles';

const titleText = 'Crie prompts profissionais para IA em poucos minutos.';

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.04, delayChildren: 0.3 },
  },
};

const letterVariants = {
  hidden: { opacity: 0, y: 30, filter: 'blur(10px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
};

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section id="hero" className="relative min-h-screen flex items-center overflow-hidden pt-16 sm:pt-20">
      <AuroraBackground />
      <Particles count={20} />
      <div className="absolute inset-0 grid-bg opacity-40" />

      <div className="section-container relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 sm:gap-12 xl:gap-16 items-center">
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-purple-300 mb-8 border border-purple-500/20"
            >
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
              Plataforma SaaS com NVIDIA AI
            </motion.div>

            <motion.h1
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="text-[2rem] xs:text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-bold leading-[1.1] tracking-tight mb-6 text-balance"
            >
              {titleText.split('').map((char, i) => (
                <motion.span
                  key={i}
                  variants={letterVariants}
                  className={char === ' ' ? '' : 'gradient-text'}
                  style={char === ' ' ? {} : undefined}
                >
                  {char === ' ' ? '\u00A0' : char}
                </motion.span>
              ))}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-lg text-zinc-400 max-w-xl leading-relaxed mb-10"
            >
              Crie prompts otimizados para landing pages, dashboards, sistemas web e apps mobile.
              Gere contratos, propostas e briefings profissionais em minutos com o poder da NVIDIA AI.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex flex-wrap gap-4"
            >
              <button
                onClick={() => navigate('/register')}
                className="btn-primary text-base px-8 py-3.5 flex items-center gap-2 group"
              >
                Começar Agora
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </button>
              <button
                onClick={() => document.querySelector('#features')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-glass text-base px-8 py-3.5 flex items-center gap-2"
              >
                <Play size={18} />
                Ver Demonstração
              </button>
            </motion.div>
          </div>

          <div className="relative hidden lg:flex lg:col-span-2 items-center justify-center overflow-visible">
            <div className="relative w-full">
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                className="relative z-10"
              >
                <div className="glass p-4 rounded-2xl shadow-[0_0_60px_rgba(168,85,247,0.15)]">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <div className="flex-1 text-center text-xs text-zinc-500">PromptForge AI - Dashboard</div>
                  </div>
                  <div className="bg-bg-card rounded-xl p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <Monitor size={20} className="text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <div className="h-3 bg-purple-500/20 rounded w-3/4" />
                        <div className="h-2 bg-zinc-800 rounded w-1/2 mt-2" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-20 rounded-lg bg-purple-500/10 border border-purple-500/10" />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: 1 }}
                className="absolute -bottom-6 -left-6 z-20"
              >
                <div className="glass p-3 rounded-xl shadow-[0_0_40px_rgba(217,70,239,0.1)]">
                  <div className="flex items-center gap-2 px-3 py-2">
                    <Tablet size={16} className="text-pink-400" />
                    <span className="text-xs text-zinc-400">Tablet View</span>
                  </div>
                  <div className="w-32 h-20 rounded-lg bg-pink-500/10 border border-pink-500/10 mt-2" />
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: 2 }}
                className="absolute -top-3 -right-6 z-20"
              >
                <div className="glass p-3 rounded-xl shadow-[0_0_40px_rgba(124,58,237,0.1)]">
                  <div className="flex items-center gap-2 px-3 py-2">
                    <Smartphone size={16} className="text-purple-400" />
                    <span className="text-xs text-zinc-400">Mobile</span>
                  </div>
                  <div className="w-24 h-32 rounded-lg bg-purple-500/10 border border-purple-500/10 mt-2" />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
