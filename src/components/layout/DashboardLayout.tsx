import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Store, Sparkles, History, PhoneCall, Heart, FolderKanban,
  FileSignature, FileText, DollarSign, ClipboardList, Crown,
  User, Settings, Shield, Menu, X, Search, Bell, LogOut, ChevronLeft,
  PanelLeftClose, PanelLeft, Zap,
} from 'lucide-react';
import { SIDEBAR_GROUPS } from '@/lib/constants';
import { useAppStore } from '@/store/appStore';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard, Store, Sparkles, History, PhoneCall, Heart, FolderKanban,
  FileSignature, FileText, DollarSign, ClipboardList, Crown,
  User, Settings, Shield, Zap,
};

const sidebarVariants = {
  open: { width: 260, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
  closed: { width: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

const mobileOverlay = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarOpen, toggleSidebar, setSidebarOpen } = useAppStore();
  const { logout, user } = useAuthStore();
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetch('/api/admin/check', {
      headers: { Authorization: `Bearer ${useAuthStore.getState().token}` },
    })
      .then(r => r.ok ? r.json() : { isAdmin: false })
      .then(d => setIsAdmin(d.isAdmin))
      .catch(() => setIsAdmin(false));
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-bg-primary flex">
      <AnimatePresence>
        {mobileSidebar && (
          <motion.div
            variants={mobileOverlay}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={() => setMobileSidebar(false)}
            className="fixed inset-0 bg-black/60 z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={sidebarOpen ? 'open' : 'closed'}
        variants={sidebarVariants}
        className={cn(
          'fixed left-0 top-0 h-screen z-50 glass border-r border-white/5 overflow-hidden',
          'hidden md:block'
        )}
      >
        <div className="flex flex-col h-full min-w-[260px]">
          <div className="flex items-center justify-between p-4 border-b border-white/5">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs">
                P
              </div>
              <span className="gradient-text text-sm font-bold">PromptForge AI</span>
            </button>
            <button
              onClick={toggleSidebar}
              className="text-zinc-500 hover:text-white transition-colors"
            >
              <PanelLeftClose size={18} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-3 space-y-4">
            {SIDEBAR_GROUPS.map((group) => (
              <div key={group.label}>
                <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-600 flex items-center gap-1.5">
                  {(() => {
                    const GI = iconMap[group.icon];
                    return GI ? <GI size={11} /> : null;
                  })()}
                  {group.label}
                </p>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const IconComp = iconMap[item.icon];
                    const isActive = location.pathname === item.path;
                    return (
                      <button
                        key={item.id}
                        onClick={() => navigate(item.path)}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200',
                          item.highlight
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:brightness-110'
                            : isActive
                              ? 'bg-purple-500/15 text-purple-400 border border-purple-500/20'
                              : 'text-zinc-400 hover:text-white hover:bg-white/5'
                        )}
                      >
                        {IconComp && <IconComp size={18} />}
                        <span className="flex-1 text-left">{item.label}</span>
                        {item.badge && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            {isAdmin && (
              <button
                onClick={() => navigate('/dashboard/admin')}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200',
                  location.pathname === '/dashboard/admin'
                    ? 'bg-purple-500/15 text-purple-400 border border-purple-500/20'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                )}
              >
                <Shield size={18} />
                <span>Admin</span>
              </button>
            )}
          </nav>

          <div className="p-3 border-t border-white/5">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
            >
              <LogOut size={18} />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </motion.aside>

      <AnimatePresence>
        {mobileSidebar && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ duration: 0.3 }}
            className="fixed left-0 top-0 h-screen z-50 glass border-r border-white/5 md:hidden"
          >
            <div className="flex flex-col h-full w-[260px]">
              <div className="flex items-center justify-between p-4 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs">
                    P
                  </div>
                  <span className="gradient-text text-sm font-bold">PromptForge AI</span>
                </div>
                <button
                  onClick={() => setMobileSidebar(false)}
                  className="text-zinc-500 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto p-3 space-y-4">
                {SIDEBAR_GROUPS.map((group) => (
                  <div key={group.label}>
                    <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-600 flex items-center gap-1.5">
                      {(() => {
                        const GI = iconMap[group.icon];
                        return GI ? <GI size={11} /> : null;
                      })()}
                      {group.label}
                    </p>
                    <div className="space-y-0.5">
                      {group.items.map((item) => {
                        const IconComp = iconMap[item.icon];
                        const isActive = location.pathname === item.path;
                        return (
                          <button
                            key={item.id}
                            onClick={() => { navigate(item.path); setMobileSidebar(false); }}
                            className={cn(
                              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200',
                              item.highlight
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-lg shadow-purple-500/20'
                                : isActive
                                  ? 'bg-purple-500/15 text-purple-400 border border-purple-500/20'
                                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
                            )}
                          >
                            {IconComp && <IconComp size={18} />}
                            <span className="flex-1 text-left">{item.label}</span>
                            {item.badge && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                                {item.badge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
                {isAdmin && (
                  <button
                    onClick={() => { navigate('/dashboard/admin'); setMobileSidebar(false); }}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200',
                      location.pathname === '/dashboard/admin'
                        ? 'bg-purple-500/15 text-purple-400 border border-purple-500/20'
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    )}
                  >
                    <Shield size={18} />
                    <span>Admin</span>
                  </button>
                )}
              </nav>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <div className={cn('flex-1 transition-all duration-300', sidebarOpen ? 'md:ml-[260px]' : 'md:ml-0')}>
        <header className="sticky top-0 z-30 glass border-b border-white/5">
          <div className="flex items-center justify-between px-3 md:px-6 h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setMobileSidebar(true)}
                className="md:hidden text-zinc-400 hover:text-white min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <Menu size={20} />
              </button>
              {!sidebarOpen && (
                <button
                  onClick={toggleSidebar}
                  className="hidden md:flex text-zinc-400 hover:text-white min-w-[36px] min-h-[36px] items-center justify-center"
                >
                  <PanelLeft size={18} />
                </button>
              )}
              <div className="relative hidden sm:block">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="input-glass pl-9 pr-4 py-2 text-sm w-40 md:w-48 lg:w-64"
                />
              </div>
              <button onClick={() => setSearchOpen(!searchOpen)} className="sm:hidden text-zinc-400 hover:text-white min-w-[44px] min-h-[44px] flex items-center justify-center">
                <Search size={18} />
              </button>
            </div>

            <div className="flex items-center gap-1 sm:gap-3">
              <button className="relative min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all">
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-pink-500" />
              </button>
              <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-white/5">
                <div className="hidden xs:block text-right">
                  <p className="text-xs sm:text-sm text-white font-medium max-w-[80px] xs:max-w-[100px] sm:max-w-[120px] truncate">{user?.name || 'Usuário'}</p>
                  <p className="text-[10px] sm:text-xs text-zinc-500 capitalize truncate">Plano {user?.plan || 'Pro'}</p>
                </div>
                {user?.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {searchOpen && (
          <div className="sm:hidden px-3 py-2 glass border-b border-white/5">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Buscar..."
                className="input-glass pl-9 pr-4 py-3 text-sm w-full"
                autoFocus
              />
            </div>
          </div>
        )}

        <main className="p-3 sm:p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
