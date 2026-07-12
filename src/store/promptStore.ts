import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Prompt } from '../types';
import { generateId } from '../lib/utils';

interface PromptStore {
  prompts: Prompt[];
  favorites: Prompt[];
  addPrompt: (data: Partial<Prompt>) => Prompt;
  updatePrompt: (id: string, data: Partial<Prompt>) => void;
  deletePrompt: (id: string) => void;
  toggleFavorite: (id: string) => void;
  getPromptById: (id: string) => Prompt | undefined;
  getFiltered: (filters: { search?: string; niche?: string; platform?: string }) => Prompt[];
}

const MOCK_PROMPTS: Prompt[] = [
  {
    id: 'pr_001', projectId: 'proj_001', userId: 'usr_demo_001', title: 'Landing Page - Clínica Saúde+',
    content: `# PROMPT PARA CRIAÇÃO DE LANDING PAGE — CLÍNICA SAÚDE+\n\n## VISÃO GERAL\nCriar uma landing page moderna e profissional para a Clínica Saúde+, uma clínica médica localizada em São Paulo, SP, com 10 anos de mercado.\n\n## OBJETIVO\nLanding Page focada em conversão de agendamentos de consultas.\n\n## PÚBLICO-ALVO\nHomens e mulheres de 25 a 60 anos, classes A e B, que buscam atendimento médico de qualidade.\n\n## ESTILO VISUAL\n- **Paleta**: Tons de verde (#10B981) com branco e cinza claro\n- **Tipografia**: Inter (títulos), Manrope (corpo)\n- **Estilo**: Minimalista com toque premium\n## ESTRUTURA\n- Navbar fixa com logo e agendamento\n- Hero com CTA principal\n- Seção "Sobre Nós" com diferenciais\n- Especialidades em cards\n- Depoimentos de pacientes\n- FAQ sobre convênios\n- Formulário de agendamento\n- Footer completo\n\n## TECNOLOGIAS\nNext.js, Tailwind CSS, Framer Motion, Supabase\n\n## FUNCIONALIDADES\n- Agendamento online\n- Chat via WhatsApp\n- Geolocalização\n- Depoimentos em carrossel`,
    rawPrompt: 'Raw generation data...', status: 'generated',
    objective: 'landing-page', niche: 'health', style: 'minimalista', platform: 'lovable',
    language: 'pt', technologies: ['React', 'Next.js', 'Tailwind CSS', 'Supabase', 'Framer Motion'],
    animations: ['scroll-reveal', 'hover-effects', 'parallax'], structures: ['hero', 'features', 'testimonials', 'faq', 'contact', 'footer'],
    functionalities: ['auth', 'booking', 'notifications', 'social-share'],
    font: 'Inter', colorScheme: 'Verdde Nature', favorites: true, version: 1,
    tokens: 2450, estimatedTime: 45, createdAt: '2025-06-15T10:00:00Z', updatedAt: '2025-06-15T10:00:00Z', tags: ['landing-page', 'clinica', 'medicina'],
  },
  {
    id: 'pr_002', projectId: 'proj_002', userId: 'usr_demo_001', title: 'Site - Barbearia Vintage',
    content: `# PROMPT PARA CRIAÇÃO DE SITE — BARBEARIA VINTAGE\n\n## VISÃO GERAL\nSite completo para barbearia com estilo vintage e moderno ao mesmo tempo.\n\n## OBJETIVO\nSite institucional com agendamento online integrado.\n\n## ESTILO VISUAL\nTons escuros com detalhes em laranja e dourado. Tipografia serifada para títulos.\n\n## ESTRUTURA\n...`,
    rawPrompt: 'Raw prompt data...', status: 'generated',
    objective: 'site-institucional', niche: 'beauty', style: 'luxuoso', platform: 'bolt',
    language: 'pt', technologies: ['React', 'Node.js', 'Tailwind CSS', 'MySQL'], animations: ['scroll-reveal', 'micro-interactions'],
    structures: ['hero', 'features', 'contact', 'footer'], functionalities: ['auth', 'booking', 'notifications'],
    font: 'Manrope', colorScheme: 'Laranja Fire', favorites: false, version: 1,
    tokens: 1890, estimatedTime: 35, createdAt: '2025-06-20T14:30:00Z', updatedAt: '2025-06-20T14:30:00Z', tags: ['barbearia', 'agendamento'],
  },
  {
    id: 'pr_003', projectId: 'proj_003', userId: 'usr_demo_001', title: 'Dashboard Financeiro - TechFlow',
    content: `# PROMPT PARA CRIAÇÃO DE DASHBOARD — TECHFLOW SAAS\n\n## VISÃO GERAL\nDashboard financeiro completo para startup de gestão empresarial.\n\n## OBJETIVO\nSistema web com painéis de indicadores financeiros.\n\n## ESTILO VISUAL\nTema escuro com roxo neon. Glassmorphism e grids futuristas.\n\n## TECNOLOGIAS\nReact, TypeScript, Tailwind CSS, Framer Motion, Supabase, PostgreSQL`,
    rawPrompt: 'Raw generation data...', status: 'generated',
    objective: 'dashboard', niche: 'saas', style: 'cyberpunk', platform: 'cursor',
    language: 'pt', technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Supabase', 'PostgreSQL', 'Framer Motion'],
    animations: ['scroll-reveal', 'stagger-children', 'parallax'], structures: ['hero', 'features', 'team', 'pricing', 'contact', 'footer'],
    functionalities: ['auth', 'dashboard', 'search', 'filters', 'notifications', 'analytics', 'export'],
    font: 'Inter', colorScheme: 'Roxo Tech', favorites: true, version: 2,
    tokens: 3200, estimatedTime: 60, createdAt: '2025-06-22T08:00:00Z', updatedAt: '2025-06-24T16:00:00Z', tags: ['saas', 'dashboard', 'financeiro'],
  },
];

