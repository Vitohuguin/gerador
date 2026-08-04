import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  Search, Filter, X, Eye, Edit3, Copy, Trash2, RotateCcw,
  Sparkles, Calendar, Tag, Globe, Heart, SortAsc, Code2,
  ChevronDown, Clock, FileText,
} from 'lucide-react';
import { usePromptStore } from '@/store/promptStore';
import { useAuthStore } from '@/store/authStore';
import { UpgradeBlock } from '@/components/UpgradeBlock';
import { NICHES, PLATFORMS, LANGUAGES } from '@/lib/constants';
import { cn, formatDate, timeAgo } from '@/lib/utils';
import type { NicheCategory, Platform, Language } from '@/types';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

function ViewModal({ prompt, onClose }: { prompt: any; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-card p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">{prompt.title}</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors"><X size={20} /></button>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-xs bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/20">{prompt.niche}</span>
          <span className="text-xs bg-pink-500/10 text-pink-400 px-2 py-0.5 rounded-full border border-pink-500/20">{prompt.platform}</span>
          <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">{prompt.language}</span>
          <span className="text-xs bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20">{prompt.tokens} tokens</span>
        </div>
        <pre className="text-sm text-zinc-300 whitespace-pre-wrap font-mono leading-relaxed bg-black/30 rounded-xl p-4 max-h-[400px] overflow-y-auto">
          {prompt.content}
        </pre>
      </motion.div>
    </motion.div>
  );
}

