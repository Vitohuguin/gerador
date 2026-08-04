import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Filter, X, Heart, Grid3X3, List, Sparkles,
  Calendar, Tag, Globe, Code2, FileText, Trash2,
  ChevronDown, ArrowUpDown,
} from 'lucide-react';
import { usePromptStore } from '@/store/promptStore';
import { useAuthStore } from '@/store/authStore';
import { UpgradeBlock } from '@/components/UpgradeBlock';
import { NICHES, PLATFORMS } from '@/lib/constants';
import { cn, formatDate, timeAgo } from '@/lib/utils';
import type { NicheCategory, Platform } from '@/types';

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

export default function FavoritesPage() {
  const { prompts, toggleFavorite } = usePromptStore();
  const [search, setSearch] = useState('');
  const [nicheFilter, setNicheFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const favorites = useMemo(() => {
    let result = prompts.filter((p) => p.favorites);
    if (search) {
      const s = search.toLowerCase();
      result = result.filter((p) => p.title.toLowerCase().includes(s));
    }
    if (nicheFilter !== 'all') result = result.filter((p) => p.niche === nicheFilter);
    if (platformFilter !== 'all') result = result.filter((p) => p.platform === platformFilter);
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [prompts, search, nicheFilter, platformFilter]);

  const user = useAuthStore(s => s.user);

  if (user?.plan === 'none') {
    return <UpgradeBlock message="Assine um plano para acessar seus prompts favoritos." />;
  }

  if (favorites.length === 0 && prompts.filter((p) => p.favorites).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Heart size={48} className="text-zinc-600 mb-4" />
        <h3 className="text-lg font-bold text-white mb-2">Nenhum Favorito</h3>
        <p className="text-zinc-500 text-sm mb-6">Marque prompts como favoritos para vê-los aqui</p>
        <a href="/dashboard/history" className="btn-primary flex items-center gap-2">
          <Sparkles size={18} /> Ver Histórico de Prompts
        </a>
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Favoritos</h1>
          <p className="text-sm text-zinc-400">{favorites.length} prompts favoritados</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex glass-card p-1">
            <button onClick={() => setViewMode('grid')} className={cn('p-1.5 rounded-lg transition-all', viewMode === 'grid' ? 'bg-purple-500/20 text-purple-400' : 'text-zinc-500')}>
              <Grid3X3 size={16} />
            </button>
            <button onClick={() => setViewMode('list')} className={cn('p-1.5 rounded-lg transition-all', viewMode === 'list' ? 'bg-purple-500/20 text-purple-400' : 'text-zinc-500')}>
              <List size={16} />
            </button>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn('btn-glass flex items-center gap-2', showFilters && 'border-purple-500/40')}
          >
            <Filter size={16} /> Filtros
          </button>
        </div>
      </motion.div>

      {showFilters && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="glass-card p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input type="text" placeholder="Buscar favoritos..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-glass pl-9" />
            </div>
            <select value={nicheFilter} onChange={(e) => setNicheFilter(e.target.value)} className="input-glass">
              <option value="all">Todos os nichos</option>
              {Object.entries(NICHES.reduce<Record<string, string>>((acc, n) => { acc[n.id] = n.label; return acc; }, {})).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <select value={platformFilter} onChange={(e) => setPlatformFilter(e.target.value)} className="input-glass">
              <option value="all">Todas plataformas</option>
              {PLATFORMS.map((p) => (<option key={p.id} value={p.id}>{p.label}</option>))}
            </select>
          </div>
        </motion.div>
      )}

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map((prompt) => (
            <motion.div key={prompt.id} variants={itemVariants} className="glass-card p-5 group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center">
                  <Heart size={16} className="text-pink-400 fill-pink-400" />
                </div>
                <button onClick={() => toggleFavorite(prompt.id)} className="p-1.5 rounded-lg text-pink-400 hover:bg-pink-500/10 transition-all">
                  <X size={14} />
                </button>
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">{prompt.title}</h3>
              <div className="flex flex-wrap gap-1.5 mb-3">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">{prompt.niche}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-pink-500/10 text-pink-400 border border-pink-500/20">{prompt.platform}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span>{timeAgo(prompt.createdAt)}</span>
                <span>{prompt.tokens} tokens</span>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {favorites.map((prompt) => (
            <motion.div key={prompt.id} variants={itemVariants} className="glass-card p-4 flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center shrink-0">
                  <Heart size={14} className="text-pink-400 fill-pink-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{prompt.title}</p>
                  <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5">
                    <span>{timeAgo(prompt.createdAt)}</span>
                    <span>{prompt.niche}</span>
                    <span>{prompt.platform}</span>
                    <span>{prompt.tokens} tokens</span>
                  </div>
                </div>
              </div>
              <button onClick={() => toggleFavorite(prompt.id)} className="p-2 rounded-lg text-pink-400 hover:bg-pink-500/10 transition-all">
                <Heart size={16} fill="currentColor" />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
