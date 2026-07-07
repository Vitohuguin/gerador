import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { UpgradeBlock } from '@/components/UpgradeBlock';
import {
  Plus, X, FileText, Eye, Edit3, Trash2, Copy,
  FileDown, Search, Filter, Calendar, DollarSign,
  User, ArrowRight, ChevronDown, Send, CheckCircle,
  XCircle, Clock, Download, Crown,
} from 'lucide-react';
import { useProposalStore, type ProposalItem } from '@/store/proposalStore';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import type { ProposalStatus } from '@/types';

const statusConfig: Record<ProposalStatus, { label: string; icon: React.ElementType; color: string }> = {
  draft: { label: 'Rascunho', icon: Clock, color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  sent: { label: 'Enviada', icon: Send, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  accepted: { label: 'Aceita', icon: CheckCircle, color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  rejected: { label: 'Rejeitada', icon: XCircle, color: 'bg-red-500/20 text-red-400 border-red-500/30' },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

function ProposalForm({ proposal, onClose, onSave }: { proposal?: ProposalItem | null; onClose: () => void; onSave: (data: any) => void }) {
  const [form, setForm] = useState({
    title: proposal?.title || '',
    clientName: proposal?.clientName || '',
    clientEmail: proposal?.clientEmail || '',
    projectScope: proposal?.projectScope || '',
    technologies: proposal?.technologies || '',
    timeline: proposal?.timeline || '',
    totalValue: proposal?.totalValue || 0,
    notes: proposal?.notes || '',
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="glass-card p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">{proposal ? 'Editar Proposta' : 'Nova Proposta'}</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white"><X size={20} /></button>
        </div>
        <div className="space-y-4">
          <input type="text" placeholder="Título da Proposta" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-glass" />
          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="Nome do Cliente" value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} className="input-glass" />
            <input type="email" placeholder="Email do Cliente" value={form.clientEmail} onChange={(e) => setForm({ ...form, clientEmail: e.target.value })} className="input-glass" />
          </div>
          <textarea rows={3} placeholder="Escopo do Projeto" value={form.projectScope} onChange={(e) => setForm({ ...form, projectScope: e.target.value })} className="input-glass resize-none" />
          <input type="text" placeholder="Tecnologias (separadas por vírgula)" value={form.technologies} onChange={(e) => setForm({ ...form, technologies: e.target.value })} className="input-glass" />
          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="Cronograma" value={form.timeline} onChange={(e) => setForm({ ...form, timeline: e.target.value })} className="input-glass" />
            <input type="number" placeholder="Valor Total" value={form.totalValue || ''} onChange={(e) => setForm({ ...form, totalValue: Number(e.target.value) })} className="input-glass" />
          </div>
          <textarea rows={3} placeholder="Observações" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input-glass resize-none" />
          <button onClick={() => { onSave(form); onClose(); }} className="btn-primary w-full">
            {proposal ? 'Salvar Alterações' : 'Criar Proposta'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ProposalContent({ proposal }: { proposal: ProposalItem }) {
  return (
    <div className="glass-card p-6 max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-white">{proposal.title}</h2>
        <p className="text-zinc-400 text-sm">{formatDate(proposal.createdAt)}</p>
      </div>
      <div className="space-y-4 text-sm">
        <div className="flex justify-between py-2 border-b border-white/5">
          <span className="text-zinc-500">Cliente</span>
          <span className="text-white">{proposal.clientName}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-white/5">
          <span className="text-zinc-500">Email</span>
          <span className="text-white">{proposal.clientEmail}</span>
        </div>
        <div className="py-2 border-b border-white/5">
          <span className="text-zinc-500 block mb-1">Escopo</span>
          <span className="text-white">{proposal.projectScope}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-white/5">
          <span className="text-zinc-500">Tecnologias</span>
          <span className="text-white">{proposal.technologies}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-white/5">
          <span className="text-zinc-500">Cronograma</span>
          <span className="text-white">{proposal.timeline}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-white/5">
          <span className="text-zinc-500">Valor</span>
          <span className="text-xl font-bold gradient-text">{formatCurrency(proposal.totalValue)}</span>
        </div>
        {proposal.notes && (
          <div className="py-2">
            <span className="text-zinc-500 block mb-1">Observações</span>
            <span className="text-white">{proposal.notes}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProposalsPage() {
  const navigate = useNavigate();
  const { proposals, addProposal, updateProposal, deleteProposal } = useProposalStore();
  const { user } = useAuthStore();
  const isPro = user?.plan === 'pro';
  const [showForm, setShowForm] = useState(false);
  const [editProposal, setEditProposal] = useState<ProposalItem | null>(null);
  const [viewProposal, setViewProposal] = useState<ProposalItem | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = useMemo(() => {
    let result = [...proposals];
    if (search) {
      const s = search.toLowerCase();
      result = result.filter((p) => p.title.toLowerCase().includes(s) || p.clientName.toLowerCase().includes(s));
    }
    if (statusFilter !== 'all') result = result.filter((p) => p.status === statusFilter);
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [proposals, search, statusFilter]);

  const handleSave = (data: any) => {
    if (editProposal) {
      updateProposal(editProposal.id, data);
    } else {
      addProposal(data);
    }
    setEditProposal(null);
  };

  const exportPdf = (proposal: ProposalItem) => {
    const content = `PROPOSTA COMERCIAL\n\nCliente: ${proposal.clientName}\nEmail: ${proposal.clientEmail}\nEscopo: ${proposal.projectScope}\nTecnologias: ${proposal.technologies}\nCronograma: ${proposal.timeline}\nValor: ${formatCurrency(proposal.totalValue)}\n\n${proposal.notes}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `${proposal.title.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (user?.plan === 'none') {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <FileText size={48} className="text-zinc-600 mb-4" />
        <h3 className="text-lg font-bold text-white mb-2">Propostas Comerciais</h3>
        <p className="text-zinc-500 text-sm mb-6">Disponível apenas para assinantes</p>
        <UpgradeBlock message="Assine um plano para criar propostas comerciais profissionais." />
      </div>
    );
  }

  if (proposals.length === 0 && !showForm) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <FileText size={48} className="text-zinc-600 mb-4" />
        <h3 className="text-lg font-bold text-white mb-2">Nenhuma Proposta Ainda</h3>
        <p className="text-zinc-500 text-sm mb-6">Crie propostas comerciais profissionais</p>
        {isPro ? (
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Nova Proposta
          </button>
        ) : (
          <UpgradeBlock message="Faça upgrade para o plano Pro para criar propostas." />
        )}
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Propostas Comerciais</h1>
          <p className="text-sm text-zinc-400">{filtered.length} propostas</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input type="text" placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-glass pl-9 w-40" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-glass w-28">
            <option value="all">Todos</option>
            <option value="draft">Rascunho</option>
            <option value="sent">Enviada</option>
            <option value="accepted">Aceita</option>
            <option value="rejected">Rejeitada</option>
          </select>
          {isPro ? (
            <button onClick={() => { setEditProposal(null); setShowForm(true); }} className="btn-primary flex items-center gap-2">
              <Plus size={18} /> Nova
            </button>
          ) : (
            <button onClick={() => navigate('/dashboard/plans')} className="btn-glass flex items-center gap-2 text-amber-400 border-amber-500/20 text-sm px-3 py-2">
              <Crown size={14} /> Pro
            </button>
          )}
        </div>
      </motion.div>

      <div className="space-y-3">
        {filtered.map((proposal) => {
          const st = statusConfig[proposal.status];
          const StatusIcon = st.icon;
          return (
            <motion.div key={proposal.id} variants={itemVariants} className="glass-card p-5 group">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText size={16} className="text-purple-400 shrink-0" />
                    <h3 className="text-sm font-semibold text-white truncate">{proposal.title}</h3>
                    <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full border flex items-center gap-1', st.color)}>
                      <StatusIcon size={10} /> {st.label}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                    <span className="flex items-center gap-1"><User size={12} /> {proposal.clientName}</span>
                    <span className="flex items-center gap-1"><DollarSign size={12} /> {formatCurrency(proposal.totalValue)}</span>
                    <span className="flex items-center gap-1"><Calendar size={12} /> {formatDate(proposal.createdAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0 flex-wrap justify-end">
                  <button onClick={() => setViewProposal(proposal)} className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-all min-w-[36px] min-h-[36px] flex items-center justify-center" title="Visualizar">
                    <Eye size={16} />
                  </button>
                  <button onClick={() => { setEditProposal(proposal); setShowForm(true); }} className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-all min-w-[36px] min-h-[36px] flex items-center justify-center" title="Editar">
                    <Edit3 size={16} />
                  </button>
                  <button onClick={() => exportPdf(proposal)} className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-all min-w-[36px] min-h-[36px] flex items-center justify-center" title="Exportar">
                    <FileDown size={16} />
                  </button>
                  {proposal.status === 'draft' || proposal.status === 'sent' ? (
                    <>
                      <button onClick={() => updateProposal(proposal.id, { status: 'accepted' })} className="p-2 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-all min-w-[36px] min-h-[36px] flex items-center justify-center" title="Aceitar">
                        <CheckCircle size={16} />
                      </button>
                      <button onClick={() => updateProposal(proposal.id, { status: 'rejected' })} className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-all min-w-[36px] min-h-[36px] flex items-center justify-center" title="Recusar">
                        <XCircle size={16} />
                      </button>
                    </>
                  ) : null}
                  <button onClick={() => deleteProposal(proposal.id)} className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all min-w-[36px] min-h-[36px] flex items-center justify-center" title="Excluir">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {showForm && <ProposalForm proposal={editProposal} onClose={() => { setShowForm(false); setEditProposal(null); }} onSave={handleSave} />}
        {viewProposal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 overflow-y-auto" onClick={() => setViewProposal(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl">
              <ProposalContent proposal={viewProposal} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