export const usePromptStore = create<PromptStore>()(
  persist(
    (set, get) => ({
      prompts: MOCK_PROMPTS,
      favorites: MOCK_PROMPTS.filter((p) => p.favorites),

  addPrompt: (data) => {
    const prompt: Prompt = {
      id: generateId(), projectId: data.projectId || '', userId: data.userId || 'usr_demo_001',
      title: data.title || 'Novo Prompt', content: data.content || '',
      rawPrompt: data.rawPrompt || '', status: data.status || 'draft',
      objective: data.objective || 'landing-page', niche: data.niche || 'tech',
      style: data.style || 'minimalista', platform: data.platform || 'lovable',
      language: data.language || 'pt', technologies: data.technologies || [],
      animations: data.animations || [], structures: data.structures || [],
      functionalities: data.functionalities || [], font: data.font || 'Inter',
      colorScheme: data.colorScheme || 'Roxo Tech', favorites: false, version: 1,
      tokens: data.tokens || 0, estimatedTime: data.estimatedTime || 0,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), tags: data.tags || [],
    };
    set((s) => ({ prompts: [prompt, ...s.prompts] }));
    return prompt;
  },

  updatePrompt: (id, data) => {
    set((s) => ({
      prompts: s.prompts.map((p) =>
        p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p
      ),
    }));
  },

  deletePrompt: (id) => {
    set((s) => ({
      prompts: s.prompts.filter((p) => p.id !== id),
      favorites: s.favorites.filter((p) => p.id !== id),
    }));
  },

  toggleFavorite: (id) => {
    const prompt = get().prompts.find((p) => p.id === id);
    if (!prompt) return;
    const newFav = !prompt.favorites;
    set((s) => ({
      prompts: s.prompts.map((p) => (p.id === id ? { ...p, favorites: newFav } : p)),
      favorites: newFav
        ? [...s.favorites, { ...prompt, favorites: true }]
        : s.favorites.filter((p) => p.id !== id),
    }));
  },

  getPromptById: (id) => get().prompts.find((p) => p.id === id),

  getFiltered: (filters) => {
    let result = get().prompts;
    if (filters.search) {
      const s = filters.search.toLowerCase();
      result = result.filter((p) => p.title.toLowerCase().includes(s) || p.content.toLowerCase().includes(s));
    }
    if (filters.niche && filters.niche !== 'all') result = result.filter((p) => p.niche === filters.niche);
    if (filters.platform && filters.platform !== 'all') result = result.filter((p) => p.platform === filters.platform);
    return result;
  },
    }),
    { name: 'promptforge-prompts' }
  )
);