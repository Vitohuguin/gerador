import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Crown, Rocket, Star, Building2, Check, X as XIcon, Eye,
  CreditCard, Calendar, DollarSign,
  Download, FileText, History, AlertTriangle, Loader2, ExternalLink,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { PLANS } from '@/lib/constants';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import { plansAPI } from '@/services/api';

const planIcons: Record<string, React.ElementType> = {
  Rocket, Star, Building2, Eye,
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function PlansPage() {
  const { user, logout } = useAuthStore();
  const currentPlan = user?.plan || 'none';
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [subscription, setSubscription] = useState<any | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    plansAPI.subscription()
      .then((res) => {
        setPaymentHistory(res.history || []);
        setSubscription(res.subscription);
      })
      .catch(() => {});
  }, []);

  async function handleUpgrade(planId: string) {
    setLoading(planId);
    setError(null);
    try {
      const res = await plansAPI.checkout(planId);
      if (res.checkoutUrl) {
        window.open(res.checkoutUrl, '_blank');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  }

  async function handleCancel() {
    if (!confirm('Tem certeza que deseja cancelar sua assinatura?')) return;
    setCancelLoading(true);
    try {
      await plansAPI.cancel();
      setSubscription(null);
      useAuthStore.setState({ user: { ...user!, plan: 'none' } });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCancelLoading(false);
    }
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-white">Planos e Assinatura</h1>
        <p className="text-zinc-400 mt-1">Escolha o plano ideal ou gerencie sua assinatura atual</p>
      </motion.div>

      {error && (
        <motion.div variants={itemVariants} className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLANS.map((plan) => {
          const Icon = planIcons[plan.icon] || Crown;
          const isCurrent = currentPlan === plan.id;
          const isLoading = loading === plan.id;
          return (
            <div
              key={plan.id}
              className={cn(
                'glass-card p-6 relative transition-all',
                isCurrent ? 'border-purple-500/50 glow' : '',
                plan.highlighted ? 'ring-1 ring-purple-500/30' : ''
              )}
            >
              {isCurrent && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-bold px-3 py-1 rounded-full">
                  Seu Plano
                </div>
              )}
              {plan.highlighted && !isCurrent && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-[10px] font-bold px-3 py-1 rounded-full">
                  Popular
                </div>
              )}
              <div className="text-center mb-4">
                <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3', isCurrent ? 'bg-purple-500/20' : 'bg-white/5')}>
                  <Icon size={24} className={isCurrent ? 'text-purple-400' : 'text-zinc-400'} />
                </div>
                <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-white">{formatCurrency(plan.price)}</span>
                  <span className="text-zinc-500 text-sm">/{plan.period === 'monthly' ? 'mês' : 'ano'}</span>
                </div>
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-zinc-400">
                    <Check size={12} className="text-emerald-400 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => {
                  if (!isCurrent) handleUpgrade(plan.id);
                }}
                disabled={isCurrent || isLoading}
                className={cn(
                  'w-full py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2',
                  isCurrent ? 'bg-purple-500/15 text-purple-400 border border-purple-500/20' :
                  currentPlan === 'starter' && plan.id === 'pro' ? 'btn-primary' :
                  'btn-glass',
                  isLoading ? 'opacity-70 cursor-not-allowed' : ''
                )}
              >
                {isLoading ? (
                  <><Loader2 size={14} className="animate-spin" /> Abrindo checkout...</>
                ) : isCurrent ? (
                  'Plano Atual'
                ) : (
                  <><ExternalLink size={14} /> {plan.price > 0 ? 'Assinar Agora' : 'Começar Grátis'}</>
                )}
              </button>
            </div>
          );
        })}
      </motion.div>

      <motion.div variants={itemVariants} className="glass-card p-6">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FileText size={18} className="text-purple-400" />
          Comparação de Recursos
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left py-3 text-zinc-400 font-medium">Recurso</th>
                {PLANS.map((plan) => (
                  <th key={plan.id} className={cn('text-center py-3 font-medium', currentPlan === plan.id ? 'text-purple-400' : 'text-zinc-400')}>
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'Prompts/mês', values: PLANS.map((p) => p.promptLimit === Infinity ? 'Ilimitado' : String(p.promptLimit)) },
                { label: 'Contratos/mês', values: PLANS.map((p) => p.contractLimit === Infinity ? 'Ilimitado' : String(p.contractLimit)) },
                { label: 'Projetos', values: PLANS.map((p) => p.projectLimit === Infinity ? 'Ilimitado' : String(p.projectLimit)) },
                { label: 'Membros da Equipe', values: PLANS.map((p) => String(p.teamMembers)) },
                { label: 'Analytics', values: PLANS.map((p) => p.analytics ? '✓' : '✗') },
                { label: 'Suporte Prioritário', values: PLANS.map((p) => p.prioritySupport ? '✓' : '✗') },
                { label: 'Exportação PDF', values: ['TXT/MD', 'PDF'] },
                { label: 'Upload de Arquivos', values: ['✗', '✓'] },
              ].map((row, i) => (
                <tr key={i} className="border-b border-white/5">
                  <td className="py-3 text-zinc-300">{row.label}</td>
                  {row.values.map((v, j) => (
                    <td key={j} className={cn('text-center py-3', v === '✓' ? 'text-emerald-400' : v === '✗' ? 'text-red-400' : 'text-zinc-400')}>
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="glass-card p-6">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <History size={18} className="text-purple-400" />
          Histórico de Pagamentos
        </h2>
        <div className="space-y-2">
          {paymentHistory.length === 0 ? (
            <p className="text-zinc-500 text-sm text-center py-4">Nenhum pagamento encontrado</p>
          ) : (
            paymentHistory.map((payment: any) => (
              <div key={payment.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <DollarSign size={14} className="text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm text-white">{formatCurrency(payment.value)}</p>
                    <p className="text-xs text-zinc-500">{payment.method || 'Cakto'} • {formatDate(payment.createdAt)}</p>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Pago
                </span>
              </div>
            ))
          )}
        </div>
      </motion.div>

      {currentPlan !== 'none' && subscription && (
        <motion.div variants={itemVariants} className="glass-card p-6 border-red-500/20">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-red-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Cancelar Assinatura</h3>
              <p className="text-xs text-zinc-500 mb-3">Ao cancelar, você perderá acesso a todos os recursos premium no final do período atual.</p>
              <button
                onClick={handleCancel}
                disabled={cancelLoading}
                className="px-4 py-2 rounded-xl border border-red-500/30 text-red-400 text-sm hover:bg-red-500/10 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {cancelLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                Cancelar Assinatura
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
