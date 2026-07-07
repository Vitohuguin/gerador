import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  User, Mail, Building2, Phone, MapPin, Globe,
  Camera, Save, Key, Trash2, AlertTriangle, Crown,
  Sparkles, FileSignature, FolderKanban, ExternalLink,
  Eye, EyeOff, X, Check,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { usePromptStore } from '@/store/promptStore';
import { useContractStore } from '@/store/contractStore';
import { useProjectStore } from '@/store/projectStore';
import { cn } from '@/lib/utils';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function ProfilePage() {
  const { user, updateProfile, updateProfile: updateAuth } = useAuthStore();
  const { prompts } = usePromptStore();
  const { contracts } = useContractStore();
  const { projects } = useProjectStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [company, setCompany] = useState(user?.company || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [location, setLocation] = useState(user?.location || '');
  const [website, setWebsite] = useState(user?.website || '');
  const [saving, setSaving] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordChanged, setPasswordChanged] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');

  const handleSaveProfile = async () => {
    setSaving(true);
    await updateProfile({ name, email, company, phone, bio, location, website });
    setSaving(false);
  };

  const handleChangePassword = () => {
    setTimeout(() => {
      setPasswordChanged(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordChanged(false), 3000);
    }, 500);
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 max-w-3xl mx-auto">
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-white">Perfil</h1>
        <p className="text-zinc-400 mt-1">Gerencie suas informações pessoais</p>
      </motion.div>

      <motion.div variants={itemVariants} className="glass-card p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
          <div className="relative group">
            <img
              src={avatar || user?.avatar || `https://api.dicebear.com/9.x/avataaars-neutral/svg?seed=${user?.name || 'User'}&backgroundColor=c0aede`}
              alt="Avatar"
              className="w-20 h-20 rounded-2xl object-cover"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    const dataUrl = ev.target?.result as string;
                    setAvatar(dataUrl);
                    updateProfile({ avatar: dataUrl });
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <Camera size={20} className="text-white" />
            </button>
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-xl font-bold text-white">{user?.name}</h2>
            <p className="text-sm text-zinc-500">{user?.email}</p>
            <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 capitalize">
              {user?.plan}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Nome</label>
            <div className="relative">
              <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-glass pl-9" />
            </div>
          </div>
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Email</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-glass pl-9" />
            </div>
          </div>
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Empresa</label>
            <div className="relative">
              <Building2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} className="input-glass pl-9" />
            </div>
          </div>
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Telefone</label>
            <div className="relative">
              <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-glass pl-9" />
            </div>
          </div>
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Localização</label>
            <div className="relative">
              <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="input-glass pl-9" />
            </div>
          </div>
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Website</label>
            <div className="relative">
              <Globe size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input type="text" value={website} onChange={(e) => setWebsite(e.target.value)} className="input-glass pl-9" />
            </div>
          </div>
        </div>
        <div className="mb-6">
          <label className="text-xs text-zinc-500 mb-1 block">Bio</label>
          <textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} className="input-glass resize-none" placeholder="Conte um pouco sobre você..." />
        </div>
        <button onClick={handleSaveProfile} disabled={saving} className="btn-primary flex items-center gap-2">
          <Save size={16} /> {saving ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </motion.div>

      <motion.div variants={itemVariants} className="glass-card p-6">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Sparkles size={16} className="text-purple-400" />
          Suas Estatísticas
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-xl bg-white/5">
            <p className="text-2xl font-bold text-white">{prompts.length}</p>
            <p className="text-xs text-zinc-500">Prompts</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-white/5">
            <p className="text-2xl font-bold text-white">{contracts.length}</p>
            <p className="text-xs text-zinc-500">Contratos</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-white/5">
            <p className="text-2xl font-bold text-white">{projects.length}</p>
            <p className="text-xs text-zinc-500">Projetos</p>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="glass-card p-6">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Crown size={16} className="text-amber-400" />
          Plano
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-medium capitalize">{user?.plan}</p>
            <p className="text-xs text-zinc-500">Acesso a recursos do plano {user?.plan}</p>
          </div>
          <a href="/dashboard/plans" className="btn-glass text-sm flex items-center gap-1">
            Gerenciar <ExternalLink size={14} />
          </a>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="glass-card p-6">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Key size={16} className="text-purple-400" />
          Alterar Senha
        </h3>
        <div className="space-y-4 max-w-sm">
          <div className="relative">
            <input type={showPassword ? 'text' : 'password'} placeholder="Senha atual" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="input-glass pr-10" />
            <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500">
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          <input type={showPassword ? 'text' : 'password'} placeholder="Nova senha" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="input-glass" />
          <input type={showPassword ? 'text' : 'password'} placeholder="Confirmar nova senha" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="input-glass" />
          <button onClick={handleChangePassword} disabled={!currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword} className={cn('btn-primary', (!currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword) && 'opacity-30 cursor-not-allowed')}>
            {passwordChanged ? 'Senha Alterada!' : 'Alterar Senha'}
          </button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="glass-card p-6 border-red-500/20">
        <div className="flex items-start gap-3">
          <AlertTriangle size={20} className="text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-bold text-white mb-1">Excluir Conta</h3>
            <p className="text-xs text-zinc-500 mb-3">Esta ação é irreversível. Todos os seus dados serão permanentemente excluídos.</p>
            {!showDeleteConfirm ? (
              <button onClick={() => setShowDeleteConfirm(true)} className="px-4 py-2 rounded-xl border border-red-500/30 text-red-400 text-sm hover:bg-red-500/10 transition-all">
                Excluir Minha Conta
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-zinc-400">Digite <strong className="text-red-400">CONFIRMAR</strong> para excluir sua conta:</p>
                <input type="text" placeholder="Digite CONFIRMAR" value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} className="input-glass max-w-xs" />
                <div className="flex gap-2">
                  <button onClick={() => { setShowDeleteConfirm(false); setDeleteConfirm(''); }} className="btn-glass text-sm">Cancelar</button>
                  <button disabled={deleteConfirm !== 'CONFIRMAR'} className={cn('px-4 py-2 rounded-xl bg-red-500/20 text-red-400 text-sm border border-red-500/30 transition-all', deleteConfirm !== 'CONFIRMAR' && 'opacity-30 cursor-not-allowed')}>
                    Excluir Permanentemente
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
