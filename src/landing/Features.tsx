import { motion } from 'framer-motion';
import {
  Sparkles, History, Heart, FolderKanban, FileSignature,
  FileDown, Cpu, Crown,
} from 'lucide-react';

const FEATURES_LIST = [
  { icon: Sparkles, title: 'Gerador de Prompts', description: 'Crie prompts completos com IA em 15 etapas guiadas pelo wizard inteligente.', color: 'from-purple-500 to-purple-600' },
  { icon: History, title: 'Histórico Completo', description: 'Acesse todos os prompts gerados, filtre por data, nicho e plataforma.', color: 'from-blue-500 to-blue-600' },
  { icon: Heart, title: 'Favoritos', description: 'Salve seus prompts favoritos para acesso rápido e organize por projetos.', color: 'from-pink-500 to-pink-600' },
  { icon: FolderKanban, title: 'Projetos', description: 'Organize prompts, contratos e documentos em projetos personalizados.', color: 'from-amber-500 to-amber-600' },
  { icon: FileSignature, title: 'Contratos', description: 'Gere contratos profissionais com cláusulas jurídicas completas e personalizáveis.', color: 'from-emerald-500 to-emerald-600' },
  { icon: FileDown, title: 'Exportação', description: 'Exporte prompts em TXT, Markdown, PDF e DOCX com formatação profissional.', color: 'from-cyan-500 to-cyan-600' },
  { icon: Cpu, title: 'Integração NVIDIA', description: 'IA da NVIDIA gera prompts otimizados para Lovable, Bolt, v0, Cursor e mais.', color: 'from-green-500 to-green-600' },
  { icon: Crown, title: 'Área Premium', description: 'Acesso a templates exclusivos, modelos premium e funcionalidades avançadas.', color: 'from-violet-500 to-violet-600' },
];

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
};

export default function Features() {
  return (
    <section id="features" className="relative py-16 sm:py-24 overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="section-container relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
            Tudo que você precisa em{' '}
            <span className="gradient-text">um só lugar</span>
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto px-4">
            Uma suíte completa de ferramentas para criar, gerenciar e exportar seus prompts.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {FEATURES_LIST.map((feature, i) => (
            <motion.div
              key={feature.title}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="glass-card p-6 group cursor-default"
              style={{
                transformStyle: 'preserve-3d',
                perspective: 1000,
              }}
              onMouseMove={(e) => {
                const card = e.currentTarget;
                const rect = card.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;
                card.style.transform = `perspective(1000px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg)';
              }}
            >
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${feature.color} bg-opacity-20 flex items-center justify-center mb-4 shadow-lg`}>
                <feature.icon size={20} className="text-white" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
