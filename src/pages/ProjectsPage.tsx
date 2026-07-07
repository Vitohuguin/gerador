import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, X, Search, FolderKanban, FileText, FileSignature,
  Calendar, Tag, MoreHorizontal, Edit3, Trash2, Eye,
  ChevronDown, Circle,
} from 'lucide-react';
import { useProjectStore } from '@/store/projectStore';
import { NICHES, PLATFORMS } from '@/lib/constants';
import { cn, formatDate, generateId } from '@/lib/utils';
import type { Project, ProjectStatus, NicheCategory, Platform } from '@/types';

const statusConfig: Record<ProjectStatus, { label: string; color: string }> = {
  draft: { label: 'Rascunho', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  active: { label: 'Ativo', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  completed: { label: 'Concluído', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  archived: { label: 'Arquivado', color: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30' },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

function ProjectModal({
  project,
  onClose,
  onSave,
}: {
  project?: Project | null;
  onClose: () => void;
  onSave: (data: Partial<Project>) => void;
}) {
  const [form, setForm] = useState({
    name: project?.name || '',
    description: project?.description || '',
    status: project?.status || 'draft' as ProjectStatus,
    niche: project?.niche || ('tech' as NicheCategory),
    platform: project?.platform || ('lovable' as Platform),
    color: project?.color || '#A855F7',
    tags: project?.tags?.join(', ') || '',
  });

  const allNicheLabels = Object.entries(
    NICHES.reduce<Record<string, string>>((acc, n) => {
      acc[n.id] = n.label || n.id;
      return acc;
    }, {})
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0, y: 50 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 50 }} onClick={(e) => e.stopPropagation()} className="glass-card p-5 sm:p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto rounded-b-none sm:rounded-b-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">{project ? 'Editar Projeto' : 'Novo Projeto'}</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors"><X size={20} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-zinc-300 mb-1.5 block">Nome do Projeto</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Clínica Saúde+" className="input-glass" />
          </div>
          <div>
            <label className="text-sm text-zinc-300 mb-1.5 block">Descrição</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Breve descrição do projeto..." rows={3} className="input-glass resize-none" />
          </div>
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="text-sm text-zinc-300 mb-1.5 block">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ProjectStatus })} className="input-glass">
                <option value="draft">Rascunho</option>
                <option value="active">Ativo</option>
                <option value="completed">Concluído</option>
                <option value="archived">Arquivado</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-zinc-300 mb-1.5 block">Nicho</label>
              <select value={form.niche} onChange={(e) => setForm({ ...form, niche: e.target.value as NicheCategory })} className="input-glass">
                {allNicheLabels.map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="text-sm text-zinc-300 mb-1.5 block">Plataforma</label>
              <select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value as Platform })} className="input-glass">
                {PLATFORMS.map((p) => (<option key={p.id} value={p.id}>{p.label}</option>))}
              </select>
            </div>
            <div>
              <label className="text-sm text-zinc-300 mb-1.5 block">Cor</label>
              <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="input-glass h-[42px] p-1" />
            </div>
          </div>
          <div>
            <label className="text-sm text-zinc-300 mb-1.5 block">Tags (separadas por vírgula)</label>
            <input type="text" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="site, clinica, medicina" className="input-glass" />
          </div>
          <button
            onClick={() => {
              onSave({
                name: form.name,
                description: form.description,
                status: form.status,
                niche: form.niche,
                platform: form.platform,
                color: form.color,
                tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
              });
              onClose();
            }}
            className="btn-primary w-full"
          >
            {project ? 'Salvar Alterações' : 'Criar Projeto'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ProjectsPage() {
  const { projects, addProject, updateProject, deleteProject } = useProjectStore();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showMenu, setShowMenu] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = [...projects];
    if (search) {
      const s = search.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(s) || p.description.toLowerCase().includes(s));
    }
    if (statusFilter !== 'all') result = result.filter((p) => p.status === statusFilter);
    return result;
  }, [projects, search, statusFilter]);

  const handleSave = (data: Partial<Project>) => {
    if (editingProject) {
      updateProject(editingProject.id, data);
    } else {
      addProject(data);
    }
    setEditingProject(null);
  };

  if (projects.length === 0 && !showModal) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <FolderKanban size={48} className="text-zinc-600 mb-4" />
        <h3 className="text-lg font-bold text-white mb-2">Nenhum Projeto Ainda</h3>
        <p className="text-zinc-500 text-sm mb-6">Crie seu primeiro projeto para organizar seus prompts</p>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Novo Projeto
        </button>
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4 sm:space-y-6">
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Projetos</h1>
          <p className="text-xs sm:text-sm text-zinc-400">{filtered.length} projetos</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input type="text" placeholder="Buscar projetos..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-glass pl-9 w-full sm:w-48" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-glass w-28 sm:w-32">
            <option value="all">Todos</option>
            <option value="active">Ativo</option>
            <option value="draft">Rascunho</option>
            <option value="completed">Concluído</option>
            <option value="archived">Arquivado</option>
          </select>
          <button onClick={() => { setEditingProject(null); setShowModal(true); }} className="btn-primary flex items-center gap-2 whitespace-nowrap px-4 py-2.5 sm:py-2 text-sm">
            <Plus size={18} /> Novo
          </button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((project) => {
          const st = statusConfig[project.status];
          return (
            <div key={project.id} className="glass-card p-5 group relative">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: project.color + '20' }}>
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{project.name}</h3>
                    <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full border', st.color)}>
                      {st.label}
                    </span>
                  </div>
                </div>
                <div className="relative">
                  <button onClick={() => setShowMenu(showMenu === project.id ? null : project.id)} className="p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-all">
                    <MoreHorizontal size={16} />
                  </button>
                  {showMenu === project.id && (
                    <div className="absolute right-0 top-8 glass-card p-1 min-w-[140px] z-10" onMouseLeave={() => setShowMenu(null)}>
                      <button onClick={() => { setEditingProject(project); setShowModal(true); setShowMenu(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                        <Edit3 size={14} /> Editar
                      </button>
                      <button onClick={() => { deleteProject(project.id); setShowMenu(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                        <Trash2 size={14} /> Excluir
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-xs text-zinc-500 mb-3 line-clamp-2">{project.description || 'Sem descrição'}</p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {project.tags.map((tag, i) => (
                  <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-zinc-400">{tag}</span>
                ))}
              </div>
              <div className="flex items-center justify-between text-xs text-zinc-500 pt-3 border-t border-white/5">
                <span className="flex items-center gap-1"><FileText size={12} /> {project.promptCount} prompts</span>
                <span className="flex items-center gap-1"><FileSignature size={12} /> {project.contractCount} contratos</span>
                <span className="flex items-center gap-1"><Calendar size={12} /> {formatDate(project.createdAt)}</span>
              </div>
            </div>
          );
        })}
      </motion.div>

      <AnimatePresence>
        {showModal && (
          <ProjectModal project={editingProject} onClose={() => { setShowModal(false); setEditingProject(null); }} onSave={handleSave} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
