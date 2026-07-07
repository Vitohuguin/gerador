import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';
import { Plus, X, FileSignature, Eye, Edit3, Trash2, Copy, Crown,
  FileDown, Printer, Search, Filter, Calendar, DollarSign,
  User, ChevronLeft, ChevronRight, Check, Building2,
  Download, FileText, ArrowLeft,
} from 'lucide-react';
import { useContractStore } from '@/store/contractStore';
import { useAuthStore } from '@/store/authStore';
import { CONTRACT_TYPES, CLAUSES, PAYMENT_METHODS, PLANS } from '@/lib/constants';
import { cn, formatCurrency, formatDate, generateId } from '@/lib/utils';
import { UpgradeBlock } from '@/components/UpgradeBlock';
import type { Contract, ContractType, ContractClause, PaymentMethod, ContractStatus } from '@/types';

const statusConfig: Record<ContractStatus, { label: string; color: string }> = {
  draft: { label: 'Rascunho', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  pending: { label: 'Pendente', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  signed: { label: 'Assinado', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  expired: { label: 'Expirado', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

interface ContractForm {
  type: ContractType;
  clientName: string;
  clientEmail: string;
  clientDocument: string;
  companyName: string;
  companyDocument: string;
  totalValue: number;
  paymentMethod: PaymentMethod;
  dueDate: string;
  clauses: ContractClause[];
  projectDescription: string;
  additionalTerms: string;
}

const initialForm: ContractForm = {
  type: 'site',
  clientName: '',
  clientEmail: '',
  clientDocument: '',
  companyName: '',
  companyDocument: '',
  totalValue: 0,
  paymentMethod: 'pix',
  dueDate: '',
  clauses: ['escopo', 'prazo', 'valor', 'pagamento', 'rescisao', 'foro'],
  projectDescription: '',
  additionalTerms: '',
};

const wizardSteps = [
  { title: 'Tipo', icon: FileSignature },
  { title: 'Contratante', icon: User },
  { title: 'Contratado', icon: Building2 },
  { title: 'Escopo', icon: FileText },
  { title: 'Cláusulas', icon: Check },
  { title: 'Valor', icon: DollarSign },
  { title: 'Prazo', icon: Calendar },
  { title: 'Revisão', icon: Eye },
];

function ContractWizard({ onClose }: { onClose: () => void }) {
  const { addContract } = useContractStore();
  const { user } = useAuthStore();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<ContractForm>(initialForm);

  const update = (data: Partial<ContractForm>) => setForm({ ...form, ...data });

const ORDINAIS = [
  'PRIMEIRA', 'SEGUNDA', 'TERCEIRA', 'QUARTA', 'QUINTA',
  'SEXTA', 'SÉTIMA', 'OITAVA', 'NONA', 'DÉCIMA',
  'DÉCIMA PRIMEIRA', 'DÉCIMA SEGUNDA',
];

const CLAUSE_MAP: Record<string, { titulo: string; texto: (f: ContractForm) => string }> = {
  escopo: { titulo: 'ESCOPO DO PROJETO', texto: (f) => f.projectDescription || 'Conforme descrito no escopo do projeto.' },
  prazo: { titulo: 'PRAZO', texto: (f) => `O prazo de entrega do projeto é de ${f.dueDate ? new Date(f.dueDate).toLocaleDateString('pt-BR') : 'a ser definido entre as partes'}.` },
  valor: { titulo: 'VALOR E CONDIÇÕES DE PAGAMENTO', texto: (f) => `O valor total do presente contrato é de ${formatCurrency(f.totalValue)}.` },
  pagamento: { titulo: 'FORMA DE PAGAMENTO', texto: (f) => `O pagamento será realizado via ${PAYMENT_METHODS.find((p) => p.id === f.paymentMethod)?.label || f.paymentMethod}, conforme cronograma acordado entre as partes.` },
  entrega: { titulo: 'ENTREGA E ACEITAÇÃO', texto: () => 'A entrega será considerada concluída mediante aceitação expressa do CONTRATANTE. Qualquer não conformidade deverá ser comunicada em até 5 dias úteis.' },
  revisao: { titulo: 'REVISÕES E ALTERAÇÕES', texto: () => 'Estão inclusas 3 (três) rodadas de revisão. Alterações adicionais poderão ser orçadas separadamente.' },
  confidencialidade: { titulo: 'CONFIDENCIALIDADE', texto: () => 'As partes se comprometem a manter sigilo absoluto sobre todas as informações, dados e materiais compartilhados durante a vigência deste contrato, não podendo divulgá-los a terceiros sem autorização prévia por escrito.' },
  propriedade: { titulo: 'DIREITOS AUTORAIS', texto: () => 'Após o pagamento integral do valor estipulado, todos os direitos autorais sobre o projeto serão transferidos ao CONTRATANTE, incluindo código-fonte, designs e demais entregáveis.' },
  garantia: { titulo: 'GARANTIA', texto: () => 'O CONTRATADO garante os serviços prestados pelo prazo de 90 (noventa) dias corridos após a entrega final, corrigindo sem custos eventuais defeitos ou bugs identificados.' },
  rescisao: { titulo: 'RESCISÃO', texto: () => 'Qualquer das partes poderá rescindir o presente contrato mediante notificação prévia por escrito com antecedência mínima de 15 (quinze) dias. Em caso de rescisão, o CONTRATANTE arcará com os serviços já executados e comprovados.' },
  foro: { titulo: 'FORO', texto: () => 'Fica eleito o foro da comarca do domicílio do CONTRATADO para dirimir quaisquer dúvidas ou controvérsias oriundas do presente contrato, com renúncia expressa a qualquer outro, por mais privilegiado que seja.' },
};

function getClausulaOrdinal(index: number): string {
  return ORDINAIS[index] || `${index + 1}ª`;
}

function generateContractContent(form: ContractForm): string {
  const typeLabel = CONTRACT_TYPES.find((t) => t.id === form.type)?.label || 'Serviços';

  const clauses = form.clauses
    .filter((id) => CLAUSE_MAP[id])
    .map((id, i) => ({
      ordinal: getClausulaOrdinal(i),
      ...CLAUSE_MAP[id],
      texto: CLAUSE_MAP[id].texto(form),
    }));

  return [
    `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE ${typeLabel.toUpperCase()}`,
    '',
    `Pelo presente instrumento particular, as partes a seguir qualificadas celebram o contrato de prestação de serviços de ${typeLabel.toLowerCase()}, que se regerá pelas cláusulas e condições seguintes:`,
    '',
    '1. DAS PARTES',
    '',
    `CONTRATANTE: ${form.clientName || '_________________________'}, inscrito(a) no CPF/CNPJ sob o nº ${form.clientDocument || '_________________________'}, doravante denominado simplesmente CONTRATANTE.`,
    '',
    `CONTRATADO: ${form.companyName || '_________________________'}, inscrito(a) no CPF/CNPJ sob o nº ${form.companyDocument || '_________________________'}, doravante denominado simplesmente CONTRATADO.`,
    '',
    ...clauses.flatMap((c) => [
      `${c.ordinal}. ${c.titulo}`,
      '',
      c.texto,
      '',
    ]),
    ...(form.additionalTerms ? [
      'DISPOSIÇÕES ADICIONAIS',
      '',
      form.additionalTerms,
      '',
    ] : []),
    'DO LOCAL E DATA',
    '',
    `Por estarem justos e contratados, firmam o presente instrumento em ${new Date().toLocaleDateString('pt-BR')}.`,
    '',
    '_________________________          _________________________',
    'CONTRATANTE                        CONTRATADO',
  ].join('\n');
}

  const handleGenerate = () => {
    addContract({
      title: `Contrato - ${form.clientName || 'Cliente'} - ${CONTRACT_TYPES.find((t) => t.id === form.type)?.label || 'Serviços'}`,
      content: generateContractContent(form),
      type: form.type,
      clauses: form.clauses,
      totalValue: form.totalValue,
      paymentMethod: form.paymentMethod,
      dueDate: form.dueDate,
      clientName: form.clientName,
      clientEmail: form.clientEmail,
      clientDocument: form.clientDocument,
      companyName: form.companyName,
      companyDocument: form.companyDocument,
      status: 'draft',
    });
    onClose();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="glass-card p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Novo Contrato</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white"><X size={20} /></button>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {wizardSteps.map((s, i) => {
            const Icon = s.icon;
            return (
              <button key={i} onClick={() => setStep(i)} className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] whitespace-nowrap transition-all',
                i === step ? 'bg-purple-500/15 text-purple-400 border border-purple-500/20' : 'text-zinc-600'
              )}>
                <Icon size={12} /> {s.title}
              </button>
            );
          })}
        </div>

        <div className="min-h-[300px]">
          {step === 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-white mb-3">Tipo de Contrato</h4>
              <div className="grid grid-cols-2 gap-2">
                {CONTRACT_TYPES.map((t) => {
                  const isSelected = form.type === t.id;
                  return (
                    <button key={t.id} onClick={() => update({ type: t.id, clauses: t.defaultClauses })} className={cn(
                      'glass-card p-3 text-left transition-all text-sm',
                      isSelected ? 'border-purple-500/50 bg-purple-500/10 ring-1 ring-purple-500/30' : 'hover:border-white/10'
                    )}>
                      <p className="font-medium text-white">{t.label}</p>
                      <p className="text-xs text-zinc-500">{t.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-white mb-3">Dados do Contratante (Cliente)</h4>
              <input type="text" placeholder="Nome do Cliente" value={form.clientName} onChange={(e) => update({ clientName: e.target.value })} className="input-glass" />
              <input type="email" placeholder="Email do Cliente" value={form.clientEmail} onChange={(e) => update({ clientEmail: e.target.value })} className="input-glass" />
              <input type="text" placeholder="CPF/CNPJ do Cliente" value={form.clientDocument} onChange={(e) => update({ clientDocument: e.target.value })} className="input-glass" />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-white mb-3">Dados do Contratado (Você)</h4>
              <input type="text" placeholder="Nome da Empresa" value={form.companyName} onChange={(e) => update({ companyName: e.target.value })} className="input-glass" />
              <input type="text" placeholder="CPF/CNPJ da Empresa" value={form.companyDocument} onChange={(e) => update({ companyDocument: e.target.value })} className="input-glass" />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-white mb-3">Escopo do Projeto</h4>
              <textarea rows={5} placeholder="Descreva detalhadamente o escopo do projeto..." value={form.projectDescription} onChange={(e) => update({ projectDescription: e.target.value })} className="input-glass resize-none" />
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-white mb-3">Cláusulas do Contrato</h4>
              <div className="grid grid-cols-2 gap-2">
                {CLAUSES.map((c) => {
                  const isSelected = form.clauses.includes(c.id);
                  return (
                    <button key={c.id} onClick={() => update({
                      clauses: isSelected ? form.clauses.filter((cl) => cl !== c.id) : [...form.clauses, c.id],
                    })} className={cn(
                      'glass-card p-3 text-left transition-all text-sm',
                      isSelected ? 'border-purple-500/50 bg-purple-500/10 ring-1 ring-purple-500/30' : 'hover:border-white/10'
                    )}>
                      <div className="flex items-center gap-2">
                        {isSelected && <Check size={14} className="text-purple-400" />}
                        <p className="font-medium text-white">{c.label}</p>
                      </div>
                      <p className="text-xs text-zinc-500">{c.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-white mb-3">Valor do Contrato</h4>
              <input type="number" placeholder="Valor total" value={form.totalValue || ''} onChange={(e) => update({ totalValue: Number(e.target.value) })} className="input-glass" />
              <h4 className="text-sm font-medium text-white mt-4">Forma de Pagamento</h4>
              <div className="grid grid-cols-2 gap-2">
                {PAYMENT_METHODS.map((pm) => {
                  const isSelected = form.paymentMethod === pm.id;
                  return (
                    <button key={pm.id} onClick={() => update({ paymentMethod: pm.id })} className={cn(
                      'glass-card p-3 text-left transition-all text-sm',
                      isSelected ? 'border-purple-500/50 bg-purple-500/10 ring-1 ring-purple-500/30' : 'hover:border-white/10'
                    )}>
                      <p className="font-medium text-white">{pm.label}</p>
                      <p className="text-xs text-zinc-500">{pm.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-white mb-3">Prazo de Entrega</h4>
              <input type="date" value={form.dueDate} onChange={(e) => update({ dueDate: e.target.value })} className="input-glass" />
              <textarea rows={3} placeholder="Termos adicionais (opcional)" value={form.additionalTerms} onChange={(e) => update({ additionalTerms: e.target.value })} className="input-glass resize-none" />
            </div>
          )}

          {step === 7 && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-white mb-3">Revisão Final</h4>
              <div className="glass-card p-4 space-y-2 text-sm">
                <p><span className="text-zinc-500">Tipo:</span> <span className="text-white">{CONTRACT_TYPES.find((t) => t.id === form.type)?.label}</span></p>
                <p><span className="text-zinc-500">Cliente:</span> <span className="text-white">{form.clientName}</span></p>
                <p><span className="text-zinc-500">Empresa:</span> <span className="text-white">{form.companyName}</span></p>
                <p><span className="text-zinc-500">Valor:</span> <span className="text-white">{formatCurrency(form.totalValue)}</span></p>
                <p><span className="text-zinc-500">Pagamento:</span> <span className="text-white">{PAYMENT_METHODS.find((p) => p.id === form.paymentMethod)?.label}</span></p>
                <p><span className="text-zinc-500">Prazo:</span> <span className="text-white">{form.dueDate ? formatDate(form.dueDate) : 'A definir'}</span></p>
                <p><span className="text-zinc-500">Cláusulas:</span> <span className="text-white">{form.clauses.length} selecionadas</span></p>
              </div>
              <button onClick={handleGenerate} className="btn-primary w-full">Gerar Contrato</button>
            </div>
          )}
        </div>

        <div className="flex justify-between mt-6">
          <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className={cn('btn-glass flex items-center gap-2', step === 0 && 'opacity-30 cursor-not-allowed')}>
            <ChevronLeft size={16} /> Anterior
          </button>
          {step < 7 ? (
            <button onClick={() => setStep(Math.min(7, step + 1))} className="btn-primary flex items-center gap-2">
              Próximo <ChevronRight size={16} />
            </button>
          ) : null}
        </div>
      </motion.div>
    </motion.div>
  );
}

function generateContractPdf(contract: Contract): jsPDF {
  const pdf = new jsPDF({ format: 'a4', unit: 'mm' });
  const margin = 28;
  const pw = 210;
  const w = pw - margin * 2;
  let y = margin;
  const lh = 5.2;

  const addPage = () => { pdf.addPage(); y = margin; };

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(20);
  pdf.text(contract.title, pw / 2, y, { align: 'center' });
  y += 12;

  pdf.setDrawColor(180);
  pdf.setLineWidth(0.5);
  pdf.line(margin, y, pw - margin, y);
  y += 10;

  const body = contract.content;
  const lines = body.split('\n');
  pdf.setFont('times', 'normal');
  const bodySize = 11;
  pdf.setFontSize(bodySize);

  for (let li = 0; li < lines.length; li++) {
    const line = lines[li];
    const next = lines[li + 1] || '';
    const isClausula = /^\d+[ª\s]/.test(line) && line.includes(' — ');
    const isClausulaTitle = /^CLÁUSULA/.test(line) && line.includes(' — ');
    const isTitle = /^(CONTRATO|DISPOSIÇÕES)/.test(line);
    const isPartes = /^\d+\.\s+DAS PARTES/.test(line);
    const isParteLine = /^(CONTRATANTE|CONTRATADO):/.test(line);
    const isSignLine = /^_{2,}/.test(line);
    const isSignLabel = /^(CONTRATANTE\s+CONTRATADO)$/.test(line);
    const isDateSection = /^DO LOCAL E DATA/.test(line);
    const isEmpty = line.trim() === '';
    const isPreamble = /^Pelo presente/.test(line);

    if (y > 268) addPage();

    if (isTitle) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      y += 2;
      pdf.text(line, margin, y);
      y += 7;
      pdf.setFont('times', 'normal');
      pdf.setFontSize(bodySize);
    } else if (isPartes) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      y += 1;
      pdf.text(line, margin, y);
      y += 6;
      pdf.setFont('times', 'normal');
      pdf.setFontSize(bodySize);
    } else if (isParteLine) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(bodySize);
      const [label, ...rest] = line.split(': ');
      const restText = rest.join(': ');
      const labelW = pdf.getTextWidth(`${label}: `);
      pdf.text(`${label}: `, margin, y);
      pdf.setFont('times', 'normal');
      const split = pdf.splitTextToSize(restText, w - labelW);
      pdf.text(split, margin + labelW, y);
      y += Math.max(split.length, 1) * lh + 1;
    } else if (isClausula || isClausulaTitle) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(bodySize);
      y += 1;
      pdf.text(line, margin, y);
      y += lh;
      pdf.setFont('times', 'normal');
    } else if (isDateSection) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      y += 2;
      pdf.text(line, margin, y);
      y += 6;
      pdf.setFont('times', 'normal');
      pdf.setFontSize(bodySize);
    } else if (isPreamble) {
      const split = pdf.splitTextToSize(line, w);
      pdf.text(split, margin, y);
      y += split.length * lh + 1;
    } else if (isSignLine) {
      y += 4;
      const mid = pw / 2;
      pdf.setFont('courier', 'normal');
      pdf.setFontSize(11);
      pdf.text('_________________________', margin, y);
      pdf.text('_________________________', mid + 4, y);
      y += lh + 1;
      pdf.setFont('times', 'normal');
      pdf.setFontSize(bodySize);
    } else if (isSignLabel) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      const mid = pw / 2;
      pdf.text('CONTRATANTE', margin, y);
      pdf.text('CONTRATADO', mid + 4, y);
      y += lh + 1;
      pdf.setFont('times', 'normal');
      pdf.setFontSize(bodySize);
    } else if (isEmpty) {
      if (next && /^CONTRATANTE:|^CONTRATADO:|^_{2,}/.test(next)) {
        y += 2;
      } else {
        y += 3;
      }
    } else {
      const split = pdf.splitTextToSize(line, w);
      if (y + split.length * lh > 270) addPage();
      pdf.text(split, margin, y);
      y += split.length * lh + 1;
    }
  }

  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(150);
    pdf.text(`Página ${i} de ${pageCount}`, pw / 2, 292, { align: 'center' });
  }

  return pdf;
}

function ContractDetail({ contract, onClose }: { contract: Contract; onClose: () => void }) {
  const { user } = useAuthStore();
  const isPro = user?.plan === 'pro';
  const exportPdf = () => {
    const pdf = generateContractPdf(contract);
    pdf.save(`${contract.title.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 0 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="glass-card p-6 max-w-3xl w-full max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">{contract.title}</h3>
          <div className="flex items-center gap-2">
            {isPro ? (
              <button onClick={exportPdf} className="btn-glass p-2"><FileDown size={16} /></button>
            ) : (
              <button onClick={() => window.location.href = '/dashboard/plans'} className="btn-glass p-2 text-amber-400 border-amber-500/30"><Crown size={16} /></button>
            )}
            <button onClick={onClose} className="text-zinc-500 hover:text-white"><X size={20} /></button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={cn('text-[10px] px-2 py-0.5 rounded-full border', statusConfig[contract.status].color)}>{statusConfig[contract.status].label}</span>
          <span className="text-xs bg-white/5 text-zinc-400 px-2 py-0.5 rounded-full">{formatCurrency(contract.totalValue)}</span>
          <span className="text-xs bg-white/5 text-zinc-400 px-2 py-0.5 rounded-full">{`v${contract.version}`}</span>
        </div>
        <pre className="text-sm text-zinc-300 whitespace-pre-wrap font-mono leading-relaxed bg-black/30 rounded-xl p-4 max-h-[400px] overflow-y-auto">{contract.content}</pre>
      </motion.div>
    </motion.div>
  );
}

export default function ContractsPage() {
  const { contracts, deleteContract, duplicateContract } = useContractStore();
  const { user } = useAuthStore();
  const [showWizard, setShowWizard] = useState(false);
  const [viewContract, setViewContract] = useState<Contract | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = useMemo(() => {
    let result = [...contracts];
    if (search) {
      const s = search.toLowerCase();
      result = result.filter((c) => c.title.toLowerCase().includes(s) || c.clientName.toLowerCase().includes(s));
    }
    if (statusFilter !== 'all') result = result.filter((c) => c.status === statusFilter);
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [contracts, search, statusFilter]);

  const exportContract = (contract: Contract, format: 'txt' | 'pdf') => {
    if (format === 'pdf') {
      const pdf = generateContractPdf(contract);
      pdf.save(`${contract.title.replace(/\s+/g, '_')}.pdf`);
      return;
    }
    const blob = new Blob([contract.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `${contract.title.replace(/\s+/g, '_')}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const printContract = (contract: Contract) => {
    const w = window.open('', '_blank');
    if (w) {
      w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><style>
        @page { margin: 25mm; size: auto; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Georgia, 'Times New Roman', Times, serif; font-size: 11pt; line-height: 1.6; color: #1a1a1a; padding: 0; }
        h1 { font-family: Arial, Helvetica, sans-serif; font-size: 20pt; text-align: center; margin-bottom: 10pt; font-weight: 700; }
        hr { border: none; border-top: 0.5pt solid #999; margin: 8pt 0 14pt 0; }
        .partes { margin: 10pt 0; }
        .partes p { margin-bottom: 6pt; }
        .clausula { font-family: Arial, Helvetica, sans-serif; font-weight: 700; font-size: 11pt; margin-top: 12pt; margin-bottom: 4pt; }
        p { text-align: justify; margin-bottom: 6pt; }
        .sign { margin-top: 24pt; }
        .sign table { width: 100%; border-collapse: collapse; }
        .sign td { width: 50%; text-align: center; font-family: 'Courier New', Courier, monospace; font-size: 11pt; padding-top: 16pt; }
        .sign td span { font-family: Arial, Helvetica, sans-serif; font-size: 9pt; display: block; margin-top: 4pt; font-weight: 700; }
        .footer { text-align: center; font-size: 8pt; color: #999; margin-top: 30pt; }
      </style></head><body>
        <h1>${contract.title}</h1>
        <hr />
        <div id="content">${contract.content.split('\n').map((l) => {
          if (/^\d+[ª\s]/.test(l) && l.includes(' — ')) return `<p class="clausula">${l}</p>`;
          if (/^(CONTRATO|DISPOSIÇÕES)/.test(l)) return `<h1 style="font-size:14pt;margin-top:14pt">${l}</h1>`;
          if (/^\d+\.\s+DAS PARTES/.test(l)) return `<p style="font-family:Arial,sans-serif;font-weight:700;font-size:12pt;margin-top:10pt">${l}</p>`;
          if (/^(CONTRATANTE|CONTRATADO):/.test(l)) {
            const [label, ...rest] = l.split(': ');
            return `<p><strong>${label}:</strong> ${rest.join(': ')}</p>`;
          }
          if (/^_{2,}/.test(l)) return '';
          if (/^(CONTRATANTE\s+CONTRATADO)$/.test(l)) {
            return `<div class="sign"><table><tr><td>_________________________<span>CONTRATANTE</span></td><td>_________________________<span>CONTRATADO</span></td></tr></table></div>`;
          }
          if (/^DO LOCAL/.test(l)) return `<p style="font-family:Arial,sans-serif;font-weight:700;font-size:12pt;margin-top:14pt">${l}</p>`;
          if (l.trim() === '') return '<br />';
          return `<p>${l}</p>`;
        }).join('')}</div>
        <p class="footer">Documento gerado por PromptForge AI</p>
      </body></html>`);
      w.document.close();
      w.print();
    }
  };

  if (contracts.length === 0 && !showWizard) {
    if (user?.plan === 'none') {
      return <UpgradeBlock message="Assine um plano para criar contratos profissionais." />;
    }
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <FileSignature size={48} className="text-zinc-600 mb-4" />
        <h3 className="text-lg font-bold text-white mb-2">Nenhum Contrato Ainda</h3>
        <p className="text-zinc-500 text-sm mb-6">Gere contratos profissionais para seus projetos</p>
        <button onClick={() => setShowWizard(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Novo Contrato
        </button>
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Contratos</h1>
          <p className="text-sm text-zinc-400">{filtered.length} contratos</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input type="text" placeholder="Buscar contratos..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-glass pl-9 w-40" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-glass w-28">
            <option value="all">Todos</option>
            <option value="draft">Rascunho</option>
            <option value="pending">Pendente</option>
            <option value="signed">Assinado</option>
          </select>
          {user?.plan === 'none' ? (
            <UpgradeBlock message="Assine um plano para criar contratos profissionais." />
          ) : (
          <button onClick={() => setShowWizard(true)} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Novo
          </button>
          )}
        </div>
      </motion.div>

      <div className="space-y-3">
        {filtered.map((contract) => {
          const st = statusConfig[contract.status];
          return (
            <motion.div key={contract.id} variants={itemVariants} className="glass-card p-5 group">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <FileSignature size={16} className="text-purple-400 shrink-0" />
                    <h3 className="text-sm font-semibold text-white truncate">{contract.title}</h3>
                    <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full border', st.color)}>{st.label}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                    <span className="flex items-center gap-1"><User size={12} /> {contract.clientName}</span>
                    <span className="flex items-center gap-1"><DollarSign size={12} /> {formatCurrency(contract.totalValue)}</span>
                    <span className="flex items-center gap-1"><Calendar size={12} /> {formatDate(contract.createdAt)}</span>
                    <span className="flex items-center gap-1"><FileText size={12} /> v{contract.version}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => setViewContract(contract)} className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-all" title="Visualizar">
                    <Eye size={16} />
                  </button>
                  <button onClick={() => { duplicateContract(contract.id); }} className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-all" title="Duplicar">
                    <Copy size={16} />
                  </button>
                  <button onClick={() => exportContract(contract, 'txt')} className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-all" title="Exportar TXT">
                    <FileDown size={16} />
                  </button>
                  <button onClick={() => printContract(contract)} className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-all" title="Imprimir">
                    <Printer size={16} />
                  </button>
                  <button onClick={() => deleteContract(contract.id)} className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Excluir">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {showWizard && <ContractWizard onClose={() => setShowWizard(false)} />}
        {viewContract && <ContractDetail contract={viewContract} onClose={() => setViewContract(null)} />}
      </AnimatePresence>
    </motion.div>
  );
}
