import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useBudgetStore, type Budget, type BudgetItem } from '@/store/budgetStore';
import { UpgradeBlock } from '@/components/UpgradeBlock';
import {
  Plus, X, DollarSign, FileDown, Trash2, Search,
  Crown,
} from 'lucide-react';
import { cn, formatCurrency, formatDate, generateId } from '@/lib/utils';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function BudgetsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isPro = user?.plan === 'pro';
  const { budgets, addBudget, deleteBudget } = useBudgetStore();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) return budgets;
    const s = search.toLowerCase();
    return budgets.filter((b) => b.clientName.toLowerCase().includes(s));
  }, [budgets, search]);

  if (user?.plan === 'none') {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <DollarSign size={48} className="text-zinc-600 mb-4" />
        <h3 className="text-lg font-bold text-white mb-2">Orçamentos</h3>
        <p className="text-zinc-500 text-sm mb-6">Disponível apenas para assinantes</p>
        <UpgradeBlock message="Assine um plano para criar orçamentos profissionais." />
      </div>
    );
  }

  if (budgets.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Orçamentos</h1>
            <p className="text-sm text-zinc-400">Crie orçamentos profissionais</p>
          </div>
        </div>
        {isPro ? (
          <BudgetGenerator onSave={(budget) => addBudget(budget)} />
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <Crown size={32} className="text-amber-400/50 mb-3" />
            <p className="text-zinc-400 text-sm mb-4">Orçamentos profissionais são exclusivos do plano Pro</p>
            <button onClick={() => navigate('/dashboard/plans')} className="btn-primary flex items-center gap-2">
              <Crown size={16} /> Fazer Upgrade
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Orçamentos</h1>
          <p className="text-sm text-zinc-400">{budgets.length} orçamentos</p>
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input type="text" placeholder="Buscar orçamentos..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-glass pl-9 w-48" />
        </div>
      </motion.div>

      {budgets.map((budget) => (
        <motion.div key={budget.id} variants={itemVariants} className="glass-card p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">{budget.clientName}</h3>
              <p className="text-sm text-zinc-500">{budget.clientEmail}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => {
                const content = budget.items.map((i) => `${i.description} | Qtd: ${i.quantity} | R$ ${i.unitPrice.toFixed(2)} | R$ ${i.total.toFixed(2)}`).join('\n');
                const blob = new Blob([`ORÇAMENTO\nCliente: ${budget.clientName}\n\nItens:\n${content}\n\nSubtotal: ${formatCurrency(budget.subtotal)}\nDesconto: ${budget.discountType === 'percent' ? budget.discount + '%' : formatCurrency(budget.discount)}\nImposto: ${budget.taxType === 'percent' ? budget.tax + '%' : formatCurrency(budget.tax)}\nTotal: ${formatCurrency(budget.total)}`], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = window.document.createElement('a');
                a.href = url;
                a.download = `orcamento_${budget.clientName.replace(/\s+/g, '_')}.txt`;
                a.click();
                URL.revokeObjectURL(url);
              }} className="btn-glass p-2"><FileDown size={16} /></button>
              <button onClick={() => { if (window.confirm('Tem certeza que deseja excluir este orçamento?')) deleteBudget(budget.id); }} className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all"><Trash2 size={16} /></button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-zinc-500 border-b border-white/5">
                  <th className="text-left py-2">Descrição</th>
                  <th className="text-right py-2">Qtd</th>
                  <th className="text-right py-2">Preço Unit.</th>
                  <th className="text-right py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {budget.items.map((item) => (
                  <tr key={item.id} className="border-b border-white/5">
                    <td className="py-2 text-white">{item.description}</td>
                    <td className="py-2 text-right text-zinc-300">{item.quantity}</td>
                    <td className="py-2 text-right text-zinc-300">{formatCurrency(item.unitPrice)}</td>
                    <td className="py-2 text-right text-white">{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end mt-4 space-y-1 text-sm">
            <div className="w-56 space-y-1">
              <div className="flex justify-between text-zinc-500">
                <span>Subtotal</span>
                <span>{formatCurrency(budget.subtotal)}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Desconto ({budget.discountType === 'percent' ? `${budget.discount}%` : formatCurrency(budget.discount)})</span>
                <span>-{budget.discountType === 'percent' ? formatCurrency(budget.subtotal * budget.discount / 100) : formatCurrency(budget.discount)}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Imposto ({budget.taxType === 'percent' ? `${budget.tax}%` : formatCurrency(budget.tax)})</span>
                <span>+{budget.taxType === 'percent' ? formatCurrency(Math.max(0, budget.subtotal - (budget.discountType === 'percent' ? budget.subtotal * budget.discount / 100 : budget.discount)) * budget.tax / 100) : formatCurrency(budget.tax)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-white border-t border-white/5 pt-1">
                <span>Total</span>
                <span className="gradient-text">{formatCurrency(budget.total)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-4 text-xs text-zinc-500">
            <span>Validade: {budget.validityDays} dias</span>
            <span>Criado em: {formatDate(budget.createdAt)}</span>
          </div>
        </motion.div>
      ))}

      <BudgetGenerator onSave={(budget) => addBudget(budget)} />
    </motion.div>
  );
}

function BudgetGenerator({ onSave }: { onSave: (budget: Omit<Budget, 'id' | 'createdAt'>) => void }) {
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [items, setItems] = useState<BudgetItem[]>([
    { id: '1', description: '', quantity: 1, unitPrice: 0, total: 0 },
  ]);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent');
  const [tax, setTax] = useState(0);
  const [taxType, setTaxType] = useState<'percent' | 'fixed'>('percent');
  const [notes, setNotes] = useState('');
  const [validityDays, setValidityDays] = useState(30);

  const updateItem = (id: string, field: keyof BudgetItem, value: string | number) => {
    setItems((prev) => prev.map((item) => {
      if (item.id !== id) return item;
      const updated = { ...item, [field]: value };
      updated.total = updated.quantity * updated.unitPrice;
      return updated;
    }));
  };

  const addItem = () => {
    setItems((prev) => [...prev, { id: generateId(), description: '', quantity: 1, unitPrice: 0, total: 0 }]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const subtotal = items.reduce((acc, item) => acc + item.total, 0);
  const discountValue = discountType === 'percent' ? subtotal * discount / 100 : discount;
  const afterDiscount = Math.max(0, subtotal - discountValue);
  const taxValue = taxType === 'percent' ? afterDiscount * tax / 100 : tax;
  const total = afterDiscount + taxValue;

  const handleSave = () => {
    onSave({
      clientName,
      clientEmail,
      items: items.filter((i) => i.description),
      subtotal,
      discount,
      discountType,
      tax,
      taxType,
      total,
      notes,
      validityDays,
    });
    setClientName('');
    setClientEmail('');
    setItems([{ id: '1', description: '', quantity: 1, unitPrice: 0, total: 0 }]);
    setDiscount(0);
    setTax(0);
    setNotes('');
  };

  return (
    <motion.div variants={itemVariants} className="glass-card p-6">
      <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <DollarSign size={20} className="text-purple-400" />
        Gerar Orçamento
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <input type="text" placeholder="Nome do Cliente" value={clientName} onChange={(e) => setClientName(e.target.value)} className="input-glass" />
        <input type="email" placeholder="Email do Cliente" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} className="input-glass" />
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-zinc-300">Itens do Orçamento</h3>
          <button onClick={addItem} className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors">
            <Plus size={14} /> Adicionar Item
          </button>
        </div>
        {items.map((item, index) => (
          <div key={item.id} className="flex items-center gap-2">
            <span className="text-xs text-zinc-600 w-5">{index + 1}.</span>
            <input
              type="text"
              placeholder="Descrição do item"
              value={item.description}
              onChange={(e) => updateItem(item.id, 'description', e.target.value)}
              className="input-glass flex-1"
            />
            <input
              type="number"
              placeholder="Qtd"
              value={item.quantity || ''}
              onChange={(e) => updateItem(item.id, 'quantity', Math.max(1, Number(e.target.value)))}
              className="input-glass w-16 text-center"
            />
            <input
              type="number"
              placeholder="Preço"
              value={item.unitPrice || ''}
              onChange={(e) => updateItem(item.id, 'unitPrice', Number(e.target.value))}
              className="input-glass w-24 text-right"
            />
            <span className="text-sm text-white w-24 text-right">{formatCurrency(item.total)}</span>
            {items.length > 1 && (
              <button onClick={() => removeItem(item.id)} className="p-1 text-zinc-500 hover:text-red-400 transition-colors">
                <X size={14} />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="text-xs text-zinc-500 mb-1 block">Desconto</label>
          <div className="flex gap-2">
            <input type="number" value={discount || ''} onChange={(e) => setDiscount(Number(e.target.value))} className="input-glass flex-1" placeholder="0" />
            <select value={discountType} onChange={(e) => setDiscountType(e.target.value as any)} className="input-glass w-20">
              <option value="percent">%</option>
              <option value="fixed">R$</option>
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs text-zinc-500 mb-1 block">Imposto</label>
          <div className="flex gap-2">
            <input type="number" value={tax || ''} onChange={(e) => setTax(Number(e.target.value))} className="input-glass flex-1" placeholder="0" />
            <select value={taxType} onChange={(e) => setTaxType(e.target.value as any)} className="input-glass w-20">
              <option value="percent">%</option>
              <option value="fixed">R$</option>
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs text-zinc-500 mb-1 block">Validade (dias)</label>
          <input type="number" value={validityDays} onChange={(e) => setValidityDays(Number(e.target.value))} className="input-glass" />
        </div>
      </div>

      <textarea rows={2} placeholder="Observações (opcional)" value={notes} onChange={(e) => setNotes(e.target.value)} className="input-glass mb-6 resize-none" />

      <div className="flex items-center justify-between">
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-4 text-zinc-500">
            <span>Subtotal: <span className="text-white">{formatCurrency(subtotal)}</span></span>
            <span>Desconto: <span className="text-red-400">-{formatCurrency(discountValue)}</span></span>
            <span>Imposto: <span className="text-emerald-400">+{formatCurrency(taxValue)}</span></span>
          </div>
          <p className="text-lg font-bold gradient-text">Total: {formatCurrency(total)}</p>
        </div>
        <button onClick={handleSave} disabled={!clientName || !items.some((i) => i.description)} className={cn('btn-primary', (!clientName || !items.some((i) => i.description)) && 'opacity-30 cursor-not-allowed')}>
          Salvar Orçamento
        </button>
      </div>
    </motion.div>
  );
}
