import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, Wand2, Sparkles, FileSignature, ChevronRight } from 'lucide-react';

const DEMOS = [
  {
    id: 'dashboard',
    icon: Monitor,
    label: 'Dashboard',
    title: 'Painel de Controle',
    description: 'Visão geral completa com métricas, projetos recentes e atalhos rápidos.',
    color: 'from-purple-500 to-purple-600',
    screen: (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-4 w-24 bg-purple-500/20 rounded" />
          <div className="h-4 w-16 bg-purple-500/10 rounded" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-lg bg-purple-500/10 border border-purple-500/10" />
          ))}
        </div>
        <div className="h-24 rounded-lg bg-purple-500/5 border border-purple-500/10" />
      </div>
    ),
  },
  {
    id: 'wizard',
    icon: Wand2,
    label: 'Wizard',
    title: 'Assistente Inteligente',
    description: 'Guia passo a passo com 15 etapas para criar o prompt perfeito.',
    color: 'from-pink-500 to-pink-600',
    screen: (
      <div className="space-y-3">
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex-1 h-1.5 rounded-full bg-pink-500/20" />
          ))}
        </div>
        <div className="h-4 w-32 bg-pink-500/20 rounded" />
        <div className="grid grid-cols-2 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 rounded-lg bg-pink-500/10 border border-pink-500/10" />
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'generate',
    icon: Sparkles,
    label: 'Geração',
    title: 'Geração com IA NVIDIA',
    description: 'IA gera prompts completos com estrutura, tecnologias e animações.',
    color: 'from-amber-500 to-amber-600',
    screen: (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
          <div className="h-3 w-20 bg-amber-500/20 rounded" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-3 bg-amber-500/10 rounded" style={{ width: `${80 - i * 10}%` }} />
          ))}
        </div>
        <div className="h-20 rounded-lg bg-amber-500/5 border border-amber-500/10" />
      </div>
    ),
  },
  {
    id: 'contract',
    icon: FileSignature,
    label: 'Contratos',
    title: 'Contratos Profissionais',
    description: 'Documentos completos com cláusulas jurídicas personalizáveis.',
    color: 'from-emerald-500 to-emerald-600',
    screen: (
      <div className="space-y-3">
        <div className="h-4 w-40 bg-emerald-500/20 rounded" />
        <div className="space-y-2">
          {[1, 2, 3, 5].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-emerald-500/20 flex-shrink-0" />
              <div className="h-2.5 bg-emerald-500/10 rounded flex-1" />
            </div>
          ))}
        </div>
        <div className="h-12 rounded-lg bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center">
          <div className="h-3 w-20 bg-emerald-500/20 rounded" />
        </div>
      </div>
    ),
  },
];

export default function Demo() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % DEMOS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const current = DEMOS[active];

  return (
    <section className="relative py-16 sm:py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-purple-950/5 via-transparent to-purple-950/5" />
      <div className="section-container relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Veja a plataforma em{' '}
            <span className="gradient-text">ação</span>
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Conheça as principais funcionalidades da PromptForge AI.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          <div className="order-2 lg:order-1">
            <div className="flex flex-wrap gap-2 mb-6 sm:mb-8">
              {DEMOS.map((demo, i) => (
                <button
                  key={demo.id}
                  onClick={() => setActive(i)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all duration-300 ${
                    i === active
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
                  }`}
                >
                  <demo.icon size={16} />
                  {demo.label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.35 }}
              >
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3">{current.title}</h3>
                <p className="text-sm sm:text-base text-zinc-400 mb-4 sm:mb-6">{current.description}</p>
                <button className="btn-glass text-sm px-6 py-3 flex items-center gap-2 group">
                  Experimentar Agora
                  <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
                </button>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="order-1 lg:order-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.4 }}
                className="glass p-6 rounded-2xl shadow-[0_0_60px_rgba(168,85,247,0.1)]"
              >
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                  <div className="flex-1 text-center">
                    <span className={`text-xs bg-gradient-to-r ${current.color} bg-clip-text text-transparent font-medium`}>
                      {current.label}
                    </span>
                  </div>
                </div>
                {current.screen}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
