import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, X, FileText, ClipboardList, Eye, Edit3, Trash2,
  FileDown, Search, Calendar, User, Building2, Target,
  Globe, Palette, Upload, Download,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useBriefingStore } from '@/store/briefingStore';
import type { Briefing } from '@/store/briefingStore';
import { NICHES, OBJECTIVES } from '@/lib/constants';
import { cn, formatDate } from '@/lib/utils';
import { UpgradeBlock } from '@/components/UpgradeBlock';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

function BriefingForm({ briefing, onClose, onSave }: { briefing?: Briefing | null; onClose: () => void; onSave: (data: any) => void }) {
  const { user } = useAuthStore();
  const isPro = user?.plan === 'pro';
  const [files, setFiles] = useState<File[]>([]);
  const [form, setForm] = useState({
    clientName: briefing?.clientName || '',
    companyName: briefing?.companyName || '',
    industry: briefing?.industry || '',
    objectives: briefing?.objectives || [] as string[],
    projectDescription: briefing?.projectDescription || '',
    targetAudience: briefing?.targetAudience || '',
    competitors: briefing?.competitors || '',
    references: briefing?.references || '',
    colorPreferences: briefing?.colorPreferences || '',
    fontPreferences: briefing?.fontPreferences || '',
    tone: briefing?.tone || '',
    mandatoryElements: briefing?.mandatoryElements || '',
    avoidedElements: briefing?.avoidedElements || '',
    deadline: briefing?.deadline || '',
    budget: briefing?.budget || 0,
    additionalNotes: briefing?.additionalNotes || '',
  });

  const update = (data: any) => setForm({ ...form, ...data });

  const toggleObjective = (id: string) => {
    update({ objectives: form.objectives.includes(id) ? form.objectives.filter((o) => o !== id) : [...form.objectives, id] });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 overflow-y-auto" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="glass-card p-6 max-w-2xl w-full my-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">{briefing ? 'Editar Briefing' : 'Novo Briefing'}</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white"><X size={20} /></button>
        </div>
        <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="Nome do Cliente" value={form.clientName} onChange={(e) => update({ clientName: e.target.value })} className="input-glass" />
            <input type="text" placeholder="Nome da Empresa" value={form.companyName} onChange={(e) => update({ companyName: e.target.value })} className="input-glass" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <select value={form.industry} onChange={(e) => update({ industry: e.target.value })} className="input-glass">
              <option value="">Selecione o nicho</option>
              {Object.entries(NICHES.reduce<Record<string, string>>((acc, n) => { acc[n.id] = n.label; return acc; }, {})).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <input type="number" placeholder="Orçamento (R$)" value={form.budget || ''} onChange={(e) => update({ budget: Number(e.target.value) })} className="input-glass" />
          </div>
          <div>
            <label className="text-sm text-zinc-300 mb-2 block">Objetivos do Projeto</label>
            <div className="flex flex-wrap gap-2">
              {OBJECTIVES.map((obj) => (
                <button key={obj.id} onClick={() => toggleObjective(obj.id)} className={cn(
                  'px-3 py-1.5 rounded-lg text-xs border transition-all',
                  form.objectives.includes(obj.id) ? 'bg-purple-500/15 border-purple-500/40 text-purple-300' : 'glass-card text-zinc-400 border-white/5'
                )}>
                  {obj.label}
                </button>
              ))}
            </div>
          </div>
          <textarea rows={3} placeholder="Descrição do Projeto" value={form.projectDescription} onChange={(e) => update({ projectDescription: e.target.value })} className="input-glass resize-none" />
          <textarea rows={2} placeholder="Público-Alvo" value={form.targetAudience} onChange={(e) => update({ targetAudience: e.target.value })} className="input-glass resize-none" />
          <div className="grid grid-cols-2 gap-4">
            <textarea rows={2} placeholder="Concorrentes" value={form.competitors} onChange={(e) => update({ competitors: e.target.value })} className="input-glass resize-none" />
            <textarea rows={2} placeholder="Sites de Referência" value={form.references} onChange={(e) => update({ references: e.target.value })} className="input-glass resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="Preferências de Cores" value={form.colorPreferences} onChange={(e) => update({ colorPreferences: e.target.value })} className="input-glass" />
            <input type="text" placeholder="Preferências de Fontes" value={form.fontPreferences} onChange={(e) => update({ fontPreferences: e.target.value })} className="input-glass" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="Tom de Voz" value={form.tone} onChange={(e) => update({ tone: e.target.value })} className="input-glass" />
            <input type="date" placeholder="Prazo" value={form.deadline} onChange={(e) => update({ deadline: e.target.value })} className="input-glass" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <textarea rows={2} placeholder="Elementos Obrigatórios" value={form.mandatoryElements} onChange={(e) => update({ mandatoryElements: e.target.value })} className="input-glass resize-none" />
            <textarea rows={2} placeholder="Elementos a Evitar" value={form.avoidedElements} onChange={(e) => update({ avoidedElements: e.target.value })} className="input-glass resize-none" />
          </div>
          <textarea rows={2} placeholder="Observações Adicionais" value={form.additionalNotes} onChange={(e) => update({ additionalNotes: e.target.value })} className="input-glass resize-none" />
          {isPro && (
            <div className="glass-card p-4 text-center">
              <Upload size={20} className="text-zinc-500 mx-auto mb-1" />
              <p className="text-xs text-zinc-400">Upload de arquivos (PDF, DOCX, TXT)</p>
              <input type="file" multiple className="hidden" onChange={(e) => { if (e.target.files) setFiles([...files, ...Array.from(e.target.files)]); }} />
              {files.length > 0 && (
                <div className="mt-2 space-y-1">
                  {files.map((f, i) => (
                    <div key={i} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-1.5 text-xs">
                      <span className="text-zinc-300">{f.name}</span>
                      <button onClick={() => setFiles(files.filter((_, j) => j !== i))}><X size={12} className="text-zinc-500" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <button onClick={() => { onSave(form); onClose(); }} className="btn-primary w-full mt-6">Salvar Briefing</button>
      </motion.div>
    </motion.div>
  );
}

export default function BriefingsPage() {
  const { user } = useAuthStore();
  const { briefings, addBriefing, updateBriefing, deleteBriefing } = useBriefingStore();
  const [showForm, setShowForm] = useState(false);
  const [editBriefing, setEditBriefing] = useState<Briefing | null>(null);
  const [viewBriefing, setViewBriefing] = useState<Briefing | null>(null);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) return briefings;
    const s = search.toLowerCase();
    return briefings.filter((b) => b.clientName.toLowerCase().includes(s) || b.companyName.toLowerCase().includes(s));
  }, [briefings, search]);

  const handleSave = (data: any) => {
    if (editBriefing) {
      updateBriefing(editBriefing.id, data);
    } else {
      addBriefing(data);
    }
    setEditBriefing(null);
  };

  const exportBriefing = (briefing: Briefing) => {
    const content = `BRIEFING\n\nCliente: ${briefing.clientName}\nEmpresa: ${briefing.companyName}\nNicho: ${briefing.industry}\nObjetivos: ${briefing.objectives.join(', ')}\n\nDescrição:\n${briefing.projectDescription}\n\nPúblico-Alvo: ${briefing.targetAudience}\nConcorrentes: ${briefing.competitors}\nReferências: ${briefing.references}\n\nCores: ${briefing.colorPreferences}\nFontes: ${briefing.fontPreferences}\nTom: ${briefing.tone}\n\nObrigatórios: ${briefing.mandatoryElements}\nEvitar: ${briefing.avoidedElements}\nPrazo: ${briefing.deadline}\nOrçamento: R$ ${briefing.budget}\n\nObs: ${briefing.additionalNotes}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `briefing_${briefing.clientName.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (briefings.length === 0 && !showForm) {
    if (user?.plan === 'none') {
      return <UpgradeBlock message="Assine um plano para criar briefings profissionais." />;
    }
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <ClipboardList size={48} className="text-zinc-600 mb-4" />
        <h3 className="text-lg font-bold text-white mb-2">Nenhum Briefing Ainda</h3>
        <p className="text-zinc-500 text-sm mb-6">Crie briefings completos para seus projetos</p>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Novo Briefing
        </button>
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Briefings</h1>
          <p className="text-sm text-zinc-400">{briefings.length} briefings</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input type="text" placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-glass pl-9 w-40" />
          </div>
          {user?.plan === 'none' ? (
            <UpgradeBlock message="Assine um plano para criar briefings profissionais." />
          ) : (
          <button onClick={() => { setEditBriefing(null); setShowForm(true); }} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Novo
          </button>
          )}
        </div>
      </motion.div>

      <div className="space-y-3">
        {filtered.map((briefing) => (
          <motion.div key={briefing.id} variants={itemVariants} className="glass-card p-5 group">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <ClipboardList size={16} className="text-purple-400 shrink-0" />
                  <h3 className="text-sm font-semibold text-white truncate">{briefing.clientName}</h3>
                  {briefing.companyName && <span className="text-xs text-zinc-500">- {briefing.companyName}</span>}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                  <span className="flex items-center gap-1"><Building2 size={12} /> {briefing.industry || 'N/A'}</span>
                  <span className="flex items-center gap-1"><Target size={12} /> {briefing.objectives.length} objetivos</span>
                  <span className="flex items-center gap-1"><Calendar size={12} /> {formatDate(briefing.createdAt)}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => setViewBriefing(briefing)} className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-all" title="Visualizar">
                  <Eye size={16} />
                </button>
                <button onClick={() => { setEditBriefing(briefing); setShowForm(true); }} className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-all" title="Editar">
                  <Edit3 size={16} />
                </button>
                <button onClick={() => exportBriefing(briefing)} className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-all" title="Exportar">
                  <FileDown size={16} />
                </button>
                <button onClick={() => { if (window.confirm('Tem certeza que deseja excluir este briefing?')) deleteBriefing(briefing.id); }} className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Excluir">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showForm && <BriefingForm briefing={editBriefing} onClose={() => { setShowForm(false); setEditBriefing(null); }} onSave={handleSave} />}
        {viewBriefing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 overflow-y-auto" onClick={() => setViewBriefing(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="glass-card p-6 max-w-2xl w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">{viewBriefing.clientName}</h3>
                <button onClick={() => setViewBriefing(null)} className="text-zinc-500 hover:text-white"><X size={20} /></button>
              </div>
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div><span className="text-zinc-500">Empresa:</span> <span className="text-white ml-1">{viewBriefing.companyName || '-'}</span></div>
                  <div><span className="text-zinc-500">Nicho:</span> <span className="text-white ml-1">{viewBriefing.industry || '-'}</span></div>
                </div>
                <div><span className="text-zinc-500">Objetivos:</span> <div className="flex flex-wrap gap-1 mt-1">{viewBriefing.objectives.map((o) => <span key={o} className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400">{OBJECTIVES.find(obj => obj.id === o)?.label || o}</span>)}</div></div>
                <div><span className="text-zinc-500">Descrição:</span><p className="text-white mt-1">{viewBriefing.projectDescription || '-'}</p></div>
                <div><span className="text-zinc-500">Público-Alvo:</span><p className="text-white mt-1">{viewBriefing.targetAudience || '-'}</p></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><span className="text-zinc-500">Concorrentes:</span><p className="text-white mt-1">{viewBriefing.competitors || '-'}</p></div>
                  <div><span className="text-zinc-500">Referências:</span><p className="text-white mt-1">{viewBriefing.references || '-'}</p></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><span className="text-zinc-500">Cores:</span><span className="text-white ml-1">{viewBriefing.colorPreferences || '-'}</span></div>
                  <div><span className="text-zinc-500">Fontes:</span><span className="text-white ml-1">{viewBriefing.fontPreferences || '-'}</span></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><span className="text-zinc-500">Tom:</span><span className="text-white ml-1">{viewBriefing.tone || '-'}</span></div>
                  <div><span className="text-zinc-500">Prazo:</span><span className="text-white ml-1">{viewBriefing.deadline ? formatDate(viewBriefing.deadline) : '-'}</span></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><span className="text-zinc-500">Obrigatórios:</span><p className="text-white mt-1">{viewBriefing.mandatoryElements || '-'}</p></div>
                  <div><span className="text-zinc-500">Evitar:</span><p className="text-white mt-1">{viewBriefing.avoidedElements || '-'}</p></div>
                </div>
                <div><span className="text-zinc-500">Orçamento:</span><span className="text-white ml-1">R$ {viewBriefing.budget}</span></div>
                {viewBriefing.additionalNotes && <div><span className="text-zinc-500">Observações:</span><p className="text-white mt-1">{viewBriefing.additionalNotes}</p></div>}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
