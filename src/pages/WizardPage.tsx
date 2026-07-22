import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronDown, Copy, Save, RotateCcw,
  Upload, Plus, X, FileDown, Zap,
  Layers, Palette, Settings2,
  FileText, CheckCircle2, Crown, Globe,
  LayoutDashboard, Info, Star, Briefcase, Package, Rocket,
  Images, Image, FolderOpen, Film, Users, Handshake, MessageSquare,
  BarChart3, Heart, DollarSign, Gift, Calendar, Mail, Target,
  HelpCircle, UserCircle, LogIn, KeyRound,
  Bell, Search, Filter, ArrowUpDown, Download,
  MessageCircle, Share2, Moon, Languages,
  Code, Database, CreditCard, Smartphone, Settings, Lock, GraduationCap,
  UtensilsCrossed, Hotel, Stethoscope, Megaphone, PartyPopper,
  User, MapPin,
} from 'lucide-react';
import { useWizardStore } from '@/store/wizardStore';
import { usePromptStore } from '@/store/promptStore';
import { useAuthStore } from '@/store/authStore';
import { UpgradeBlock } from '@/components/UpgradeBlock';
import { nvidiaAPI } from '@/services/api';
import {
  NICHES, STYLES, PLATFORMS, FONTS, STRUCTURES,
  FUNCTIONALITIES, TECHNOLOGIES, ANIMATIONS_LIST, OBJECTIVES,
} from '@/lib/constants';
import { cn, generateId } from '@/lib/utils';
import type {
  AnimationType, SiteStructure, Functionality,
} from '@/types';

