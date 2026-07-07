import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowLeft, Send, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { authAPI } from '@/services/api';
import Particles from '@/components/ui/Particles';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
};

function getParamFromHash(key: string): string | null {
  const hash = window.location.hash.replace(/^#/, '');
  const params = new URLSearchParams(hash);
  return params.get(key);
}

export default function ResetPassword() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'email' | 'success' | 'password' | 'done'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getParamFromHash('access_token');
    const type = getParamFromHash('type');
    if (token && type === 'recovery') {
      setMode('password');
    }
  }, []);

  const handleSendEmail = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      await authAPI.resetPassword(email.trim());
      setMode('success');
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar email');
    } finally {
      setIsLoading(false);
    }
  }, [email]);

  const handleUpdatePassword = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    if (password.length < 6) {
      setError('Senha deve ter no mínimo 6 caracteres');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const token = getParamFromHash('access_token');
      if (!token) throw new Error('Token de recuperação não encontrado');
      await authAPI.updatePassword(token, password);
      setMode('done');
    } catch (err: any) {
      setError(err.message || 'Erro ao redefinir senha');
    } finally {
      setIsLoading(false);
    }
  }, [password]);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-bg-primary p-4">
      <div className="aurora-bg" />
      <div className="grid-bg" />
      <Particles count={40} />

      <AnimatePresence mode="wait">
        {mode === 'success' && (
          <motion.div
            key="success"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full max-w-md"
          >
            <motion.div variants={itemVariants} className="glass-card p-10 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </motion.div>

              <motion.h2 variants={itemVariants} className="text-2xl font-bold text-white mb-3">
                Email Enviado!
              </motion.h2>

              <motion.p variants={itemVariants} className="text-text-secondary mb-8">
                Enviamos um link de recuperação para{' '}
                <span className="text-primary font-medium">{email}</span>.
                Verifique sua caixa de entrada e spam.
              </motion.p>

              <motion.div variants={itemVariants}>
                <Link to="/login" className="btn-primary inline-flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Voltar ao login
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {mode === 'done' && (
          <motion.div
            key="done"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full max-w-md"
          >
            <motion.div variants={itemVariants} className="glass-card p-10 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </motion.div>

              <motion.h2 variants={itemVariants} className="text-2xl font-bold text-white mb-3">
                Senha Redefinida!
              </motion.h2>

              <motion.p variants={itemVariants} className="text-text-secondary mb-8">
                Sua senha foi alterada com sucesso.
              </motion.p>

              <motion.div variants={itemVariants}>
                <button onClick={() => navigate('/login')} className="btn-primary inline-flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Fazer login
                </button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {mode === 'password' && (
          <motion.div
            key="password"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full max-w-md"
          >
            <motion.div variants={itemVariants} className="glass-card p-10">
              <motion.div variants={itemVariants} className="flex flex-col items-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                  className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4 glow"
                >
                  <Lock className="w-8 h-8 text-primary" />
                </motion.div>

                <h2 className="text-2xl font-bold text-white mb-2">Nova Senha</h2>
                <p className="text-text-secondary text-center text-sm">
                  Digite sua nova senha para redefinir o acesso.
                </p>
              </motion.div>

              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    key={error}
                    variants={{
                      initial: { opacity: 0, y: -10, height: 0 },
                      animate: { opacity: 1, y: 0, height: 'auto' },
                      exit: { opacity: 0, y: -10, height: 0 },
                    }}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-2 p-3 mb-6 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.form variants={itemVariants} onSubmit={handleUpdatePassword} className="space-y-6">
                <div>
                  <label className="block text-sm text-text-secondary mb-2">Nova Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="input-glass pl-10 pr-10"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={isLoading || !password.trim()}
                  variants={itemVariants}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {isLoading ? 'Redefinindo...' : 'Redefinir Senha'}
                </motion.button>
              </motion.form>
            </motion.div>
          </motion.div>
        )}

        {mode === 'email' && (
          <motion.div
            key="form"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full max-w-md"
          >
            <motion.div variants={itemVariants} className="glass-card p-10">
              <motion.div variants={itemVariants} className="flex flex-col items-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                  className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4 glow"
                >
                  <Lock className="w-8 h-8 text-primary" />
                </motion.div>

                <h2 className="text-2xl font-bold text-white mb-2">Recuperar Senha</h2>
                <p className="text-text-secondary text-center text-sm">
                  Digite seu email cadastrado e enviaremos um link para redefinir sua senha.
                </p>
              </motion.div>

              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    key={error}
                    variants={{
                      initial: { opacity: 0, y: -10, height: 0 },
                      animate: { opacity: 1, y: 0, height: 'auto' },
                      exit: { opacity: 0, y: -10, height: 0 },
                    }}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-2 p-3 mb-6 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.form variants={itemVariants} onSubmit={handleSendEmail} className="space-y-6">
                <div>
                  <label className="block text-sm text-text-secondary mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="input-glass pl-10"
                      required
                    />
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={isLoading || !email.trim()}
                  variants={itemVariants}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {isLoading ? 'Enviando...' : 'Enviar Link'}
                </motion.button>
              </motion.form>

              <motion.div variants={itemVariants} className="mt-6 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-text-secondary hover:text-white transition-colors text-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar ao login
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
