import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings, Sun, Moon, Monitor, Globe, Bell, BellOff,
  FileDown, Monitor as MonitorIcon, FileText, Key,
  Component, BookOpen, MessageSquare, AlertTriangle,
  Check, ChevronRight, ExternalLink, Download,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useAppStore } from '@/store/appStore';
import { useNavigate } from 'react-router-dom';
import { PLATFORMS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { Theme } from '@/types';
import { authAPI } from '@/services/api';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  connected: boolean;
}

const integrations: Integration[] = [
  { id: 'github', name: 'GitHub', description: 'Importe repositorios e sincronize projetos', icon: Globe, color: '#6e5494', connected: false },
  { id: 'figma', name: 'Figma', description: 'Importe designs e componentes Figma', icon: Component, color: '#F24E1E', connected: false },
  { id: 'notion', name: 'Notion', description: 'Sincronize briefings com Notion', icon: BookOpen, color: '#FFFFFF', connected: false },
  { id: 'slack', name: 'Slack', description: 'Notificacoes no Slack', icon: MessageSquare, color: '#4A154B', connected: false },
];

export default function SettingsPage() {
  const { user, logout, token } = useAuthStore();
  const { theme, setTheme } = useAppStore();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [defaultFormat, setDefaultFormat] = useState('md');
  const [defaultPlatform, setDefaultPlatform] = useState('lovable');
  const [defaultTemplate, setDefaultTemplate] = useState('completo');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);

  const themeOptions: { value: Theme; label: string; icon: React.ElementType }[] = [
    { value: 'dark', label: 'Escuro', icon: Moon },
    { value: 'light', label: 'Claro', icon: Sun },
    { value: 'auto', label: 'Automatico', icon: Monitor },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 max-w-3xl mx-auto">
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-white">Configuracoes</h1>
        <p className="text-zinc-400 mt-1">Personalize sua experiencia na plataforma</p>
      </motion.div>

      <motion.div variants={itemVariants} className="glass-card p-6">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Monitor size={16} className="text-purple-400" />
          Aparencia
        </h3>
        <div className="flex gap-3 mb-4">
          {themeOptions.map((opt) => {
            const Icon = opt.icon;
            const isActive = theme === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all',
                  isActive ? 'bg-purple-500/15 text-purple-400 border border-purple-500/20' : 'glass-card text-zinc-400 hover:text-white'
                )}
              >
                <Icon size={16} />
                {opt.label}
              </button>
            );
          })}
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="glass-card p-6">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          {notifications ? <Bell size={16} className="text-purple-400" /> : <BellOff size={16} className="text-zinc-500" />}
          Notificacoes
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
            <div>
              <p className="text-sm text-white">Notificacoes Push</p>
              <p className="text-xs text-zinc-500">Receber notificacoes no navegador</p>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={cn(
                'w-10 h-6 rounded-full transition-all relative',
                notifications ? 'bg-purple-500' : 'bg-zinc-700'
              )}
            >
              <div className={cn(
                'w-4 h-4 rounded-full bg-white absolute top-1 transition-all',
                notifications ? 'left-5' : 'left-1'
              )} />
            </button>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
            <div>
              <p className="text-sm text-white">Notificacoes por Email</p>
              <p className="text-xs text-zinc-500">Receber atualizacoes por email</p>
            </div>
            <button
              onClick={() => setEmailNotifications(!emailNotifications)}
              className={cn(
                'w-10 h-6 rounded-full transition-all relative',
                emailNotifications ? 'bg-purple-500' : 'bg-zinc-700'
              )}
            >
              <div className={cn(
                'w-4 h-4 rounded-full bg-white absolute top-1 transition-all',
                emailNotifications ? 'left-5' : 'left-1'
              )} />
            </button>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="glass-card p-6">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <FileDown size={16} className="text-purple-400" />
          Preferencias de Exportacao
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Formato Padrao</label>
            <select value={defaultFormat} onChange={(e) => setDefaultFormat(e.target.value)} className="input-glass">
              <option value="txt">TXT</option>
              <option value="md">Markdown</option>
              <option value="pdf">PDF</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Plataforma Padrao</label>
            <select value={defaultPlatform} onChange={(e) => setDefaultPlatform(e.target.value)} className="input-glass">
              {PLATFORMS.map((p) => (<option key={p.id} value={p.id}>{p.label}</option>))}
            </select>
          </div>
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Template Padrao</label>
            <select value={defaultTemplate} onChange={(e) => setDefaultTemplate(e.target.value)} className="input-glass">
              <option value="completo">Completo</option>
              <option value="basico">Basico</option>
              <option value="avancado">Avancado</option>
            </select>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="glass-card p-6">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Key size={16} className="text-purple-400" />
          Chaves de API
        </h3>
        <p className="text-xs text-zinc-500 mb-4">Configure suas chaves de API para servicos externos (em breve)</p>
        <div className="space-y-2">
          {[
            { label: 'NVIDIA API Key', placeholder: 'nk-...', key: 'nv' },
            { label: 'OpenAI API Key', placeholder: 'sk-...', key: 'openai' },
            { label: 'Stripe API Key', placeholder: 'sk_live_...', key: 'stripe' },
          ].map((api) => (
            <div key={api.key} className="flex items-center gap-3">
              <span className="text-sm text-zinc-400 w-32 shrink-0">{api.label}</span>
              <input type="password" placeholder={api.placeholder} className="input-glass flex-1" disabled />
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="glass-card p-6">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Globe size={16} className="text-purple-400" />
          Integracoes
        </h3>
        <div className="space-y-2">
          {integrations.map((int) => {
            const Icon = int.icon;
            return (
              <div key={int.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/[0.07] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: int.color + '20' }}>
                    <Icon size={18} style={{ color: int.color }} />
                  </div>
                  <div>
                    <p className="text-sm text-white">{int.name}</p>
                    <p className="text-xs text-zinc-500">{int.description}</p>
                  </div>
                </div>
                <button className={cn(
                  'px-3 py-1.5 rounded-lg text-xs transition-all',
                  int.connected ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'btn-glass'
                )}>
                  {int.connected ? 'Conectado' : 'Conectar'}
                </button>
              </div>
            );
          })}
        </div>
      </motion.div>


    </motion.div>
  );
}
