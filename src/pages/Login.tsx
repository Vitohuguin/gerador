import { useState, useEffect, useCallback } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, LogIn, Globe, AlertCircle, Sparkles, Zap, FileText, Layout, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import Particles from '@/components/ui/Particles';
import AuroraBackground from '@/components/ui/AuroraBackground';

const floatingCards = [
  { Icon: Sparkles, text: 'Landing Page Fitness', x: '10%', y: '20%', delay: 0 },
  { Icon: Layout, text: 'SaaS Dashboard', x: '60%', y: '30%', delay: 0.5 },
  { Icon: FileText, text: 'Blog Corporativo', x: '75%', y: '60%', delay: 1 },
  { Icon: Zap, text: 'E-commerce Pro', x: '20%', y: '70%', delay: 1.5 },
  { Icon: Layout, text: 'Sistema Web', x: '45%', y: '15%', delay: 2 },
  { Icon: Sparkles, text: 'App Mobile', x: '80%', y: '20%', delay: 2.5 },
];

const generatingLines = [
  '🎨 Gerando identidade visual...',
  '⚡ Definindo componentes...',
  '📐 Organizando layout...',
  '🧠 Analisando requisitos...',
  '✨ Criando prompt otimizado...',
  '🚀 Finalizando prompt...',
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
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

const errorVariants = {
  initial: { opacity: 0, y: -10, height: 0 },
  animate: { opacity: 1, y: 0, height: 'auto' },
  exit: { opacity: 0, y: -10, height: 0 },
};

export default function Login() {
  const { login, isLoading, error, clearError, isAuthenticated, user } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [lineIndex, setLineIndex] = useState(0);

  useEffect(() => {
    clearError();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setLineIndex((prev) => (prev + 1) % generatingLines.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email.trim() || !password.trim()) return;
      await login(email.trim(), password);
    },
    [email, password, login]
  );

  if (isAuthenticated && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="relative min-h-screen flex overflow-hidden bg-bg-primary">
      <div className="aurora-bg" />
      <div className="grid-bg" />
      <Particles count={50} />

      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-8">
        <div className="relative z-10 w-full max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl font-bold gradient-text mb-4">PromptForge AI</h1>
            <p className="text-text-secondary text-lg">
              A plataforma definitiva para gerar prompts profissionais com IA
            </p>
          </motion.div>

          <div className="relative h-[420px] mb-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="absolute inset-0 glass-card p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-text-secondary text-sm ml-2">PromptForge AI Generator</span>
              </div>

              <div className="space-y-3">
                <motion.div
                  key={lineIndex}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-primary font-medium text-sm"
                >
                  {generatingLines[lineIndex]}
                </motion.div>

                <div className="h-2 bg-bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                    className="h-full w-1/3 bg-gradient-to-r from-primary to-glow rounded-full"
                  />
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {['Hero + Navegação', 'Seção Sobre', 'Serviços em Grid', 'Depoimentos', 'FAQ Interativo', 'Footer Premium'].map(
                  (item, i) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className="flex items-center gap-3 p-2 rounded-lg bg-bg-secondary/50"
                    >
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="text-text-secondary text-sm">{item}</span>
                      <span className="ml-auto text-xs text-green-400">✓ Gerado</span>
                    </motion.div>
                  )
                )}
              </div>
            </motion.div>
          </div>

          {floatingCards.map(({ Icon, text, x, y, delay }) => (
            <motion.div
              key={text}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
              transition={{
                opacity: { delay: 1 + delay, duration: 0.6 },
                scale: { delay: 1 + delay, duration: 0.6 },
                y: { delay, duration: 4, repeat: Infinity, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
              }}
              className="absolute glass-card p-3 flex items-center gap-2"
              style={{
                left: x,
                top: y,
                transform: 'translate(-50%, -50%)',
                minWidth: '160px',
              }}
            >
              <Icon className="w-4 h-4 text-primary" />
              <span className="text-xs text-text-secondary">{text}</span>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="w-full lg:w-1/2 min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md"
        >
          <motion.div variants={itemVariants} className="mb-3 sm:mb-4">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-purple-400 transition-colors min-h-[44px]">
              <ArrowLeft size={16} /> Voltar ao início
            </Link>
          </motion.div>
          <motion.div variants={itemVariants} className="glass-card p-6 sm:p-8 lg:p-10">
            <motion.div
              variants={itemVariants}
              className="text-center mb-8"
            >
              <Link to="/">
                <h2 className="text-3xl font-bold gradient-text mb-2">PromptForge AI</h2>
              </Link>
              <p className="text-text-secondary">Entre na sua conta</p>
            </motion.div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  key={error}
                  variants={errorVariants}
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

            <motion.form variants={itemVariants} onSubmit={handleSubmit} className="space-y-5">
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

              <div>
                <label className="block text-sm text-text-secondary mb-2">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-glass pl-10 pr-10"
                    required
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
                disabled={isLoading}
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
                  <LogIn className="w-4 h-4" />
                )}
                {isLoading ? 'Entrando...' : 'Entrar'}
              </motion.button>
            </motion.form>

            <motion.div variants={itemVariants} className="mt-6">
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-glass-border" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-bg-card px-4 text-text-secondary">Ou continue com</span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="button"
                className="btn-glass w-full flex items-center justify-center gap-2"
              >
                <Globe className="w-4 h-4" />
                Google
              </motion.button>
            </motion.div>

            <motion.div variants={itemVariants} className="mt-6 flex flex-col items-center gap-3 text-sm">
              <Link
                to="/register"
                className="text-primary hover:text-primary-hover transition-colors font-medium"
              >
                Criar Conta
              </Link>
              <Link
                to="/reset-password"
                className="text-text-secondary hover:text-white transition-colors"
              >
                Esqueci minha senha?
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
