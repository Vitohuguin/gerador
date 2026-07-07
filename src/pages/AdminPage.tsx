import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Search, ChevronDown, Check, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

interface UserRecord {
  id: string;
  name: string;
  email: string;
  plan: string;
  company: string;
  phone: string;
  createdAt: string;
}

const PLANS = ['none', 'starter', 'pro'] as const;

export default function AdminPage() {
  const { user } = useAuthStore();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function init() {
      try {
        const res = await fetch('/api/admin/check', {
          headers: { Authorization: `Bearer ${useAuthStore.getState().token}` },
        });
        const data = await res.json();
        setIsAdmin(data.isAdmin);
        if (data.isAdmin) fetchUsers();
      } catch {
        setIsAdmin(false);
      }
    }
    init();
  }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    setFilteredUsers(
      users.filter(u =>
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term)
      )
    );
  }, [searchTerm, users]);

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${useAuthStore.getState().token}` },
      });
      if (!res.ok) throw new Error('Sem permissão');
      const data = await res.json();
      setUsers(data.users);
    } catch {
      setMessage({ type: 'error', text: 'Erro ao carregar usuários' });
    } finally {
      setLoading(false);
    }
  }

  async function updatePlan(userId: string, plan: string) {
    setUpdating(userId);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}/plan`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${useAuthStore.getState().token}`,
        },
        body: JSON.stringify({ plan }),
      });
      if (!res.ok) throw new Error('Erro ao atualizar');
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, plan } : u));
      const name = users.find(u => u.id === userId)?.name || 'Usuário';
      setMessage({ type: 'success', text: `${name} → ${plan}` });
    } catch {
      setMessage({ type: 'error', text: 'Erro ao atualizar plano' });
    } finally {
      setUpdating(null);
    }
  }

  if (isAdmin === null) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-zinc-500">Verificando acesso...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center glass p-8 rounded-2xl max-w-md">
          <Shield size={48} className="mx-auto text-zinc-500 mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Acesso Restrito</h2>
          <p className="text-zinc-400">Apenas o administrador pode acessar esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Painel Admin</h1>
          <p className="text-zinc-400 text-sm mt-1">{users.length} usuário(s) cadastrado(s)</p>
        </div>
        <div className="relative w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar por nome ou email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="input-glass pl-9 pr-4 py-2 text-sm w-full"
          />
        </div>
      </div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'flex items-center gap-2 px-4 py-3 rounded-xl mb-4 text-sm',
            message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
          )}
        >
          {message.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          {message.text}
        </motion.div>
      )}

      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5 text-left text-xs text-zinc-500 uppercase tracking-wider">
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Empresa</th>
                <th className="px-4 py-3 font-medium">Cadastro</th>
                <th className="px-4 py-3 font-medium text-right">Plano</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-zinc-500">
                    Carregando...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-zinc-500">
                    Nenhum usuário encontrado
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u, i) => (
                  <motion.tr
                    key={u.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="text-white text-sm font-medium">{u.name}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-zinc-400 text-sm">{u.email}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-zinc-400 text-sm">{u.company || '-'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-zinc-500 text-sm">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('pt-BR') : '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="relative inline-flex">
                        <select
                          value={u.plan}
                          disabled={updating === u.id}
                          onChange={e => updatePlan(u.id, e.target.value)}
                          className={cn(
                            'appearance-none bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 pr-8 text-sm transition-all cursor-pointer',
                            u.plan === 'none' && 'text-zinc-500',
                            u.plan === 'starter' && 'text-yellow-400',
                            u.plan === 'pro' && 'text-purple-400',
                            updating === u.id && 'opacity-50 cursor-wait'
                          )}
                        >
                          {PLANS.map(p => (
                            <option key={p} value={p} className="bg-zinc-900 text-white">
                              {p === 'none' ? 'Free' : p === 'starter' ? 'Starter' : 'Pro'}
                            </option>
                          ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500" />
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