export default function HistoryPage() {
  const { prompts, deletePrompt, toggleFavorite, updatePrompt, addPrompt } = usePromptStore();
  const [search, setSearch] = useState('');
  const [nicheFilter, setNicheFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'tokens'>('date');
  const [viewPrompt, setViewPrompt] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = [...prompts];
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(
        (p) => p.title.toLowerCase().includes(s) || p.content.toLowerCase().includes(s)
      );
    }
    if (nicheFilter !== 'all') result = result.filter((p) => p.niche === nicheFilter);
    if (platformFilter !== 'all') result = result.filter((p) => p.platform === platformFilter);
    result.sort((a, b) => {
      if (sortBy === 'date') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'name') return a.title.localeCompare(b.title);
      return b.tokens - a.tokens;
    });
    return result;
  }, [prompts, search, nicheFilter, platformFilter, sortBy]);

  const copyPrompt = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const regeneratePrompt = async (id: string) => {
    const prompt = prompts.find((p) => p.id === id);
    if (!prompt) return;
    try {
      const { nvidiaAPI } = await import('@/services/api');
      const res = await nvidiaAPI.generatePrompt({
        objective: prompt.objective,
        niche: prompt.niche,
        style: prompt.style,
        platform: prompt.platform,
        language: prompt.language,
        technologies: prompt.technologies,
        animations: prompt.animations,
        structures: prompt.structures,
        functionalities: prompt.functionalities,
        font: prompt.font,
        colorScheme: prompt.colorScheme,
        targetAudience: '',
        referenceUrl: '',
        description: '',
        additionalContext: '',
      }, prompt.language);
      updatePrompt(id, { content: res.content, tokens: res.tokens });
      toast.success('Prompt regenerado com sucesso!');
    } catch (err: any) {
      toast.error('Erro ao regenerar: ' + (err?.message || 'Tente novamente'));
    }
  };

  const nicheLabels = Object.entries(
    NICHES.reduce<Record<string, string>>((acc, n) => {
      acc[n.id] = n.label;
      return acc;
    }, {})
  );

  const user = useAuthStore(s => s.user);

  if (user?.plan === 'none') {
    return <UpgradeBlock message="Assine um plano para acessar o histórico de prompts." />;
  }

  if (prompts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <FileText size={48} className="text-zinc-600 mb-4" />
        <h3 className="text-lg font-bold text-white mb-2">Nenhum Prompt Ainda</h3>
        <p className="text-zinc-500 text-sm mb-6">Seus prompts gerados aparecerão aqui</p>
        <a href="/dashboard/wizard" className="btn-primary flex items-center gap-2">
          <Sparkles size={18} /> Criar Primeiro Prompt
        </a>
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4 sm:space-y-6">
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Histórico de Prompts</h1>
          <p className="text-xs sm:text-sm text-zinc-400">{filtered.length} prompts encontrados</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn('btn-glass flex items-center gap-2 text-sm px-4 py-2.5 sm:py-2', showFilters && 'border-purple-500/40')}
        >
          <Filter size={16} /> Filtros <ChevronDown size={14} className={cn('transition-transform', showFilters && 'rotate-180')} />
        </button>
      </motion.div>

      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="glass-card p-4"
        >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Buscar prompts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-glass pl-9"
              />
            </div>
            <select
              value={nicheFilter}
              onChange={(e) => setNicheFilter(e.target.value)}
              className="input-glass"
            >
              <option value="all">Todos os nichos</option>
              {nicheLabels.map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="input-glass"
            >
              <option value="all">Todas plataformas</option>
              {PLATFORMS.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="input-glass"
            >
              <option value="date">Data</option>
              <option value="name">Nome</option>
              <option value="tokens">Tokens</option>
            </select>
          </div>
        </motion.div>
      )}

      <div className="space-y-3">
        {filtered.map((prompt) => (
          <motion.div key={prompt.id} variants={itemVariants} className="glass-card p-5 group">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
              <div className="flex-1 min-w-0 w-full sm:w-auto">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-white truncate">{prompt.title}</h3>
                  {prompt.favorites && <Heart size={14} className="text-pink-400 fill-pink-400 shrink-0" />}
                </div>
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-zinc-500">
                  <span className="flex items-center gap-1"><Calendar size={10} className="sm:hidden" /><Calendar size={12} className="hidden sm:block" /> {timeAgo(prompt.createdAt)}</span>
                  <span className="flex items-center gap-1"><Tag size={10} className="sm:hidden" /><Tag size={12} className="hidden sm:block" /> {prompt.niche}</span>
                  <span className="flex items-center gap-1"><Globe size={10} className="sm:hidden" /><Globe size={12} className="hidden sm:block" /> {prompt.platform}</span>
                  <span className="flex items-center gap-1"><Code2 size={10} className="sm:hidden" /><Code2 size={12} className="hidden sm:block" /> {prompt.tokens} tokens</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {LANGUAGES.find((l) => l.id === prompt.language)?.label || prompt.language}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-0.5 sm:gap-1 shrink-0 self-end sm:self-center -mr-1 sm:mr-0">
                <button onClick={() => setViewPrompt(prompt)} className="min-w-[36px] min-h-[36px] flex items-center justify-center p-1.5 sm:p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-all" title="Visualizar">
                  <Eye size={15} />
                </button>
                <button onClick={copyPrompt.bind(null, prompt.content, prompt.id)} className="min-w-[36px] min-h-[36px] flex items-center justify-center p-1.5 sm:p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-all" title="Copiar">
                  {copiedId === prompt.id ? <X size={15} className="text-emerald-400" /> : <Copy size={15} />}
                </button>
                <button onClick={() => regeneratePrompt(prompt.id)} className="min-w-[36px] min-h-[36px] flex items-center justify-center p-1.5 sm:p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-all" title="Regenerar">
                  <RotateCcw size={15} />
                </button>
                <button onClick={() => toggleFavorite(prompt.id)} className={cn('min-w-[36px] min-h-[36px] flex items-center justify-center p-1.5 sm:p-2 rounded-lg transition-all', prompt.favorites ? 'text-pink-400 hover:bg-pink-500/10' : 'text-zinc-500 hover:text-white hover:bg-white/5')} title="Favoritar">
                  <Heart size={15} fill={prompt.favorites ? 'currentColor' : 'none'} />
                </button>
                <button onClick={() => { if (window.confirm('Tem certeza que deseja excluir este prompt?')) deletePrompt(prompt.id); }} className="min-w-[36px] min-h-[36px] flex items-center justify-center p-1.5 sm:p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Excluir">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {viewPrompt && (
        <ViewModal prompt={viewPrompt} onClose={() => setViewPrompt(null)} />
      )}
    </motion.div>
  );
}
