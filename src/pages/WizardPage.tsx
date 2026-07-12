import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers, Building2, Target, Users, Palette, Droplets,
  TextCursorInput, Sparkles, Layout, Settings2, Code2,
  Monitor, FileText, CheckCircle2, Zap, ChevronLeft,
  ChevronRight, Check, Copy, Download, Heart, Share2,
  Save, RotateCcw, Edit3, Upload, Plus, X, FileDown,
  Star, ExternalLink, Crown, KeyRound,
  MessageCircle, MessageSquare, Moon, Languages, Database,
  CreditCard, LogIn, BarChart3, Bell, Search, Filter,
  ArrowUpDown, Mail, Calendar, Info, Briefcase, Package,
  Rocket, Images, Image, FolderOpen, Film, Handshake,
  DollarSign, Gift, MapPin, HelpCircle, UserCircle, Globe,
  CircleDot, Gem, Feather, Cpu, GlassWater, Cloud,
  BookOpen, Gamepad2, ShoppingBag, Trophy, Sun, Apple,
  ShoppingCart, Settings, Smartphone, Ticket, Store, Lock,
  GraduationCap, UtensilsCrossed, Hotel, Stethoscope, Megaphone,
  PartyPopper, Pencil, Terminal, Wind,
} from 'lucide-react';
import { useWizardStore } from '@/store/wizardStore';
import { usePromptStore } from '@/store/promptStore';
import { useAuthStore } from '@/store/authStore';
import { UpgradeBlock } from '@/components/UpgradeBlock';
import { nvidiaAPI } from '@/services/api';
import {
  WIZARD_STEPS, NICHES, STYLES, PLATFORMS, LANGUAGES,
  FONTS, STRUCTURES, FUNCTIONALITIES, TECHNOLOGIES,
  ANIMATIONS_LIST, OBJECTIVES, ANIMATION_STAGES,
} from '@/lib/constants';
import { cn, generateId } from '@/lib/utils';
import type {
  NicheCategory, Objective, PromptStyle, Platform,
  AnimationType, SiteStructure, Functionality,
} from '@/types';

const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
};

const iconMap: Record<string, React.ElementType> = {
  Layers, Building2, Target, Users, Palette, Droplets,
  TextCursorInput, Sparkles, Layout, Settings2, Code2,
  Monitor, FileText, CheckCircle2, Zap, KeyRound, Globe,
  LogIn, User: Users, Moon, Languages, Code: Code2,
  Database, CreditCard, Calendar, Bell, Search, Filter,
  ArrowUpDown, Upload, Download, FileDown, MessageCircle,
  MessageSquare, Mail, Share2, LayoutDashboard: Layout,
  BarChart3, Info, Briefcase, Package, Rocket, Images,
  Image, FolderOpen, Film, Handshake, DollarSign, Gift,
  MapPin, HelpCircle, UserCircle, Star, Heart,
  CircleDot, Gem, Feather, Cpu, GlassWater, Cloud,
  BookOpen, Gamepad2, ShoppingBag, Trophy, Sun, Apple,
  ShoppingCart, Settings, Smartphone, Ticket, Store, Lock,
  GraduationCap, UtensilsCrossed, Hotel, Stethoscope, Megaphone,
  PartyPopper, Pencil, Terminal, Wind, Triangle: Zap,
};

function NicheStep() {
  const { niche, customNiche, setStep, updateField, nextStep } = useWizardStore();
  const { user } = useAuthStore();
  const [showCustom, setShowCustom] = useState(false);
  const [filter, setFilter] = useState('');
  const isPro = user?.plan === 'pro';
  
  let visible = NICHES;
  if (filter) {
    visible = visible.filter((n) => n.label.toLowerCase().includes(filter.toLowerCase()));
  }
  if (!isPro) {
    visible = visible.filter((n) => !n.premium);
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-white">{'Escolha o Nicho'}</h3>
        <p className="text-zinc-400 mt-1">{isPro ? 'Selecione o segmento do seu projeto' : `${visible.length} nichos disponiveis no seu plano`}</p>
      </div>
      <input
        type="text"
        placeholder={'Buscar nicho...'}
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="input-glass"
      />
      <div className="grid grid-cols-2 xs:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 max-h-[300px] sm:max-h-[400px] overflow-y-auto pr-1 sm:pr-2">
        {visible.map((n) => {
          const isSelected = niche === n.label;
          return (
            <button
              key={n.label}
              onClick={() => { updateField('niche', isSelected ? '' : n.label); setShowCustom(false); }}
              className={cn(
                'glass-card p-2 sm:p-4 text-left transition-all',
                isSelected ? 'border-purple-500/50 bg-purple-500/10 ring-1 ring-purple-500/30' : 'hover:border-white/10'
              )}
            >
              <div className="text-lg sm:text-2xl mb-0.5 sm:mb-1">{n.emoji}</div>
              <p className="text-xs sm:text-sm font-medium text-white">{n.label}</p>
              <p className="text-[10px] sm:text-xs text-zinc-500 mt-0.5 hidden xs:block">{n.description}</p>
            </button>
          );
        })}
      </div>
      <button
        onClick={() => setShowCustom(!showCustom)}
        className="text-sm text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
      >
        <Plus size={14} /> {'Personalizado'}
      </button>
      {showCustom && (
        <input
          type="text"
          placeholder={'Digite seu nicho personalizado'}
          value={customNiche}
          onChange={(e) => updateField('customNiche', e.target.value)}
          className="input-glass"
        />
      )}
    </div>
  );
}