// ── Accordion Section ──────────────────────────────────────────────
function Section({
  icon, title, defaultOpen = false, children,
}: {
  icon: React.ReactNode; title: string; defaultOpen?: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-white/5 rounded-2xl overflow-hidden bg-white/[0.02]">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-white/[0.03] transition-colors"
      >
        <span className="text-purple-400">{icon}</span>
        <span className="font-semibold text-white text-sm flex-1 text-left">{title}</span>
        <ChevronDown
          size={16}
          className={cn('text-zinc-500 transition-transform duration-200', open && 'rotate-180')}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          >
            <div className="px-5 pb-5 pt-1 border-t border-white/5">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Icon Map (for STRUCTURES/FUNCTIONALITIES icons) ────────────────
const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard, Info, Star, Briefcase, Package, Rocket,
  Images, Image, FolderOpen, Film, Users, Handshake, MessageSquare,
  BarChart3, Heart, DollarSign, Gift, Calendar, Mail, Target,
  HelpCircle, FileText, UserCircle, LogIn, KeyRound, Globe,
  Bell, Search, Filter, ArrowUpDown, Upload, Download,
  FileDown, MessageCircle, Share2, Moon, Languages,
  Code, Database, CreditCard, Smartphone, Settings, Lock, GraduationCap,
  UtensilsCrossed, Hotel, Stethoscope, Megaphone, PartyPopper,
  User, MapPin,
};

// ── Main Component ─────────────────────────────────────────────────
export default function WizardPage() {
  const wizard = useWizardStore();
  const navigate = useNavigate();
  const { addPrompt } = usePromptStore();
  const { user } = useAuthStore();
  const isPro = user?.plan === 'pro';
  const isFree = !user?.plan || user?.plan === 'none';

  // ── Generation state ──
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [terminalDone, setTerminalDone] = useState(false);
  const [showPromptText, setShowPromptText] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  // ── Reference files ──
  const [referenceUrls, setReferenceUrls] = useState<string[]>([]);
  const [newUrl, setNewUrl] = useState('');
  const [referenceFiles, setReferenceFiles] = useState<File[]>([]);

  // ── Creative Direction constants ──
  const CREATIVE_DIRECTION = `# DIREÇÃO CRIATIVA

O objetivo deste projeto não é apenas criar um site funcional.
O objetivo é criar uma experiência digital memorável.

Cada página deve causar impacto visual nos primeiros segundos.
Cada seção deve surpreender o usuário com composição, ritmo visual e excelente hierarquia.

Evite layouts previsíveis, comuns ou parecidos com templates gratuitos.
Questione constantemente se existe uma solução mais elegante, moderna e criativa.
Priorize qualidade visual acima da quantidade de elementos.
Utilize bastante espaço em branco.
Crie contraste entre seções.
Misture diferentes tamanhos de componentes.
Utilize imagens de alto impacto.
Valorize tipografia.
Use animações apenas quando elas melhorarem a experiência.
Toda decisão visual deve possuir propósito.
O projeto deve parecer criado por um estúdio de design premiado.

Antes de finalizar o projeto, revise toda a interface procurando oportunidades de deixá-la mais bonita, mais elegante e mais impactante.
Nunca entregue a primeira solução.
Sempre busque uma versão melhor.

A IA não deve simplesmente montar um site.
Ela deve criar uma experiência.
Cada seção precisa ter personalidade própria.
O visitante nunca deve sentir que está navegando por um template.

Antes de gerar qualquer layout, imagine que esse projeto será enviado para uma competição internacional de design.
Cada detalhe precisa demonstrar refinamento.
Cada componente deve parecer desenhado por um designer experiente.
Evite qualquer aparência genérica.

A beleza visual é prioridade.
Se existirem duas soluções igualmente funcionais, escolha sempre a mais elegante, mais sofisticada e mais memorável.
O objetivo é gerar reação emocional positiva imediatamente.`;

  const WOW_MODE_EXTRA = `# MODO WOW ATIVADO

Pense como um diretor de arte renomado.
Busque originalidade em vez de templates prontos.
Priorize impacto visual sem sacrificar usabilidade.
Revisar cada seção procurando oportunidades de torná-la mais marcante.
Entregue um resultado que pareça digno de um prêmio de design.
Cada componente deve ter personalidade e contar uma história.
O visitante deve sentir emoção ao navegar.
Nada de genérico. Tudo precisa ser único e memorável.`;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Custom inputs ──
  const [showCustomNiche, setShowCustomNiche] = useState(false);
  const [nicheFilter, setNicheFilter] = useState('');

  // ── Filtered niches ──
  let visibleNiches = NICHES;
  if (nicheFilter) {
    visibleNiches = visibleNiches.filter(n =>
      n.label.toLowerCase().includes(nicheFilter.toLowerCase())
    );
  }
  if (!isPro) {
    visibleNiches = visibleNiches.filter(n => !n.premium);
  }

  // ── Build structured JSON from form data ──
  const buildProjectJSON = () => {
    const objective = OBJECTIVES.find(o => o.id === wizard.objective);
    const style = STYLES.find(s => s.id === wizard.style);
    const platform = PLATFORMS.find(p => p.id === wizard.platform);
    const font = FONTS.find(f => f.id === wizard.font);

    const animLabels = wizard.animations
      .map(a => ANIMATIONS_LIST.find(x => x.id === a))
      .filter(Boolean)
      .map(a => ({ id: a!.id, label: a!.label, description: a!.description }));

    const structLabels = wizard.structures
      .map(s => STRUCTURES.find(x => x.id === s))
      .filter(Boolean)
      .map(s => ({ id: s!.id, label: s!.label, description: s!.description }));

    const funcLabels = wizard.functionalities
      .map(f => FUNCTIONALITIES.find(x => x.id === f))
      .filter(Boolean)
      .map(f => ({ id: f!.id, label: f!.label }));

    const techLabels = wizard.technologies
      .map(t => TECHNOLOGIES.find(x => x.id === t))
      .filter(Boolean)
      .map(t => ({ id: t!.id, label: t!.label }));

    const json: Record<string, any> = {};
    if (wizard.companyName) json.empresa = wizard.companyName;
    if (wizard.niche || wizard.customNiche) json.nicho = wizard.niche || wizard.customNiche;
    if (objective) json.objetivo = { id: objective.id, label: objective.label, description: objective.description };
    if (wizard.targetAudience) json.publicoAlvo = wizard.targetAudience;
    if (platform) json.plataforma = { id: platform.id, label: platform.label };
    if (style) json.estiloVisual = { id: style.id, label: style.label, description: style.description };
    json.paleta = { primaria: wizard.primaryColor, secundaria: wizard.secondaryColor };
    if (font) json.tipografia = { id: font.id, label: font.label };
    if (animLabels.length > 0) json.animacoes = animLabels;
    if (structLabels.length > 0) json.estrutura = structLabels;
    if (funcLabels.length > 0) json.funcionalidades = funcLabels;
    if (techLabels.length > 0) json.tecnologias = techLabels;
    if (wizard.description) json.briefing = wizard.description;
    if (wizard.additionalContext) json.contextoAdicional = wizard.additionalContext;
    if (referenceUrls.length > 0) json.referencias = referenceUrls;

    const contato: Record<string, string> = {};
    if (wizard.whatsapp) contato.whatsapp = wizard.whatsapp;
    if (wizard.phone) contato.telefone = wizard.phone;
    if (wizard.email) contato.email = wizard.email;
    if (wizard.instagram) contato.instagram = wizard.instagram;
    if (wizard.facebook) contato.facebook = wizard.facebook;
    if (wizard.address) contato.endereco = wizard.address;
    if (wizard.currentSite) contato.siteAtual = wizard.currentSite;
    if (Object.keys(contato).length > 0) json.contato = contato;

    return json;
  };

  // ── Terminal animation steps ──
  const TERMINAL_STEPS_BASE = [
    '$ promptforge init',
    '→ Analisando dados do projeto...',
    '→ Montando JSON estruturado...',
    '→ Gerando briefing base...',
  ];

  const TERMINAL_STEPS_PRO = [
    '→ Enviando para IA...',
    '→ Processando contexto do nicho...',
    '→ Melhorando prompt com IA...',
    '✓ Briefing profissional pronto!',
  ];

  const TERMINAL_STEPS_FREE = [
    '✓ Briefing pronto!',
  ];

  // ── Generate prompt ──
  const handleGenerate = async () => {
    setGenerating(true);
    setShowTerminal(true);
    setTerminalLines([]);
    setTerminalDone(false);
    setError('');
    setResult('');

    const proSteps = isPro ? TERMINAL_STEPS_PRO : TERMINAL_STEPS_FREE;
    const wowStep = wizard.wowMode ? ['✨ Modo WOW ativo — buscando impacto visual máximo...'] : [];
    const allSteps = [...TERMINAL_STEPS_BASE, ...wowStep, ...proSteps];

    // ── Animate terminal lines ──
    for (let i = 0; i < allSteps.length; i++) {
      await new Promise(r => setTimeout(r, 500 + Math.random() * 400));
      setTerminalLines(prev => [...prev, allSteps[i]]);
    }

    await new Promise(r => setTimeout(r, 400));

    // ── Generate base briefing locally ──
    const projectJSON = buildProjectJSON();
    let briefing = generateLocalBriefing(projectJSON);

    // ── If Pro, improve with AI ──
    if (isPro) {
      try {
        const improved = await nvidiaAPI.improvePrompt(briefing);
        if (improved) briefing = improved;
      } catch {
        // fallback: keep the local version
      }
    }

    setResult(briefing);
    setTerminalDone(true);
    await new Promise(r => setTimeout(r, 600));
    setShowTerminal(false);
    setShowResult(true);
    setGenerating(false);
    toast.success(isPro ? 'Briefing profissional gerado!' : 'Briefing gerado!');
  };

  // ── Local fallback briefing generator ──
  const generateLocalBriefing = (data: Record<string, any>): string => {
    const lines: string[] = [];

    lines.push(`# BRIEFING PROFISSIONAL — ${data.empresa || 'Projeto'}`);
    lines.push('');

    if (data.empresa || data.nicho) {
      lines.push('## Visão Geral');
      if (data.empresa) lines.push(`**Empresa:** ${data.empresa}`);
      if (data.nicho) lines.push(`**Nicho:** ${data.nicho}`);
      lines.push('');
    }

    if (data.contato && Object.keys(data.contato).length > 0) {
      lines.push('## Contato');
      if (data.contato.whatsapp) lines.push(`- **WhatsApp:** ${data.contato.whatsapp}`);
      if (data.contato.telefone) lines.push(`- **Telefone:** ${data.contato.telefone}`);
      if (data.contato.email) lines.push(`- **E-mail:** ${data.contato.email}`);
      if (data.contato.instagram) lines.push(`- **Instagram:** ${data.contato.instagram}`);
      if (data.contato.facebook) lines.push(`- **Facebook:** ${data.contato.facebook}`);
      if (data.contato.endereco) lines.push(`- **Endereço:** ${data.contato.endereco}`);
      if (data.contato.siteAtual) lines.push(`- **Site Atual:** ${data.contato.siteAtual}`);
      lines.push('');
    }

    if (data.objetivo) {
      lines.push('## Objetivo');
      lines.push(`${data.objetivo.label} — ${data.objetivo.description}`);
      lines.push('');
    }

    if (data.briefing) {
      lines.push('## Briefing');
      lines.push(data.briefing);
      lines.push('');
    }

    if (data.publicoAlvo) {
      lines.push('## Público-Alvo');
      lines.push(data.publicoAlvo);
      lines.push('');
    }

    if (data.plataforma) {
      lines.push('## Plataforma');
      lines.push(`**${data.plataforma.label}**`);
      lines.push('');
    }

    if (data.estiloVisual || data.paleta || data.tipografia) {
      lines.push('## Design Visual');
      if (data.estiloVisual) lines.push(`- **Estilo:** ${data.estiloVisual.label} — ${data.estiloVisual.description}`);
      if (data.paleta) lines.push(`- **Cor Primária:** ${data.paleta.primaria} | **Cor Secundária:** ${data.paleta.secundaria}`);
      if (data.tipografia) lines.push(`- **Tipografia:** ${data.tipografia.label}`);
      lines.push('');
    }

    if (data.animacoes && data.animacoes.length > 0) {
      lines.push('## Animações');
      data.animacoes.forEach((a: any) => lines.push(`- **${a.label}:** ${a.description}`));
      lines.push('');
    }

    if (data.estrutura && data.estrutura.length > 0) {
      lines.push('## Estrutura do Site');
      data.estrutura.forEach((s: any) => lines.push(`- **${s.label}:** ${s.description}`));
      lines.push('');
    }

    if (data.funcionalidades && data.funcionalidades.length > 0) {
      lines.push('## Funcionalidades');
      data.funcionalidades.forEach((f: any) => lines.push(`- ${f.label}`));
      lines.push('');
    }

    if (data.tecnologias && data.tecnologias.length > 0) {
      lines.push('## Tecnologias');
      lines.push(data.tecnologias.map((t: any) => t.label).join(', '));
      lines.push('');
    }

    if (data.referencias && data.referencias.length > 0) {
      lines.push('## Referências');
      data.referencias.forEach((r: string) => lines.push(`- ${r}`));
      lines.push('');
    }

    if (data.contextoAdicional) {
      lines.push('## Observações Adicionais');
      lines.push(data.contextoAdicional);
      lines.push('');
    }

    lines.push(CREATIVE_DIRECTION);
    lines.push('');
    if (wizard.wowMode) {
      lines.push(WOW_MODE_EXTRA);
      lines.push('');
    }

    return lines.join('\n');
  };

  // ── Copy ──
  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    toast.success('Copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Save ──
  const savePrompt = () => {
    addPrompt({
      title: `${wizard.niche || wizard.customNiche || 'Prompt'} - ${wizard.companyName || 'Projeto'}`,
      content: result,
      objective: wizard.objective as any,
      niche: wizard.niche as any,
      style: wizard.style as any,
      platform: wizard.platform as any,
      language: wizard.language as any,
      technologies: wizard.technologies,
      animations: wizard.animations,
      structures: wizard.structures,
      functionalities: wizard.functionalities,
      font: wizard.font,
      colorScheme: wizard.colorScheme,
      status: 'generated',
    });
    toast.success('Prompt salvo!');
  };

  // ── Export ──
  const exportAs = (format: string) => {
    const blob = new Blob([result], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prompt-${generateId()}.${format === 'txt' ? 'txt' : 'md'}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exportado como ${format.toUpperCase()}`);
  };

  // ── Add reference URL ──
  const addReferenceUrl = () => {
    if (newUrl.trim()) {
      setReferenceUrls([...referenceUrls, newUrl.trim()]);
      setNewUrl('');
    }
  };

  // ── Optimize with AI ──
  const handleOptimize = async () => {
    if (!isPro) {
      setShowUpgrade(true);
      return;
    }
    setOptimizing(true);
    try {
      const improved = await nvidiaAPI.improvePrompt(result);
      if (improved) {
        setResult(improved);
        toast.success('Prompt otimizado com IA!');
      }
    } catch {
      toast.error('Erro ao otimizar prompt');
    } finally {
      setOptimizing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-3 pb-24">
      {/* ── Header ── */}
      <div className="flex items-center gap-3 py-3">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-zinc-500 hover:text-white transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-white">Novo Prompt</h1>
      </div>

      {/* ── Section 1: Projeto ── */}
      <Section icon={<Layers size={18} />} title="Projeto" defaultOpen={true}>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-zinc-400 mb-1.5 block">Nome da Empresa</label>
            <input
              type="text"
              value={wizard.companyName || ''}
              onChange={(e) => wizard.updateField('companyName', e.target.value)}
              placeholder="Ex: Barber Shop, Clínica Saúde+, TechFlow"
              className="input-glass"
            />
          </div>

          <div>
            <label className="text-xs text-zinc-400 mb-1.5 block">Nicho</label>
            <input
              type="text"
              placeholder="Buscar nicho..."
              value={nicheFilter}
              onChange={(e) => setNicheFilter(e.target.value)}
              className="input-glass mb-2"
            />
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-1.5 max-h-[200px] overflow-y-auto pr-1">
              {visibleNiches.map((n) => {
                const isSelected = wizard.niche === n.label;
                return (
                  <button
                    key={n.label}
                    onClick={() => {
                      wizard.updateField('niche', isSelected ? '' : n.label);
                      setShowCustomNiche(false);
                    }}
                    className={cn(
                      'p-2 rounded-lg text-left transition-all border',
                      isSelected
                        ? 'border-purple-500/40 bg-purple-500/10'
                        : 'border-white/5 hover:border-white/10'
                    )}
                  >
                    <span className="text-sm">{n.emoji}</span>
                    <p className="text-[10px] sm:text-xs text-white mt-0.5 truncate">{n.label}</p>
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setShowCustomNiche(!showCustomNiche)}
              className="text-xs text-purple-400 hover:text-purple-300 mt-2 flex items-center gap-1"
            >
              <Plus size={12} /> Personalizado
            </button>
            {showCustomNiche && (
              <input
                type="text"
                placeholder="Digite seu nicho"
                value={wizard.customNiche || ''}
                onChange={(e) => wizard.updateField('customNiche', e.target.value)}
                className="input-glass mt-2"
              />
            )}
          </div>

          <div>
            <label className="text-xs text-zinc-400 mb-1.5 block">Objetivo</label>
            <div className="flex flex-wrap gap-1.5">
              {OBJECTIVES.map((obj) => {
                const isSelected = wizard.objective === obj.id;
                const Icon = iconMap[obj.icon] || FileText;
                return (
                  <button
                    key={obj.id}
                    onClick={() => wizard.updateField('objective', isSelected ? '' : obj.id)}
                    className={cn(
                      'px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border flex items-center gap-1',
                      isSelected
                        ? 'bg-purple-500/15 border-purple-500/40 text-purple-300'
                        : 'border-white/5 text-zinc-400 hover:border-white/10'
                    )}
                  >
                    <Icon size={12} />
                    {obj.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-xs text-zinc-400 mb-1.5 block">Plataforma</label>
            <div className="flex flex-wrap gap-1.5">
              {PLATFORMS.map((p) => {
                const isSelected = wizard.platform === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => wizard.updateField('platform', p.id)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
                      isSelected
                        ? 'bg-purple-500/15 border-purple-500/40 text-purple-300'
                        : 'border-white/5 text-zinc-400 hover:border-white/10'
                    )}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Dados da Loja ── */}
          <div className="border-t border-white/5 pt-4">
            <p className="text-xs text-zinc-500 mb-3 flex items-center gap-1.5">
              <Globe size={12} /> Dados da Loja <span className="text-zinc-700">(opcional)</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-zinc-500 mb-1 block">WhatsApp</label>
                <input
                  type="text"
                  value={wizard.whatsapp || ''}
                  onChange={(e) => wizard.updateField('whatsapp', e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="input-glass"
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 mb-1 block">Instagram</label>
                <input
                  type="text"
                  value={wizard.instagram || ''}
                  onChange={(e) => wizard.updateField('instagram', e.target.value)}
                  placeholder="@suaempresa"
                  className="input-glass"
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 mb-1 block">Telefone</label>
                <input
                  type="text"
                  value={wizard.phone || ''}
                  onChange={(e) => wizard.updateField('phone', e.target.value)}
                  placeholder="(11) 3333-3333"
                  className="input-glass"
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 mb-1 block">E-mail</label>
                <input
                  type="email"
                  value={wizard.email || ''}
                  onChange={(e) => wizard.updateField('email', e.target.value)}
                  placeholder="contato@empresa.com"
                  className="input-glass"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-[10px] text-zinc-500 mb-1 block">Endereço</label>
                <input
                  type="text"
                  value={wizard.address || ''}
                  onChange={(e) => wizard.updateField('address', e.target.value)}
                  placeholder="Rua Exemplo, 123 - Centro, São Paulo - SP"
                  className="input-glass"
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 mb-1 block">Facebook</label>
                <input
                  type="text"
                  value={wizard.facebook || ''}
                  onChange={(e) => wizard.updateField('facebook', e.target.value)}
                  placeholder="facebook.com/suaempresa"
                  className="input-glass"
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 mb-1 block">Site Atual</label>
                <input
                  type="text"
                  value={wizard.currentSite || ''}
                  onChange={(e) => wizard.updateField('currentSite', e.target.value)}
                  placeholder="https://seusite.com"
                  className="input-glass"
                />
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Section 2: Design ── */}
      <Section icon={<Palette size={18} />} title="Design">
        <div className="space-y-5">
          {/* Estilo Visual */}
          <div>
            <label className="text-xs text-zinc-400 mb-2 block">Estilo Visual</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
              {STYLES.map((s) => {
                const isSelected = wizard.style === s.id;
                const isLocked = s.premium && !isPro;
                return (
                  <button
                    key={s.id}
                    onClick={() => !isLocked && wizard.updateField('style', isSelected ? '' : s.id)}
                    className={cn(
                      'p-2.5 rounded-lg text-left transition-all border',
                      isSelected
                        ? 'border-purple-500/40 bg-purple-500/10'
                        : 'border-white/5 hover:border-white/10',
                      isLocked && 'opacity-40 cursor-not-allowed'
                    )}
                  >
                    <span className="text-sm">{s.icon}</span>
                    <p className="text-[10px] sm:text-xs text-white mt-1">{s.label}</p>
                    {isLocked && <Crown size={8} className="text-amber-400 mt-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cores */}
          <div>
            <label className="text-xs text-zinc-400 mb-2 block">Cores</label>
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-zinc-500">Primária</span>
                <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-white/10">
                  <div className="absolute inset-0" style={{ backgroundColor: wizard.primaryColor }} />
                  <input
                    type="color"
                    value={wizard.primaryColor}
                    onChange={(e) => wizard.updateField('primaryColor', e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-zinc-500">Secundária</span>
                <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-white/10">
                  <div className="absolute inset-0" style={{ backgroundColor: wizard.secondaryColor }} />
                  <input
                    type="color"
                    value={wizard.secondaryColor}
                    onChange={(e) => wizard.updateField('secondaryColor', e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>
              <div className="flex gap-1">
                {['#A855F7', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'].map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      const pairs: Record<string, string> = {
                        '#A855F7': '#EC4899', '#3B82F6': '#06B6D4', '#10B981': '#34D399',
                        '#F59E0B': '#EF4444', '#EF4444': '#F97316', '#EC4899': '#A855F7',
                      };
                      wizard.updateField('primaryColor', c);
                      wizard.updateField('secondaryColor', pairs[c] || '#D946EF');
                    }}
                    className="w-6 h-6 rounded-md border border-white/10 hover:scale-110 transition-transform"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Tipografia */}
          <div>
            <label className="text-xs text-zinc-400 mb-2 block">Tipografia</label>
            <div className="flex flex-wrap gap-1.5">
              {FONTS.map((f) => {
                const isSelected = wizard.font === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => wizard.updateField('font', f.id)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
                      isSelected
                        ? 'bg-purple-500/15 border-purple-500/40 text-purple-300'
                        : 'border-white/5 text-zinc-400 hover:border-white/10'
                    )}
                    style={{ fontFamily: f.id }}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Animações */}
          <div>
            <label className="text-xs text-zinc-400 mb-2 block">Animações</label>
            <div className="flex flex-wrap gap-1.5">
              {ANIMATIONS_LIST.filter(a => !a.premium || isPro).map((a) => {
                const isSelected = wizard.animations.includes(a.id as AnimationType);
                return (
                  <button
                    key={a.id}
                    onClick={() => wizard.toggleAnimation(a.id as AnimationType)}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-medium transition-all border',
                      isSelected
                        ? 'bg-purple-500/15 border-purple-500/40 text-purple-300'
                        : 'border-white/5 text-zinc-500 hover:border-white/10 hover:text-zinc-400'
                    )}
                  >
                    {a.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Referências */}
          <div>
            <label className="text-xs text-zinc-400 mb-2 block">Referências</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="https://site-referencia.com"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addReferenceUrl()}
                className="input-glass flex-1"
              />
              <button onClick={addReferenceUrl} className="btn-glass px-3 py-1.5 text-xs">
                <Plus size={14} />
              </button>
            </div>
            {referenceUrls.length > 0 && (
              <div className="space-y-1 mb-2">
                {referenceUrls.map((url, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-1.5 text-xs">
                    <Globe size={12} className="text-zinc-500 shrink-0" />
                    <span className="text-zinc-300 truncate flex-1">{url}</span>
                    <button onClick={() => setReferenceUrls(referenceUrls.filter((_, j) => j !== i))}>
                      <X size={12} className="text-zinc-500 hover:text-zinc-300" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {isPro && (
              <div
                className="border border-dashed border-white/10 rounded-xl p-4 text-center cursor-pointer hover:border-white/20 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={16} className="text-zinc-500 mx-auto mb-1" />
                <p className="text-[10px] text-zinc-500">Upload de imagens, PDFs, wireframes</p>
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf,.docx,.txt"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={(e) => {
                    if (e.target.files) {
                      setReferenceFiles([...referenceFiles, ...Array.from(e.target.files)]);
                    }
                  }}
                />
              </div>
            )}
            {referenceFiles.length > 0 && (
              <div className="space-y-1 mt-2">
                {referenceFiles.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-1.5 text-xs">
                    <FileText size={12} className="text-zinc-500 shrink-0" />
                    <span className="text-zinc-300 truncate flex-1">{f.name}</span>
                    <button onClick={() => setReferenceFiles(referenceFiles.filter((_, j) => j !== i))}>
                      <X size={12} className="text-zinc-500 hover:text-zinc-300" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Section>

      {/* ── Section 3: Funcionalidades ── */}
      <Section icon={<Settings2 size={18} />} title="Funcionalidades">
        <div className="space-y-4">
          {/* Estrutura */}
          <div>
            <label className="text-xs text-zinc-400 mb-2 block">Estrutura do Site</label>
            <div className="flex flex-wrap gap-1.5">
              {STRUCTURES.map((s) => {
                const isSelected = wizard.structures.includes(s.id as SiteStructure);
                return (
                  <button
                    key={s.id}
                    onClick={() => wizard.toggleStructure(s.id as SiteStructure)}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-medium transition-all border',
                      isSelected
                        ? 'bg-purple-500/15 border-purple-500/40 text-purple-300'
                        : 'border-white/5 text-zinc-500 hover:border-white/10 hover:text-zinc-400'
                    )}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Funcionalidades */}
          <div>
            <label className="text-xs text-zinc-400 mb-2 block">Funcionalidades</label>
            <div className="flex flex-wrap gap-1.5">
              {FUNCTIONALITIES.map((f) => {
                const isSelected = wizard.functionalities.includes(f.id as Functionality);
                return (
                  <button
                    key={f.id}
                    onClick={() => wizard.toggleFunctionality(f.id as Functionality)}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-medium transition-all border',
                      isSelected
                        ? 'bg-purple-500/15 border-purple-500/40 text-purple-300'
                        : 'border-white/5 text-zinc-500 hover:border-white/10 hover:text-zinc-400'
                    )}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tecnologias */}
          <div>
            <label className="text-xs text-zinc-400 mb-2 block">
              Tecnologias <span className="text-zinc-600">(opcional — a IA decide se vazio)</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {TECHNOLOGIES.map((t) => {
                const isSelected = wizard.technologies.includes(t.id);
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      if (t.id === 'auto') {
                        if (isSelected) {
                          useWizardStore.setState({ technologies: [] });
                        } else {
                          const popular = TECHNOLOGIES.filter(x => x.popular).map(x => x.id);
                          useWizardStore.setState({ technologies: popular });
                        }
                      } else {
                        if (isSelected) {
                          wizard.toggleTechnology(t.id);
                        } else {
                          const withoutAuto = wizard.technologies.filter(x => x !== 'auto');
                          useWizardStore.setState({ technologies: [...withoutAuto, t.id] });
                        }
                      }
                    }}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-medium transition-all border',
                      isSelected
                        ? 'bg-purple-500/15 border-purple-500/40 text-purple-300'
                        : 'border-white/5 text-zinc-500 hover:border-white/10 hover:text-zinc-400'
                    )}
                  >
                    {t.icon} {t.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Section>

      {/* ── Section 4: Briefing ── */}
      <Section icon={<FileText size={18} />} title="Briefing">
        <div className="space-y-4">
          <div>
            <label className="text-xs text-zinc-400 mb-1.5 block">
              💡 Conte sua ideia
            </label>
            <p className="text-[10px] text-zinc-600 mb-2">
              Descreva o que você quer criar. Não se preocupe com detalhes técnicos.
              Explique como se estivesse conversando com um designer.
            </p>
            <textarea
              value={wizard.description || ''}
              onChange={(e) => wizard.updateField('description', e.target.value)}
              placeholder={`Exemplo:\n\nQuero criar um site para minha clínica de odontologia.\nO foco é agendamento online e mostra de serviços.\nMeus clientes são famílias de 25 a 50 anos.\nQuero algo moderno, clean, com cores azul e branco.\nPreciso de: hero, sobre, serviços, depoimentos, contato e FAQ.`}
              rows={8}
              className="input-glass resize-none w-full text-sm leading-relaxed"
            />
          </div>

          <div>
            <label className="text-xs text-zinc-400 mb-1.5 block">Público-Alvo</label>
            <input
              type="text"
              value={wizard.targetAudience || ''}
              onChange={(e) => wizard.updateField('targetAudience', e.target.value)}
              placeholder="Ex: Famílias de 25 a 50 anos, classe B"
              className="input-glass"
            />
          </div>

          <div>
            <label className="text-xs text-zinc-400 mb-1.5 block">Contexto Adicional</label>
            <textarea
              value={wizard.additionalContext || ''}
              onChange={(e) => wizard.updateField('additionalContext', e.target.value)}
              placeholder="Informações extras, restrições, preferências..."
              rows={3}
              className="input-glass resize-none"
            />
          </div>

          {/* Modo WOW */}
          <div
            onClick={() => wizard.updateField('wowMode', !wizard.wowMode)}
            className={cn(
              'flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all',
              wizard.wowMode
                ? 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30'
                : 'border-white/5 hover:border-white/10'
            )}
          >
            <div className={cn(
              'w-10 h-5 rounded-full transition-all relative flex-shrink-0',
              wizard.wowMode ? 'bg-amber-500' : 'bg-zinc-700'
            )}>
              <div className={cn(
                'absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow',
                wizard.wowMode ? 'translate-x-5' : 'translate-x-0.5'
              )} />
            </div>
            <div>
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                ✨ Modo WOW
              </span>
              <span className="text-[10px] text-zinc-500 block mt-0.5">
                Ativa instruções premium de direção artística para gerar interfaces impressionantes
              </span>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Generate Button ── */}
      {!showResult && !showTerminal && (
        <div className="sticky bottom-0 pt-4 pb-6 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f] to-transparent">
          {isFree ? (
            <button
              onClick={() => setShowUpgrade(true)}
              className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 bg-zinc-800 text-zinc-400 border border-white/10"
            >
              <Lock size={18} />
              Assine um plano para gerar prompts
            </button>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={generating}
              className={cn(
                'w-full py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2',
                'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500 shadow-lg shadow-purple-500/20'
              )}
            >
              <Zap size={18} />
              Gerar Prompt
            </button>
          )}
          <p className="text-[10px] text-zinc-600 text-center mt-2">
            Campos vazios serão ignorados. O sistema monta um briefing profissional automaticamente.
          </p>
        </div>
      )}

      {/* ── Terminal Overlay ── */}
      <AnimatePresence>
        {showTerminal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <div className="w-full max-w-lg bg-[#1a1a2e] rounded-2xl border border-white/10 overflow-hidden shadow-2xl shadow-purple-500/10">
              {/* ── Title bar ── */}
              <div className="flex items-center gap-2 px-4 py-3 bg-[#12121f] border-b border-white/5">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <span className="text-[11px] text-zinc-500 font-mono ml-2">promptforge — gerando briefing</span>
              </div>

              {/* ── Terminal body ── */}
              <div className="p-5 font-mono text-sm min-h-[280px]">
                {terminalLines.map((line, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      'py-1',
                      line.startsWith('$') ? 'text-purple-400' :
                      line.startsWith('✓') ? 'text-emerald-400 font-semibold' :
                      'text-zinc-400'
                    )}
                  >
                    {line}
                  </motion.div>
                ))}

                {/* ── Blinking cursor ── */}
                {!terminalDone && (
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="inline-block w-2 h-4 bg-purple-400 mt-1"
                  />
                )}

                {/* ── Done badge ── */}
                {terminalDone && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-4 flex items-center gap-2 text-emerald-400"
                  >
                    <CheckCircle2 size={18} />
                    <span className="text-sm font-semibold">Briefing gerado com sucesso!</span>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Result ── */}
      {showResult && !showTerminal && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="border border-white/5 rounded-2xl bg-white/[0.02] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400" />
                Briefing Gerado
              </h3>
              <button
                onClick={() => { setShowResult(false); setShowPromptText(false); setResult(''); }}
                className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1"
              >
                <RotateCcw size={12} /> Novo
              </button>
            </div>

            {/* ── Ver Prompt toggle ── */}
            <button
              onClick={() => setShowPromptText(!showPromptText)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors mb-4"
            >
              <span className="text-xs text-zinc-300 font-medium">
                {showPromptText ? 'Ocultar prompt' : 'Ver prompt gerado'}
              </span>
              <ChevronDown
                size={14}
                className={cn('text-zinc-500 transition-transform duration-200', showPromptText && 'rotate-180')}
              />
            </button>

            <AnimatePresence>
              {showPromptText && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden mb-4"
                >
                  <div className="bg-black/30 rounded-xl p-4 max-h-[400px] overflow-y-auto">
                    <pre className="text-xs text-zinc-300 whitespace-pre-wrap font-mono leading-relaxed">
                      {result}
                    </pre>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleOptimize}
                disabled={optimizing}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border transition-all',
                  optimizing
                    ? 'border-purple-500/30 bg-purple-500/10 text-purple-300 cursor-wait'
                    : 'border-purple-500/30 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20'
                )}
              >
                {optimizing ? (
                  <>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                      <Zap size={14} />
                    </motion.div>
                    Otimizando...
                  </>
                ) : (
                  <>
                    <Zap size={14} />
                    Otimizar com IA
                    {!isPro && <Crown size={10} className="text-amber-400" />}
                  </>
                )}
              </button>
              <button onClick={copyToClipboard} className="btn-glass flex items-center gap-1.5 px-3 py-2 text-xs">
                <Copy size={14} /> {copied ? 'Copiado!' : 'Copiar'}
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(result);
                  window.open('https://lovable.dev/pt-br', '_blank');
                  toast.success('Prompt copiado! Cole no Lovable.');
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border border-pink-500/30 bg-pink-500/10 text-pink-300 hover:bg-pink-500/20 transition-all"
              >
                <Heart size={14} /> Lovable
              </button>
              <button onClick={savePrompt} className="btn-glass flex items-center gap-1.5 px-3 py-2 text-xs">
                <Save size={14} /> Salvar
              </button>
              <button onClick={() => exportAs('txt')} className="btn-glass flex items-center gap-1.5 px-3 py-2 text-xs">
                <FileDown size={14} /> TXT
              </button>
              <button onClick={() => exportAs('md')} className="btn-glass flex items-center gap-1.5 px-3 py-2 text-xs">
                <FileDown size={14} /> Markdown
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Error ── */}
      {error && (
        <div className="border border-red-500/20 rounded-xl p-4 bg-red-500/5">
          <p className="text-xs text-red-400">{error}</p>
          <button onClick={() => setError('')} className="text-xs text-zinc-500 hover:text-zinc-300 mt-2">
            Fechar
          </button>
        </div>
      )}

      {/* ── Upgrade Modal ── */}
      <AnimatePresence>
        {showUpgrade && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowUpgrade(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm"
            >
              <UpgradeBlock message="Assine um plano para gerar prompts profissionais com IA." />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
