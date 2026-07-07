import { useMemo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Sparkles, FileSignature, FileText,
  FolderKanban, Plus, Clock, ArrowRight, TrendingUp,
  DollarSign, Users, Activity, BarChart3, PenLine,
  FileCheck, Handshake, Zap,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { usePromptStore } from '@/store/promptStore';
import { useProjectStore } from '@/store/projectStore';
import { useContractStore } from '@/store/contractStore';
import { useProposalStore } from '@/store/proposalStore';
import { usageAPI } from '@/services/api';
import { formatCurrency, formatDate, timeAgo, cn } from '@/lib/utils';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { prompts } = usePromptStore();
  const { projects } = useProjectStore();
  const { contracts } = useContractStore();
  const { proposals } = useProposalStore();
  const [usage, setUsage] = useState({ prompts: { used: 0, limit: 100 }, contracts: { used: 0, limit: 20 }, projects: { used: 0, limit: 5 } });

  useEffect(() => {
    usageAPI.getUsage().then(setUsage).catch(() => {});
    const onFocus = () => usageAPI.getUsage().then(setUsage).catch(() => {});
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);
  const shortcuts = [
    { label: 'Novo Prompt', icon: Zap, path: '/dashboard/wizard', color: 'from-purple-500 to-pink-500' },
    { label: 'Gerador de Contratos', icon: FileSignature, path: '/dashboard/contracts', color: 'from-emerald-500 to-teal-500' },
    { label: 'Projetos', icon: FolderKanban, path: '/dashboard/projects', color: 'from-blue-500 to-indigo-500' },
    { label: 'Propostas Comerciais', icon: FileText, path: '/dashboard/proposals', color: 'from-amber-500 to-orange-500' },
  ];

  const statCards = useMemo(() => [
    { key: 'totalProjects', label: 'Total Projetos', icon: FolderKanban, color: 'from-violet-500 to-purple-600', value: projects.length },
    { key: 'totalPrompts', label: 'Total Prompts', icon: Sparkles, color: 'from-pink-500 to-rose-600', value: prompts.length },
    { key: 'totalContracts', label: 'Contratos', icon: FileSignature, color: 'from-emerald-500 to-teal-600', value: contracts.length },
    { key: 'totalProposals', label: 'Propostas', icon: FileText, color: 'from-amber-500 to-orange-600', value: proposals.length },
  ], [projects.length, prompts.length, contracts.length, proposals.length]);

  const recentProjects = [...projects].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 3);
  const recentPrompts = [...prompts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 3);

  const statusColor: Record<string, string> = {
    active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    draft: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    completed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    archived: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
      <motion.div variants={itemVariants}>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
          {'Bem-vindo'}, <span className="gradient-text">{user?.name?.split(' ')[0] || 'Usuario'}</span>
        </h1>
        <p className="text-sm sm:text-base text-zinc-400 mt-1">{'Visao geral da sua plataforma de criacao de prompts'}</p>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.key} className="glass-card p-5 relative overflow-hidden group">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <Icon size={20} className="text-white" />
                </div>
                <span className="text-2xl font-bold text-white">{stat.value}</span>
              </div>
              <p className="text-sm text-zinc-400">{stat.label}</p>
            </div>
          );
        })}
        <div className="glass-card p-5">
          <p className="text-xs text-zinc-500 mb-1">Prompts usados</p>
          <p className="text-lg font-bold text-white mb-2">{usage.prompts.used}/{usage.prompts.limit === Infinity ? '∞' : usage.prompts.limit}</p>
          {usage.prompts.limit !== Infinity && (
            <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all" style={{ width: `${Math.min((usage.prompts.used / usage.prompts.limit) * 100, 100)}%` }} />
            </div>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <motion.div variants={itemVariants} className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FolderKanban size={18} className="text-purple-400" />
              <h2 className="text-lg font-semibold text-white">{'Projetos Recentes'}</h2>
            </div>
            <button onClick={() => navigate('/dashboard/projects')} className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors">
              {'Ver todos'} <ArrowRight size={14} />
            </button>
          </div>
          <div className="space-y-3">
            {recentProjects.length === 0 ? (
              <p className="text-zinc-500 text-sm py-4 text-center">{'Nenhum projeto ainda'}</p>
            ) : (
              recentProjects.map((project) => (
                <div key={project.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/[0.07] transition-colors cursor-pointer" onClick={() => navigate('/dashboard/projects')}>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: project.color }} />
                    <div>
                      <p className="text-sm font-medium text-white">{project.name}</p>
                      <p className="text-xs text-zinc-500">{timeAgo(project.updatedAt)}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusColor[project.status] || statusColor.draft}`}>
                    {project.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-pink-400" />
              <h2 className="text-lg font-semibold text-white">{'Prompts Recentes'}</h2>
            </div>
            <button onClick={() => navigate('/dashboard/history')} className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors">
              {'Ver todos'} <ArrowRight size={14} />
            </button>
          </div>
          <div className="space-y-3">
            {recentPrompts.length === 0 ? (
              <p className="text-zinc-500 text-sm py-4 text-center">{'Nenhum prompt ainda'}</p>
            ) : (
              recentPrompts.map((prompt) => (
                <div key={prompt.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/[0.07] transition-colors cursor-pointer" onClick={() => navigate('/dashboard/history')}>
                  <div>
                    <p className="text-sm font-medium text-white">{prompt.title}</p>
                    <p className="text-xs text-zinc-500">{timeAgo(prompt.createdAt)} - {prompt.tokens} tokens</p>
                  </div>
                  <span className="text-xs text-zinc-400 capitalize">{prompt.niche}</span>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      <motion.div variants={itemVariants}>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Zap size={18} className="text-purple-400" />
          {'Atalhos Rapidos'}
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {shortcuts.map((shortcut) => {
            const Icon = shortcut.icon;
            return (
              <button
                key={shortcut.path}
                onClick={() => navigate(shortcut.path)}
                className="glass-card p-5 text-left group hover:translate-y-0"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${shortcut.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon size={20} className="text-white" />
                </div>
                <p className="text-sm font-medium text-white">{shortcut.label}</p>
              </button>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}