function CompanyStep() {
  const store = useWizardStore();
  const {
    companyName, slogan, segment, city, state, country, neighborhood, address,
    businessDescription, whatsapp, phone, email, currentSite,
    googleMaps, instagram, facebook, updateField
  } = store;

  return (
    <div className="space-y-3 sm:space-y-4 max-w-2xl mx-auto">
      <div className="text-center mb-3 sm:mb-4">
        <h3 className="text-lg sm:text-xl font-bold text-white">{'Dados da Empresa'}</h3>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">{'Informe os dados do seu negocio'}</p>
      </div>

      <div className="glass-card p-3 sm:p-4 space-y-3">
        <p className="text-xs font-bold text-zinc-300 flex items-center gap-1"><Building2 size={14} /> Básico</p>
        <div className="space-y-3">
          {[
            { key: 'companyName', label: 'Nome da Empresa', placeholder: 'Minha Empresa' },
            { key: 'slogan', label: 'Slogan', placeholder: 'Seu slogan aqui' },
            { key: 'segment', label: 'Segmento/Nicho', placeholder: 'Assistência técnica de celulares' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs text-zinc-300 mb-1 block">{f.label}</label>
              <input
                type="text"
                value={(store[f.key as keyof typeof store] as string) || ''}
                onChange={(e) => updateField(f.key, e.target.value)}
                placeholder={f.placeholder}
                className="input-glass"
              />
            </div>
          ))}
          <div>
            <label className="text-xs text-zinc-300 mb-1 block">{'Descricao do Negocio'}</label>
            <textarea
              value={businessDescription}
              onChange={(e) => updateField('businessDescription', e.target.value)}
              placeholder="Descreva seu negocio..."
              rows={3}
              className="input-glass resize-none"
            />
          </div>
        </div>
      </div>

      <div className="glass-card p-3 sm:p-4 space-y-3">
        <p className="text-xs font-bold text-zinc-300 flex items-center gap-1"><MapPin size={14} /> Localização</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { key: 'country', label: 'País', placeholder: 'Brasil' },
            { key: 'state', label: 'Estado', placeholder: 'SP' },
            { key: 'city', label: 'Cidade', placeholder: 'São Paulo' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs text-zinc-300 mb-1 block">{f.label}</label>
              <input
                type="text"
                value={(store[f.key as keyof typeof store] as string) || ''}
                onChange={(e) => updateField(f.key, e.target.value)}
                placeholder={f.placeholder}
                className="input-glass"
              />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { key: 'neighborhood', label: 'Bairro', placeholder: 'Centro' },
            { key: 'address', label: 'Endereço', placeholder: 'Rua Exemplo, 123' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs text-zinc-300 mb-1 block">{f.label} (opcional)</label>
              <input
                type="text"
                value={(store[f.key as keyof typeof store] as string) || ''}
                onChange={(e) => updateField(f.key, e.target.value)}
                placeholder={f.placeholder}
                className="input-glass"
              />
            </div>
          ))}
        </div>
        <div>
          <label className="text-xs text-zinc-300 mb-1 block">Google Maps</label>
          <input
            type="text"
            value={googleMaps}
            onChange={(e) => updateField('googleMaps', e.target.value)}
            placeholder="Link do Google Maps"
            className="input-glass"
          />
        </div>
      </div>

      <div className="glass-card p-3 sm:p-4 space-y-3">
        <p className="text-xs font-bold text-zinc-300 flex items-center gap-1"><MessageCircle size={14} /> Contato</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-zinc-300 mb-1 block">WhatsApp</label>
            <input
              type="text"
              value={whatsapp}
              onChange={(e) => updateField('whatsapp', e.target.value)}
              placeholder="(11) 99999-9999"
              className="input-glass"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-300 mb-1 block">Telefone</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => updateField('phone', e.target.value)}
              placeholder="(11) 3333-3333"
              className="input-glass"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-zinc-300 mb-1 block">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => updateField('email', e.target.value)}
              placeholder="contato@empresa.com"
              className="input-glass"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-300 mb-1 block">Site Atual</label>
            <input
              type="text"
              value={currentSite}
              onChange={(e) => updateField('currentSite', e.target.value)}
              placeholder="https://seusite.com"
              className="input-glass"
            />
          </div>
        </div>
      </div>

      <div className="glass-card p-3 sm:p-4 space-y-3">
        <p className="text-xs font-bold text-zinc-300 flex items-center gap-1"><Globe size={14} /> Redes Sociais</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-zinc-300 mb-1 block">Instagram</label>
            <input
              type="text"
              value={instagram}
              onChange={(e) => updateField('instagram', e.target.value)}
              placeholder="@seuinstagram"
              className="input-glass"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-300 mb-1 block">Facebook</label>
            <input
              type="text"
              value={facebook}
              onChange={(e) => updateField('facebook', e.target.value)}
              placeholder="facebook.com/suaempresa"
              className="input-glass"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ObjectiveStep() {
  const { objective, customObjective, updateField } = useWizardStore();
  const [showCustom, setShowCustom] = useState(objective === 'custom');

  const categories = [
    { key: 'sites', label: '🌐 Sites' },
    { key: 'aplicacoes', label: '📱 Aplicações' },
    { key: 'negocios', label: '💼 Negócios' },
    { key: 'marketing', label: '📈 Marketing' },
    { key: 'custom', label: '🤖 Personalizado' },
  ];

  const handleSelect = (obj: typeof OBJECTIVES[0]) => {
    if (obj.id === 'custom') {
      setShowCustom(true);
      updateField('objective', 'custom');
    } else {
      setShowCustom(false);
      updateField('objective', obj.id);
      updateField('customObjective', '');
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-white">{'Objetivo do Projeto'}</h3>
        <p className="text-zinc-400 mt-1">{'Qual o principal objetivo deste projeto?'}</p>
      </div>
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
        {categories.map((cat) => {
          const items = OBJECTIVES.filter((o) => o.category === cat.key);
          if (items.length === 0) return null;
          return (
            <div key={cat.key}>
              <h4 className="text-xs sm:text-sm font-medium text-zinc-300 mb-2">{cat.label}</h4>
              {cat.key === 'custom' && showCustom ? (
                <div className="glass-card p-4">
                  <textarea
                    value={customObjective || ''}
                    onChange={(e) => updateField('customObjective', e.target.value)}
                    placeholder="Descreva o projeto. Ex: Plataforma para pet shop, Sistema para lava-jato, Aplicativo para academia..."
                    rows={3}
                    className="input-glass resize-none w-full"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {items.map((obj) => {
                    const isSelected = objective === obj.id;
                    const Icon = iconMap[obj.icon] || FileText;
                    return (
                      <button
                        key={obj.id}
                        onClick={() => handleSelect(obj)}
                        className={cn(
                          'glass-card p-3 text-left transition-all',
                          isSelected ? 'border-purple-500/50 bg-purple-500/10 ring-1 ring-purple-500/30' : 'hover:border-white/10'
                        )}
                      >
                        <Icon size={14} className={cn(isSelected ? 'text-purple-400' : 'text-zinc-400')} />
                        <p className="text-xs font-medium text-white mt-1">{obj.label}</p>
                        <p className="text-[10px] text-zinc-500 mt-0.5 hidden sm:block">{obj.description}</p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AudienceStep() {
  const store = useWizardStore();
  const { updateField } = store;
    const fields = [
    { key: 'targetAudience', label: 'Cliente Ideal', placeholder: 'Descreva seu cliente ideal' },
    { key: 'ageRange', label: 'Faixa Etaria', placeholder: '25-45 anos' },
    { key: 'socialClass', label: 'Classe Social', placeholder: 'A, B, C' },
    { key: 'mainPains', label: 'Principais Dores', placeholder: 'Quais problemas seu cliente enfrenta?', big: true },
    { key: 'mainDesires', label: 'Principais Desejos', placeholder: 'O que seu cliente deseja alcancar?', big: true },
  ];
  return (
    <div className="space-y-3 sm:space-y-4 max-w-2xl mx-auto">
      <div className="text-center mb-3 sm:mb-4">
        <h3 className="text-lg sm:text-xl font-bold text-white">{'Publico-Alvo'}</h3>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">{'Defina para quem seu projeto se destina'}</p>
      </div>
      {fields.map((f) => {
        const val = store[f.key as keyof typeof store] as string || '';
        return (
        <div key={f.key}>
          <label className="text-xs sm:text-sm text-zinc-300 mb-1 sm:mb-1.5 block">{f.label}</label>
          {f.big ? (
            <textarea
              value={val}
              onChange={(e) => updateField(f.key, e.target.value)}
              placeholder={f.placeholder}
              rows={3}
              className="input-glass resize-none"
            />
          ) : (
            <input
              type="text"
              value={val}
              onChange={(e) => updateField(f.key, e.target.value)}
              placeholder={f.placeholder}
              className="input-glass"
            />
          )}
        </div>
        );
      })}
    </div>
  );
}

function StyleStep() {
  const { style, updateField } = useWizardStore();
  const { user } = useAuthStore();
  const isPro = user?.plan === 'pro';

  const categories = [
    { key: 'estilo', label: '🎨 Estilo Visual' },
    { key: 'tema', label: '🌗 Tema' },
  ];

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-white">{'Estilo Visual'}</h3>
        <p className="text-zinc-400 mt-1">{'Escolha o estilo visual do projeto'}</p>
      </div>
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
        {categories.map((cat) => {
          const items = STYLES.filter((s) => s.category === cat.key);
          if (items.length === 0) return null;
          return (
            <div key={cat.key}>
              <h4 className="text-xs sm:text-sm font-medium text-zinc-300 mb-2">{cat.label}</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {items.map((s) => {
                  const isSelected = style === s.id;
                  const isLocked = s.premium && !isPro;
                  return (
                    <button
                      key={s.id}
                      onClick={() => { if (!isLocked) updateField('style', isSelected ? '' : s.id); }}
                      className={cn(
                        'glass-card p-3 text-left transition-all',
                        isSelected ? 'border-purple-500/50 bg-purple-500/10 ring-1 ring-purple-500/30' : 'hover:border-white/10',
                        isLocked && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <p className="text-sm">{s.icon}</p>
                        {isLocked && <Star size={10} className="text-amber-400 fill-amber-400" />}
                      </div>
                      <p className="text-xs font-medium text-white">{s.label}</p>
                      <p className="text-[10px] text-zinc-500 mt-0.5 hidden sm:block">{s.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ColorsStep() {
  const { primaryColor, secondaryColor, updateField } = useWizardStore();

  const colorPairs: Record<string, { primary: string; secondary: string }> = {
    '#A855F7': { primary: '#A855F7', secondary: '#EC4899' },
    '#3B82F6': { primary: '#3B82F6', secondary: '#06B6D4' },
    '#10B981': { primary: '#10B981', secondary: '#34D399' },
    '#F59E0B': { primary: '#F59E0B', secondary: '#EF4444' },
    '#EF4444': { primary: '#EF4444', secondary: '#F97316' },
    '#EC4899': { primary: '#EC4899', secondary: '#A855F7' },
    '#06B6D4': { primary: '#06B6D4', secondary: '#3B82F6' },
    '#8B5CF6': { primary: '#8B5CF6', secondary: '#D946EF' },
    '#F97316': { primary: '#F97316', secondary: '#F59E0B' },
    '#14B8A6': { primary: '#14B8A6', secondary: '#10B981' },
  };

    return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-white">{'Paleta de Cores'}</h3>
        <p className="text-zinc-400 mt-1">{'Escolha a cor primaria e secundaria do projeto'}</p>
      </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-6 max-w-sm sm:max-w-lg mx-auto">
            <div className="glass-card p-3 sm:p-5 text-center">
              <label className="text-xs sm:text-sm font-medium text-white mb-2 sm:mb-3 block">{'Cor Primaria'}</label>
              <div className="relative w-14 h-14 sm:w-20 sm:h-20 mx-auto">
                <div className="absolute inset-0 rounded-xl" style={{ backgroundColor: primaryColor }} />
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => updateField('primaryColor', e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <p className="text-[10px] sm:text-xs text-zinc-500 mt-1 sm:mt-2">{primaryColor}</p>
            </div>
            <div className="glass-card p-3 sm:p-5 text-center">
              <label className="text-xs sm:text-sm font-medium text-white mb-2 sm:mb-3 block">{'Cor Secundaria'}</label>
              <div className="relative w-14 h-14 sm:w-20 sm:h-20 mx-auto">
                <div className="absolute inset-0 rounded-xl" style={{ backgroundColor: secondaryColor }} />
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => updateField('secondaryColor', e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <p className="text-[10px] sm:text-xs text-zinc-500 mt-1 sm:mt-2">{secondaryColor}</p>
            </div>
          </div>
      <div className="flex justify-center gap-1.5 sm:gap-3 mt-3 sm:mt-4 flex-wrap">
        {['#A855F7', '#10B981', '#3B82F6', '#EF4444', '#F97316', '#EC4899', '#06B6D4', '#EAB308'].map((c) => (
          <button
            key={c}
            onClick={() => { const pair = colorPairs[c] || { primary: c, secondary: '#D946EF' }; updateField('primaryColor', pair.primary); updateField('secondaryColor', pair.secondary); }}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border-2 border-white/10 hover:scale-110 transition-transform"
            style={{ backgroundColor: c }}
          />
        ))}
      </div>
    </div>
  );
}

function FontStep() {
  const { font, updateField } = useWizardStore();

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Manrope:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=General+Sans:wght@300;400;500;600;700&family=Satoshi:wght@300;400;500;600;700;900&family=Space+Grotesk:wght@300;400;500;600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

    return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-white">{'Tipografia'}</h3>
        <p className="text-zinc-400 mt-1">{'Escolha a fonte principal do projeto'}</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
        {FONTS.map((f) => {
          const isSelected = font === f.id;
          return (
            <button
              key={f.id}
              onClick={() => updateField('font', f.id)}
              className={cn(
                'glass-card p-3 sm:p-5 transition-all text-left',
                isSelected ? 'border-purple-500/50 bg-purple-500/10 ring-1 ring-purple-500/30' : 'hover:border-white/10'
              )}
            >
              <p className="text-[10px] sm:text-xs text-zinc-500 mb-0.5 sm:mb-1">{f.category}</p>
              <p className="text-sm sm:text-lg text-white" style={{ fontFamily: f.id }}>{f.label}</p>
              <p className="text-[11px] sm:text-sm text-zinc-400 mt-0.5 sm:mt-1" style={{ fontFamily: f.id }}>ABCD abc 123</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AnimationsStep() {
  const { animations, toggleAnimation } = useWizardStore();
  const { user } = useAuthStore();
  const isPro = user?.plan === 'pro';

  const categories = [
    { key: 'entrada', label: '✨ Entrada' },
    { key: 'interacao', label: '🖱️ Interação' },
    { key: 'scroll', label: '📜 Scroll' },
    { key: 'navegacao', label: '📄 Navegação' },
    { key: 'texto', label: '🔤 Texto' },
    { key: 'efeitos', label: '🎨 Efeitos Visuais' },
  ];

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-white">{'Animações'}</h3>
        <p className="text-zinc-400 mt-1">{'Selecione as animações do projeto'}</p>
      </div>
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
        {categories.map((cat) => {
          const items = ANIMATIONS_LIST.filter((a) => a.category === cat.key);
          if (items.length === 0) return null;
          return (
            <div key={cat.key}>
              <h4 className="text-xs sm:text-sm font-medium text-zinc-300 mb-2">{cat.label}</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {items.map((a) => {
                  const isSelected = animations.includes(a.id);
                  const isLocked = a.premium && !isPro;
                  return (
                    <button
                      key={a.id}
                      onClick={() => { if (!isLocked) toggleAnimation(a.id as AnimationType); }}
                      className={cn(
                        'glass-card p-3 text-left transition-all',
                        isSelected ? 'border-purple-500/50 bg-purple-500/10 ring-1 ring-purple-500/30' : 'hover:border-white/10',
                        isLocked && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-medium text-white">{a.label}</p>
                        {isLocked && <Star size={10} className="text-amber-400 fill-amber-400 shrink-0" />}
                      </div>
                      <p className="text-[10px] text-zinc-500 mt-0.5 hidden sm:block">{a.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StructureStep() {
  const { structures, toggleStructure } = useWizardStore();

  const categories = [
    { key: 'principais', label: '🏠 Principais' },
    { key: 'conteudo', label: '📸 Conteúdo' },
    { key: 'credibilidade', label: '👥 Credibilidade' },
    { key: 'comercial', label: '💰 Comercial' },
    { key: 'informacao', label: '📚 Informação' },
    { key: 'sistema', label: '🔒 Sistema' },
  ];

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-white">{'Estrutura do Site'}</h3>
        <p className="text-zinc-400 mt-1">{'Selecione as seções do site'}</p>
      </div>
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
        {categories.map((cat) => {
          const items = STRUCTURES.filter((s) => s.category === cat.key);
          if (items.length === 0) return null;
          return (
            <div key={cat.key}>
              <h4 className="text-xs sm:text-sm font-medium text-zinc-300 mb-2">{cat.label}</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {items.map((s) => {
                  const isSelected = structures.includes(s.id);
                  const Icon = iconMap[s.icon] || Layout;
                  return (
                    <button
                      key={`${s.id}-${s.label}`}
                      onClick={() => toggleStructure(s.id as SiteStructure)}
                      className={cn(
                        'glass-card p-3 text-left transition-all',
                        isSelected ? 'border-purple-500/50 bg-purple-500/10 ring-1 ring-purple-500/30' : 'hover:border-white/10'
                      )}
                    >
                      <Icon size={14} className={cn(isSelected ? 'text-purple-400' : 'text-zinc-400')} />
                      <p className="text-xs font-medium text-white mt-1">{s.label}</p>
                      <p className="text-[10px] text-zinc-500 mt-0.5 hidden sm:block">{s.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FeaturesStep() {
  const { functionalities, toggleFunctionality } = useWizardStore();

  const categories = [
    { key: 'usuarios', label: '👤 Usuários' },
    { key: 'painel', label: '📊 Painel' },
    { key: 'pesquisa', label: '🔍 Pesquisa' },
    { key: 'arquivos', label: '📂 Arquivos' },
    { key: 'comunicacao', label: '💬 Comunicação' },
    { key: 'sistema', label: '🌍 Sistema' },
    { key: 'comercial', label: '💰 Comercial' },
  ];

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-white">{'Funcionalidades'}</h3>
        <p className="text-zinc-400 mt-1">{'Selecione as funcionalidades do sistema'}</p>
      </div>
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
        {categories.map((cat) => {
          const items = FUNCTIONALITIES.filter((f) => f.category === cat.key);
          if (items.length === 0) return null;
          return (
            <div key={cat.key}>
              <h4 className="text-xs sm:text-sm font-medium text-zinc-300 mb-2">{cat.label}</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {items.map((func) => {
                  const isSelected = functionalities.includes(func.id);
                  const Icon = iconMap[func.icon] || Settings2;
                  return (
                    <button
                      key={`${func.id}-${func.label}`}
                      onClick={() => toggleFunctionality(func.id as Functionality)}
                      className={cn(
                        'glass-card p-3 text-left transition-all',
                        isSelected ? 'border-purple-500/50 bg-purple-500/10 ring-1 ring-purple-500/30' : 'hover:border-white/10'
                      )}
                    >
                      <Icon size={14} className={cn(isSelected ? 'text-purple-400' : 'text-zinc-400')} />
                      <p className="text-xs font-medium text-white mt-1">{func.label}</p>
                      <span className={cn(
                        'text-[10px] px-1.5 py-0.5 rounded mt-1 inline-block',
                        func.complexity === 'low' ? 'bg-emerald-500/10 text-emerald-400' :
                        func.complexity === 'medium' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-red-500/10 text-red-400'
                      )}>
                        {func.complexity}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TechStep() {
  const { technologies, toggleTechnology } = useWizardStore();
    const categories = [
    { key: 'auto', label: 'Inteligente' },
    { key: 'frontend', label: 'Frontend' },
    { key: 'estilo', label: 'Estilo' },
    { key: 'ui', label: 'UI' },
    { key: 'animacoes', label: 'Animações' },
    { key: 'backend', label: 'Backend' },
    { key: 'database', label: 'Banco de Dados' },
    { key: 'hosting', label: 'Hospedagem' },
  ];

  const handleToggle = (techId: string) => {
    if (techId === 'auto') {
      if (technologies.includes('auto')) {
        useWizardStore.setState({ technologies: [] });
      } else {
        const popularIds = TECHNOLOGIES.filter(t => t.popular).map(t => t.id);
        useWizardStore.setState({ technologies: popularIds });
      }
    } else {
      if (technologies.includes(techId)) {
        toggleTechnology(techId);
      } else {
        const withoutAuto = technologies.filter(t => t !== 'auto');
        useWizardStore.setState({ technologies: [...withoutAuto, techId] });
      }
    }
  };
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center mb-3 sm:mb-4">
        <h3 className="text-lg sm:text-xl font-bold text-white">{'Tecnologias'}</h3>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">{'Escolha as tecnologias do projeto'}</p>
      </div>
      {categories.map((cat) => {
        const items = TECHNOLOGIES.filter((t) => t.category === cat.key);
        return (
          <div key={cat.key}>
            <h4 className="text-xs sm:text-sm font-medium text-zinc-300 mb-1.5 sm:mb-2">{cat.label}</h4>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {items.map((t) => {
                const isSelected = technologies.includes(t.id);
                return (
                  <button
                    key={t.id}
                    onClick={() => handleToggle(t.id)}
                    className={cn(
                      'px-3 py-2 rounded-xl text-sm transition-all border',
                      isSelected
                        ? 'bg-purple-500/15 border-purple-500/40 text-purple-300'
                        : 'glass-card text-zinc-400 border-white/5 hover:border-white/10'
                    )}
                  >
                    {t.icon} {t.label} {t.popular && '⭐'}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PlatformStep() {
  const { platform, updateField } = useWizardStore();
    return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-white">{'Plataforma'}</h3>
        <p className="text-zinc-400 mt-1">{'Escolha a plataforma para gerar o prompt'}</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
        {PLATFORMS.map((p) => {
          const isSelected = platform === p.id;
          const Icon = iconMap[p.icon] || Monitor;
          return (
            <button
              key={p.id}
              onClick={() => updateField('platform', p.id)}
              className={cn(
                'glass-card p-3 sm:p-5 text-left transition-all',
                isSelected ? 'border-purple-500/50 bg-purple-500/10 ring-1 ring-purple-500/30' : 'hover:border-white/10'
              )}
            >
              <Icon size={20} className={cn('sm:hidden', isSelected ? 'text-purple-400' : 'text-zinc-400')} />
              <Icon size={24} className={cn('hidden sm:block', isSelected ? 'text-purple-400' : 'text-zinc-400')} />
              <p className="text-xs sm:text-sm font-bold text-white mt-1 sm:mt-2">{p.label}</p>
              <p className="text-[10px] sm:text-xs text-zinc-500 mt-0.5 sm:mt-1 hidden xs:block">{p.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function BriefingStep() {
  const { briefingNotes, referenceUrl, description, additionalContext } = useWizardStore();
  const { user } = useAuthStore();
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isPro = user?.plan === 'pro';
  const { description: desc, additionalContext: addCtx, updateField } = useWizardStore();
  
  return (
    <div className="space-y-3 sm:space-y-4 max-w-2xl mx-auto">
      <div className="text-center mb-3 sm:mb-4">
        <h3 className="text-lg sm:text-xl font-bold text-white">{'Briefing'}</h3>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">{'Informacoes adicionais sobre o projeto'}</p>
      </div>
      <div>
        <label className="text-sm text-zinc-300 mb-1.5 block">{'Descricao do Projeto'}</label>
        <textarea
          value={desc}
          onChange={(e) => updateField('description', e.target.value)}
          placeholder={'Descreva seu projeto em detalhes...'}
          rows={4}
          className="input-glass resize-none"
        />
      </div>
      <div>
        <label className="text-sm text-zinc-300 mb-1.5 block">{'URL de Referencia'}</label>
        <input
          type="text"
          value={referenceUrl}
          onChange={(e) => updateField('referenceUrl', e.target.value)}
          placeholder={'https://site-de-referencia.com'}
          className="input-glass"
        />
      </div>
      <div>
        <label className="text-sm text-zinc-300 mb-1.5 block">{'Contexto Adicional'}</label>
        <textarea
          value={addCtx}
          onChange={(e) => updateField('additionalContext', e.target.value)}
          placeholder={'Informacoes extras...'}
          rows={3}
          className="input-glass resize-none"
        />
      </div>
      <div>
        <label className="text-sm text-zinc-300 mb-1.5 block">{'Observacoes'}</label>
        <textarea
          value={briefingNotes}
          onChange={(e) => updateField('briefingNotes', e.target.value)}
          placeholder={'Observacoes gerais...'}
          rows={3}
          className="input-glass resize-none"
        />
      </div>
      {isPro && (
        <div>
          <label className="text-sm text-zinc-300 mb-1.5 block">{'Upload de Arquivos'}</label>
          <div className="glass-card p-6 text-center cursor-pointer hover:border-white/10 transition-all" onClick={() => fileInputRef.current?.click()}>
            <Upload size={24} className="text-zinc-500 mx-auto mb-2" />
            <p className="text-sm text-zinc-400">{'Arraste arquivos ou clique para enviar'}</p>
            <p className="text-xs text-zinc-600 mt-1">{'PDF, DOCX, TXT (max 10MB)'}</p>
            <input type="file" multiple className="hidden" ref={fileInputRef} onChange={(e) => {
              if (e.target.files) setFiles([...files, ...Array.from(e.target.files)]);
            }} />
            {files.length > 0 && (
              <div className="mt-3 space-y-1">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2 text-sm">
                    <span className="text-zinc-300">{f.name}</span>
                    <button onClick={() => setFiles(files.filter((_, j) => j !== i))}><X size={14} className="text-zinc-500" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ReviewStep() {
  const wizard = useWizardStore();
  const steps = [
    { step: 1, label: 'Nicho', value: wizard.niche || wizard.customNiche || 'Nao definido' },
    { step: 2, label: 'Empresa', value: wizard.companyName || 'Nao definido' },
    { step: 3, label: 'Objetivo', value: wizard.objective || 'Nao definido' },
    { step: 4, label: 'Publico', value: wizard.targetAudience || 'Nao definido' },
    { step: 5, label: 'Estilo', value: wizard.style || 'Nao definido' },
    { step: 6, label: 'Cores', value: wizard.colorScheme === 'Personalizada' ? `${wizard.primaryColor} / ${wizard.secondaryColor}` : wizard.colorScheme || 'Nao definido' },
    { step: 7, label: 'Fonte', value: wizard.font || 'Nao definido' },
    { step: 8, label: 'Animacoes', value: wizard.animations.length > 0 ? `${wizard.animations.length} ${'selecionadas'}` : 'Nenhum' },
    { step: 9, label: 'Estrutura', value: wizard.structures.length > 0 ? `${wizard.structures.length} ${'selecionados'}` : 'Nenhum' },
    { step: 10, label: 'Funcionalidades', value: wizard.functionalities.length > 0 ? `${wizard.functionalities.length} ${'selecionados'}` : 'Nenhum' },
    { step: 11, label: 'Tecnologias', value: wizard.technologies.length > 0 ? `${wizard.technologies.length} ${'selecionados'}` : 'Nenhum' },
    { step: 12, label: 'Plataforma', value: wizard.platform || 'Nao definido' },
    { step: 13, label: 'Briefing', value: wizard.briefingNotes || 'Nao preenchido' },
    { step: 14, label: 'Idioma', value: wizard.language === 'pt' ? 'Portugues' : wizard.language === 'en' ? 'English' : wizard.language || 'Portugues' },
  ];

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-white">{'Revise suas Escolhas'}</h3>
        <p className="text-zinc-400 mt-1">{'Verifique se tudo esta correto antes de gerar'}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
        {steps.map((s) => (
          <div key={s.step} className="glass-card p-3 sm:p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500">Passo {s.step}</p>
              <p className="text-sm font-medium text-white">{s.label}</p>
              <p className="text-xs text-zinc-400">{s.value}</p>
            </div>
            <button
              onClick={() => wizard.setStep(s.step)}
              className="text-purple-400 hover:text-purple-300 transition-colors"
            >
              <Edit3 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function GenerateStep() {
  const wizard = useWizardStore();
  const navigate = useNavigate();
  const { addPrompt } = usePromptStore();
  const { user } = useAuthStore();
  const isPro = user?.plan === 'pro';
  const [stage, setStage] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [saved, setSaved] = useState(false);
  const [improving, setImproving] = useState(false);
  const [correcting, setCorrecting] = useState(false);
  const [alternating, setAlternating] = useState(false);
  const [tokenCount, setTokenCount] = useState(0);
  const [showExport, setShowExport] = useState(false);

  const generatePrompt = async () => {
    setGenerating(true);
    setStage(0);

    const interval = setInterval(() => {
      setStage((prev) => {
        if (prev < ANIMATION_STAGES.length - 1) return prev + 1;
        clearInterval(interval);
        return prev;
      });
    }, ANIMATION_STAGES[0]?.duration || 1500);

    try {
      const data = {
        objective: wizard.objective || 'landing-page' as any,
        niche: wizard.niche || 'tech',
        style: wizard.style || 'minimalista',
        platform: wizard.platform || 'lovable',
        language: wizard.language,
        technologies: wizard.technologies,
        animations: wizard.animations,
        structures: wizard.structures,
        functionalities: wizard.functionalities,
        font: wizard.font,
        colorScheme: wizard.colorScheme,
        primaryColor: wizard.primaryColor,
        secondaryColor: wizard.secondaryColor,
        targetAudience: wizard.targetAudience,
        referenceUrl: wizard.referenceUrl,
        description: wizard.description,
        additionalContext: wizard.additionalContext,
        companyName: wizard.companyName,
        slogan: wizard.slogan,
        segment: wizard.segment,
        city: wizard.city,
        state: wizard.state,
        country: wizard.country,
        neighborhood: wizard.neighborhood,
        address: wizard.address,
        businessDescription: wizard.businessDescription,
        whatsapp: wizard.whatsapp,
        phone: wizard.phone,
        email: wizard.email,
        currentSite: wizard.currentSite,
        googleMaps: wizard.googleMaps,
        instagram: wizard.instagram,
        facebook: wizard.facebook,
        customObjective: wizard.customObjective,
      };
      const res = await nvidiaAPI.generatePrompt(data, wizard.language);
      setResult(res.content);
      setTokenCount(res.tokens || Math.floor(res.content.length / 4));
      setGenerating(false);
      setStage(ANIMATION_STAGES.length);
      clearInterval(interval);
    } catch (err: any) {
      clearInterval(interval);
      setGenerating(false);
      setError(err?.message || 'Erro ao gerar prompt. Tente novamente.');
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const savePrompt = () => {
    if (!result) return;
    addPrompt({
      title: `Prompt - ${wizard.objective || 'Projeto'} ${wizard.niche || ''}`,
      content: result,
      rawPrompt: result,
      objective: wizard.objective || 'landing-page',
      niche: wizard.niche || 'tech',
      style: wizard.style || 'minimalista',
      platform: wizard.platform || 'lovable',
      language: wizard.language,
      technologies: wizard.technologies,
      animations: wizard.animations,
      structures: wizard.structures,
      functionalities: wizard.functionalities,
      font: wizard.font,
      colorScheme: wizard.colorScheme,
      tokens: tokenCount,
      userId: user?.id || '',
      status: 'generated',
    });
    setSaved(true);
    toast.success('Prompt salvo com sucesso!');
    setTimeout(() => setSaved(false), 2000);
  };

  const improveWithAI = async () => {
    if (!result || improving) return;
    setImproving(true);
    try {
      const improved = await nvidiaAPI.improvePrompt(result);
      setResult(improved);
    } catch (err: any) {
      toast.error('Erro ao melhorar prompt: ' + (err?.message || 'Tente novamente'));
    } finally {
      setImproving(false);
    }
  };

  const correctWithAI = async () => {
    if (!result || correcting) return;
    setCorrecting(true);
    try {
      const corrected = await nvidiaAPI.correctPrompt(result);
      setResult(corrected);
    } catch (err: any) {
      toast.error('Erro ao corrigir prompt: ' + (err?.message || 'Tente novamente'));
    } finally {
      setCorrecting(false);
    }
  };

  const generateAlternativeVersion = async () => {
    if (!result || alternating) return;
    setAlternating(true);
    try {
      const alt = await nvidiaAPI.generateAlternative(result);
      setResult(alt);
    } catch (err: any) {
      toast.error('Erro ao gerar versão alternativa: ' + (err?.message || 'Tente novamente'));
    } finally {
      setAlternating(false);
    }
  };

  const exportAs = async (format: 'txt' | 'md' | 'pdf') => {
    if (format === 'pdf') {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      const lines = doc.splitTextToSize(result, 180);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      let y = 20;
      for (const line of lines) {
        if (y > 275) { doc.addPage(); y = 20; }
        doc.text(line, 15, y);
        y += 6;
      }
      doc.save(`prompt-${wizard.objective || 'projeto'}.pdf`);
    } else {
      const blob = new Blob([result], { type: format === 'md' ? 'text/markdown' : 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = `prompt-${wizard.objective || 'projeto'}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-white">{'Gerar Prompt'}</h3>
        <p className="text-zinc-400 mt-1">{'A IA vai criar um prompt profissional baseado nas suas escolhas'}</p>
      </div>

      {!generating && !result && (
        <div className="flex justify-center">
          {user?.plan === 'none' ? (
            <UpgradeBlock message="Assine um plano para gerar prompts ilimitados." />
          ) : (
            <button onClick={generatePrompt} className="btn-primary flex items-center gap-2 px-8 py-4 text-lg">
              <Zap size={20} />
              {'Gerar Prompt Agora'}
            </button>
          )}
        </div>
      )}

      {generating && (
        <div className="max-w-xl mx-auto bg-[#1a1a2e] rounded-xl border border-white/5 overflow-hidden shadow-2xl font-mono">
          <div className="flex items-center gap-2 px-4 py-3 bg-black/40 border-b border-white/5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
            <span className="text-xs text-zinc-600 ml-2">{'promptforge - gerador - bash'}</span>
          </div>
          <div className="p-5 space-y-1 min-h-[200px]">
            {ANIMATION_STAGES.slice(0, stage + 1).map((s, i) => {
              const isCommand = !s.text.startsWith('  ');
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.15 }}
                  className={cn(
                    'text-sm leading-relaxed',
                    isCommand ? 'text-emerald-400' : 'text-zinc-300'
                  )}
                >
                  {isCommand ? (
                    <span>
                      <span className="text-pink-400">$</span>{' '}
                      <span className="text-emerald-300">{s.text}</span>
                    </span>
                  ) : (
                    <span className="pl-4">{s.text}</span>
                  )}
                  {i === stage && isCommand && (
                    <span className="inline-block w-2 h-4 bg-emerald-400 ml-1 animate-pulse" />
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {error && !generating && !result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto">
          <div className="glass-card p-6 text-center border-red-500/20">
            <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-red-500/10 flex items-center justify-center">
              <X size={24} className="text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{'Limite Atingido'}</h3>
            <p className="text-sm text-zinc-400 mb-4">{error}</p>
            <button onClick={() => navigate('/dashboard/plans')} className="btn-primary flex items-center gap-2 mx-auto">
              <Crown size={16} /> {'Fazer Upgrade'}
            </button>
            <button onClick={() => { setError(''); setResult(''); }} className="block mx-auto mt-3 text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
              {'Tentar novamente'}
            </button>
          </div>
        </motion.div>
      )}

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="glass-card p-6 sm:p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 size={32} className="text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-1">{'Prompt Gerado com Sucesso!'}</h3>
            <p className="text-sm text-zinc-400 mb-6">{'Seu prompt esta pronto para ser usado nas plataformas abaixo'}</p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
              <button onClick={() => { copyToClipboard(); window.open('https://lovable.dev', '_blank'); }} className="btn-primary flex items-center justify-center gap-2 px-6 py-3">
                <ExternalLink size={18} /> {'Abrir no Lovable'}
              </button>
              <button onClick={() => { copyToClipboard(); window.open('https://claude.ai/new', '_blank'); }} className="btn-glass flex items-center justify-center gap-2 px-6 py-3 border-purple-500/30 text-purple-300 hover:bg-purple-500/10">
                <ExternalLink size={18} /> {'Abrir no Claude'}
              </button>
            </div>
          </div>

          <details className="glass-card group">
            <summary className="p-3 sm:p-4 text-sm text-zinc-400 hover:text-white cursor-pointer transition-colors select-none flex items-center gap-2">
              <ChevronRight size={14} className="transition-transform group-open:rotate-90" />
              {'Ver prompt completo'} ({result.length} {'caracteres'})
            </summary>
            <div className="px-3 sm:px-4 pb-3 sm:pb-4 max-h-[250px] overflow-y-auto border-t border-white/5 pt-3">
              <pre className="text-xs sm:text-sm text-zinc-300 whitespace-pre-wrap font-mono leading-relaxed">{result}</pre>
            </div>
          </details>

          <div className="flex flex-wrap gap-2 justify-center">
            <button onClick={copyToClipboard} className="btn-glass flex items-center justify-center gap-2 text-sm px-3 py-2">
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copiado!' : 'Copiar Prompt'}
            </button>
            <button onClick={() => wizard.setStep(14)} className="btn-glass flex items-center justify-center gap-2 text-sm px-3 py-2">
              <Edit3 size={16} /> {'Editar'}
            </button>
            <button onClick={generatePrompt} className="btn-glass flex items-center justify-center gap-2 text-sm px-3 py-2" disabled={generating}>
              <RotateCcw size={16} /> {'Regenerar'}
            </button>
            <button onClick={() => { setFavorited(!favorited); }} className={cn('btn-glass flex items-center justify-center gap-2 text-sm px-3 py-2', favorited && 'text-pink-400 border-pink-500/30')}>
              <Heart size={16} fill={favorited ? 'currentColor' : 'none'} /> {favorited ? 'Favoritado' : 'Favoritar'}
            </button>
            <button onClick={savePrompt} className={cn('btn-glass flex items-center justify-center gap-2 text-sm px-3 py-2', saved && 'text-emerald-400 border-emerald-500/30')}>
              {saved ? <Check size={16} /> : <Save size={16} />}
              {saved ? 'Salvo!' : 'Salvar'}
            </button>
            <button onClick={() => { copyToClipboard(); }} className="btn-glass flex items-center justify-center gap-2 text-sm px-3 py-2">
              <Share2 size={16} /> {'Compartilhar'}
            </button>
            {isPro && (
              <button onClick={improveWithAI} disabled={improving} className="btn-glass flex items-center justify-center gap-2 text-sm px-3 py-2 text-emerald-300 border-emerald-500/20 hover:bg-emerald-500/10">
                {improving ? <RotateCcw size={16} className="animate-spin" /> : <Sparkles size={16} />}
                {improving ? 'Melhorando...' : 'Melhorar com IA'}
              </button>
            )}
            {isPro && (
              <button onClick={correctWithAI} disabled={correcting} className="btn-glass flex items-center justify-center gap-2 text-sm px-3 py-2 text-amber-300 border-amber-500/20 hover:bg-amber-500/10">
                {correcting ? <RotateCcw size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                {correcting ? 'Corrigindo...' : 'Corrigir com IA'}
              </button>
            )}
            {isPro && (
              <button onClick={generateAlternativeVersion} disabled={alternating} className="btn-glass flex items-center justify-center gap-2 text-sm px-3 py-2 text-blue-300 border-blue-500/20 hover:bg-blue-500/10">
                {alternating ? <RotateCcw size={16} className="animate-spin" /> : <Copy size={16} />}
                {alternating ? 'Gerando...' : 'Versão Alternativa'}
              </button>
            )}
            <div className="relative col-span-2 sm:col-auto">
              <button onClick={() => setShowExport(!showExport)} className="btn-glass flex items-center justify-center gap-2 text-sm px-3 py-2 w-full">
                <FileDown size={16} /> {'Exportar'}
              </button>
              {showExport && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-10">
                  <div className="glass-card p-1 flex">
                    <button onClick={() => { exportAs('txt'); setShowExport(false); }} className="px-3 py-2 text-xs text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors">TXT</button>
                    <button onClick={() => { exportAs('md'); setShowExport(false); }} className="px-3 py-2 text-xs text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors">MD</button>
                    {isPro ? (
                      <button onClick={() => { exportAs('pdf'); setShowExport(false); }} className="px-3 py-2 text-xs text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors">PDF</button>
                    ) : (
                      <button onClick={() => { navigate('/dashboard/plans'); setShowExport(false); }} className="px-3 py-2 text-xs text-amber-400 hover:text-amber-300 rounded-lg transition-colors flex items-center gap-1">
                        <Crown size={10} /> PDF
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3 mt-2">
            <button onClick={() => navigate('/dashboard/history')} className="btn-glass flex items-center justify-center gap-2 text-sm py-3 sm:py-2">
              {'Ver Historico'}
            </button>
            <button onClick={() => { wizard.resetWizard(); setResult(''); }} className="btn-glass flex items-center justify-center gap-2 text-sm py-3 sm:py-2">
              {'Novo Prompt'}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

const stepComponents: Record<number, React.FC> = {
  1: NicheStep, 2: CompanyStep, 3: ObjectiveStep, 4: AudienceStep,
  5: StyleStep, 6: ColorsStep, 7: FontStep, 8: AnimationsStep,
  9: StructureStep, 10: FeaturesStep, 11: TechStep, 12: PlatformStep,
  13: BriefingStep, 14: ReviewStep, 15: GenerateStep,
};

export default function WizardPage() {
  const wizard = useWizardStore();
  const navigate = useNavigate();
  const [direction, setDirection] = useState(0);
  const StepComponent = stepComponents[wizard.currentStep];
  const stepKeyMap: Record<number, string> = {
    1: 'Nicho', 2: 'Empresa', 3: 'Objetivo', 4: 'Publico',
    5: 'Estilo', 6: 'Cores', 7: 'Fonte', 8: 'Animacoes',
    9: 'Estrutura', 10: 'Funcionalidades', 11: 'Tecnologias', 12: 'Plataforma',
    13: 'Briefing', 14: 'Revisao', 15: 'Gerar',
  };

  const goNext = () => {
    setDirection(1);
    wizard.nextStep();
  };

  const goPrev = () => {
    setDirection(-1);
    wizard.prevStep();
  };

  const progress = ((wizard.currentStep - 1) / (wizard.totalSteps - 1)) * 100;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center justify-between mb-2">
          <button onClick={() => wizard.currentStep > 1 ? goPrev() : navigate('/dashboard')} className="text-zinc-400 hover:text-white transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center">
            <ChevronLeft size={20} />
          </button>
          <span className="text-xs sm:text-sm text-zinc-500">
            {'Passo'} {wizard.currentStep} {'de'} {wizard.totalSteps}
          </span>
          <div className="w-[44px]" />
        </div>
        <div className="h-1 sm:h-1.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          />
        </div>
        <div className="flex gap-1 mt-3 overflow-x-auto pb-2 scrollbar-none -mx-1 sm:mx-0 px-1 sm:px-0">
          {WIZARD_STEPS.map((step) => {
            const Icon = iconMap[step.icon] || Layers;
            const isActive = wizard.currentStep === step.id;
            const isComplete = wizard.completedSteps.includes(step.id);
            return (
              <button
                key={step.id}
                onClick={() => { setDirection(step.id > wizard.currentStep ? 1 : -1); wizard.setStep(step.id); }}
                className={cn(
                  'flex items-center gap-1 px-1.5 xs:px-2 sm:px-3.5 py-1.5 sm:py-1.5 rounded-lg text-[10px] whitespace-nowrap transition-all flex-shrink-0 min-h-[32px] xs:min-h-[36px]',
                  isActive ? 'bg-purple-500/15 text-purple-400 border border-purple-500/20' :
                  isComplete ? 'text-emerald-400' : 'text-zinc-600'
                )}
              >
                <Icon size={12} className="xs:hidden" />
                <Icon size={14} className="hidden xs:block sm:hidden" />
                <Icon size={12} className="hidden sm:block" />
                <span className="hidden xs:inline">{stepKeyMap[step.id]}</span>
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={wizard.currentStep}
          custom={direction}
          variants={stepVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="glass-card p-4 sm:p-6 md:p-8 min-h-[300px] sm:min-h-[400px]"
        >
          {StepComponent && <StepComponent />}
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between mt-4 sm:mt-6">
        <button
          onClick={goPrev}
          disabled={wizard.currentStep === 1}
          className={cn('btn-glass flex items-center gap-2 px-4 py-2.5 sm:py-2 text-sm', wizard.currentStep === 1 && 'opacity-30 cursor-not-allowed')}
        >
          <ChevronLeft size={18} /> {'Anterior'}
        </button>
        {wizard.currentStep < wizard.totalSteps ? (
          <button onClick={goNext} className="btn-primary flex items-center gap-2 px-5 py-2.5 sm:py-2 text-sm">
            {'Proximo'} <ChevronRight size={18} />
          </button>
        ) : null}
      </div>
    </div>
  );
}


