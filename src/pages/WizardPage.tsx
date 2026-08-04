import { useState, useRef, useMemo } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, ChevronDown, Copy, Save, RotateCcw,
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
  User, MapPin, Building2, Brain,
} from 'lucide-react';
import { useWizardStore } from '@/store/wizardStore';
import { usePromptStore } from '@/store/promptStore';
import { useAuthStore } from '@/store/authStore';
import { UpgradeBlock } from '@/components/UpgradeBlock';
import { nvidiaAPI, usageAPI } from '@/services/api';
import {
  NICHES, STYLES, PLATFORMS, FONTS, STRUCTURES,
  FUNCTIONALITIES, ANIMATIONS_LIST, OBJECTIVES,
  NICHE_STRUCTURES, DEFAULT_STRUCTURES, CTA_OPTIONS, FONT_IMPORT_URLS, VISUAL_EFFECTS,
  PALETTES, AI_MODES, NICHE_CONTEXT, NICHES_PRIMARY, HEADLINES_BY_NICHE,
} from '@/lib/constants';
import { cn, generateId } from '@/lib/utils';
import type {
  AnimationType, SiteStructure, Functionality,
} from '@/types';

// ── Step Indicator ────────────────────────────────────────────────
const STEP_META = [
  { label: 'Nicho', icon: Target },
  { label: 'Empresa', icon: Building2 },
  { label: 'Identidade Visual', icon: Palette },
  { label: 'Animações', icon: Zap },
  { label: 'Inteligência IA', icon: Brain },
  { label: 'Gerar', icon: CheckCircle2 },
];

// ── Design token helpers (cores derivadas p/ o briefing) ──
function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(m)) return null;
  const n = parseInt(m, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function mix(hexA: string, hexB: string, t: number): string {
  const a = hexToRgb(hexA), b = hexToRgb(hexB);
  if (!a || !b) return hexA;
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * t));
  return '#' + c.map(v => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('');
}
function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex) || [0, 0, 0];
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

function StepIndicator({ current, total, onNavigate }: { current: number; total: number; onNavigate?: (step: number) => void }) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      {STEP_META.map((s, i) => {
        const n = i + 1;
        const done = n < current;
        const active = n === current;
        const Icon = s.icon;
        return (
          <div key={n} className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onNavigate?.(n)}
              className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all',
                done && 'bg-purple-500/20 text-purple-400',
                active && 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/20',
                !done && !active && 'bg-white/5 text-zinc-600',
                onNavigate && 'hover:scale-110 cursor-pointer'
              )}
            >
              {done ? <CheckCircle2 size={14} /> : <Icon size={13} />}
            </button>
            {i < total - 1 && (
              <div className={cn('w-4 h-0.5 rounded-full', n < current ? 'bg-purple-500/40' : 'bg-white/5')} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Step Wrapper (um passo por tela) ──────────────────────────────
function Step({
  title, subtitle, children,
}: {
  title: string; subtitle?: string; children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 32 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -32 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      className="border border-white/5 rounded-2xl overflow-hidden bg-white/[0.02]"
    >
      <div className="px-5 py-4 border-b border-white/5">
        <h2 className="font-semibold text-white text-sm">{title}</h2>
        {subtitle && <p className="text-[10px] text-zinc-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="px-5 py-5">{children}</div>
    </motion.div>
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

  // ── Wizard step flow ──
  const [step, setStep] = useState(1);
  const TOTAL_STEPS = 6;

  const goStep = (s: number) => {
    setStep(Math.max(1, Math.min(TOTAL_STEPS, s)));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

Instruções extras de direção de arte (além da direção criativa):

## Motion Design
- Toda animação deve ter easing personalizado (cubic-bezier), duração de 200-600ms e propósito claro: guiar atenção, contar estado ou celebrar uma ação.
- Use scroll-triggered reveals com stagger sutil (30-80ms entre elementos), nunca tudo ao mesmo tempo.
- Hero: adicione micro-interação no título (ex: spotlight que segue o mouse, gradiente animado, letra a letra).
- Botões: hover com escala + brilho suave; CTA principal com "pulse" sutil.

## Micro-interações
- Toda ação clicável deve ter feedback visual imediato (hover, active, focus ring).
- Formulários: borda que muda de cor ao focar, mensagens de validação animadas, botão de envio com estado de loading.
- Navbar: ao rolar, transição suave para fundo translúcido com blur (backdrop-filter).

## Grid & Composição
- Use grid assimétrico com hierarquia clara (ex: 60/40, 12-col com elementos que atravessam colunas).
- Misture proporções: uma seção espaçosa, outra densa — crie ritmo.
- Imagens: tratamento consistente (mesmo estilo de recorte, bordas ou overgradient em todas).

## Detalhes de acabamento
- Microcopy: escreva textos de botões e estados com personalidade (não "Enviar", prefira "Quero meu orçamento grátis").
- Ícones consistentes (mesma família, mesmo stroke width).
- Foco acessível visível em todos os elementos interativos.
- Adicione um detalhe de assinatura visual (ex: shape decorativo, padrão sutil, tagline) que se repita no site.

## Não fazer
- Nada de animações que atrasam o conteúdo (hero esperando carregar).
- Nada de scroll-hijacking, parallax exagerado ou carrossel automático.
- Nada de gradientes sem propósito ou sombras pesadas.`;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Custom inputs ──
  const [showCustomNiche, setShowCustomNiche] = useState(false);
  const [nicheFilter, setNicheFilter] = useState('');

  // ── Filtered niches ──
  const primaryOrder = NICHES_PRIMARY.map(l => l.toLowerCase());
  let visibleNiches = [...NICHES].sort((a, b) => {
    const ai = primaryOrder.indexOf(a.label.toLowerCase());
    const bi = primaryOrder.indexOf(b.label.toLowerCase());
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
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

    const json: Record<string, any> = {};
    if (wizard.companyName) json.empresa = wizard.companyName;
    if (wizard.slogan) json.headline = wizard.slogan;
    if (wizard.niche || wizard.customNiche) json.nicho = wizard.niche || wizard.customNiche;
    if (objective) json.objetivo = { id: objective.id, label: objective.label, description: objective.description };
    if (wizard.targetAudience) json.publicoAlvo = wizard.targetAudience;
    if (platform) json.plataforma = { id: platform.id, label: platform.label };
    if (style) json.estiloVisual = { id: style.id, label: style.label, description: style.description };
    json.paleta = {
      primaria: wizard.primaryColor,
      secundaria: wizard.secondaryColor,
      predefinida: PALETTES.find(p => p.id === wizard.palette)?.label,
    };
    if (font) json.tipografia = { id: font.id, label: font.label };
    if (animLabels.length > 0) json.animacoes = animLabels;
    // Modo de Inteligência IA — direção estratégica do prompt
    const aiMode = AI_MODES.find(m => m.id === wizard.aiMode);
    if (aiMode) json.modoIA = { id: aiMode.id, label: aiMode.label, instrucoes: aiMode.instructions };

    // Contexto inteligente do nicho
    const nicheObj = NICHES.find(n => n.label === wizard.niche);
    const nicheCtx = nicheObj ? NICHE_CONTEXT[nicheObj.id] : undefined;
    if (nicheCtx) json.contextoNicho = nicheCtx;

    // Google Maps — extração automática de dados do perfil
    if (wizard.mapsUrl) {
      json.googleMaps = {
        link: wizard.mapsUrl,
        instrucoes: 'Use o link do Google Maps para enriquecer o site com os dados reais do perfil: endereço, cidade, estado, avaliações e nota média, horário de funcionamento e fotos do estabelecimento. Inclua esses dados nas seções apropriadas (contato, sobre, rodapé).',
      };
    }

    // Efeitos visuais premium
    const effectLabels = (wizard.visualEffects || [])
      .map(v => VISUAL_EFFECTS.find(x => x.id === v))
      .filter(Boolean)
      .map(v => ({ id: v!.id, label: v!.label, description: v!.description }));
    if (effectLabels.length > 0) json.efeitosVisuais = effectLabels;

    // Estrutura: usa as escolhidas OU as recomendadas para o nicho (nunca sai vazia)
    let effectiveStructures = structLabels;
    if (structLabels.length === 0) {
      const nicheCat = wizard.niche
        ? NICHES.find(n => n.label === wizard.niche)?.id
        : undefined;
      const recIds = (nicheCat && NICHE_STRUCTURES[nicheCat]) || DEFAULT_STRUCTURES;
      effectiveStructures = recIds
        .map(s => STRUCTURES.find(x => x.id === s))
        .filter(Boolean)
        .map(s => ({ id: s!.id, label: s!.label, description: s!.description }));
    }
    if (effectiveStructures.length > 0) json.estrutura = effectiveStructures;

    // CTA principal (ação de conversão)
    const ctaOpt = CTA_OPTIONS.find(c => c.id === wizard.cta);
    if (ctaOpt) json.cta = { id: ctaOpt.id, label: ctaOpt.label, emoji: ctaOpt.emoji };

    if (funcLabels.length > 0) json.funcionalidades = funcLabels;
    if (wizard.description) json.briefing = wizard.description;
    if (wizard.additionalContext) json.contextoAdicional = wizard.additionalContext;
    if (referenceUrls.length > 0) json.referencias = referenceUrls;
    if (referenceFiles.length > 0) {
      json.arquivosReferencia = referenceFiles.map(f => ({
        nome: f.name,
        tipo: f.type || 'arquivo',
        tamanho: f.size > 0 ? `${(f.size / 1024).toFixed(0)} KB` : undefined,
      }));
    }

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

  // ── Progress calculation ──
  const progress = useMemo(() => {
    const sections = [
      // Projeto
      Boolean(wizard.companyName?.trim() || wizard.niche || wizard.customNiche || wizard.objective),
      // Público & objetivo
      Boolean(wizard.targetAudience?.trim() || wizard.mainPains?.trim() || wizard.projectGoal?.trim()),
      // Design
      Boolean(wizard.style || wizard.animations.length > 0 || wizard.structures.length > 0),
      // Funcionalidades
      Boolean(wizard.functionalities.length > 0),
      // Briefing
      Boolean(wizard.description?.trim() || wizard.additionalContext?.trim() || wizard.briefingNotes?.trim()),
    ];
    const filled = sections.filter(Boolean).length;
      return { filled, total: sections.length, pct: Math.round((filled / sections.length) * 100) };
    }, [
      wizard.companyName, wizard.niche, wizard.customNiche, wizard.objective,
      wizard.targetAudience, wizard.mainPains, wizard.projectGoal,
      wizard.style, wizard.animations, wizard.structures,
      wizard.functionalities,
      wizard.description, wizard.additionalContext, wizard.briefingNotes,
    ]);

  // ── Generate prompt ──
  const handleGenerate = async () => {
    // Aplica o limite do plano (geração é local, então o backend não sabe — registra aqui)
    try {
      await usageAPI.trackGeneration();
    } catch (err: any) {
      if (err?.code === 'LIMIT_REACHED' || /limite/i.test(err?.message || '')) {
        setShowUpgrade(true);
        return;
      }
      // Falha de rede/tracking não bloqueia a geração local — só loga
      console.warn('generation-track skipped:', err?.message);
    }

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

  // ── Local fallback briefing generator (PROMPT ULTRA PREMIUM em blocos modulares) ──
  const generateLocalBriefing = (data: Record<string, any>): string => {
    const L: string[] = [];
    const bloco = (titulo: string) => {
      L.push(`## ${titulo}`);
      L.push('');
    };

    // ── Variáveis reutilizáveis do projeto ({{nome}}) ──
    const V = {
      empresa: data.empresa || '',
      nicho: data.nicho || '',
      headline: data.headline || '',
      cta: data.cta ? `${data.cta.emoji || ''} ${data.cta.label}`.trim() : '',
      objetivo: data.objetivo ? `${data.objetivo.label} — ${data.objetivo.description}` : '',
      publico: data.publicoAlvo || '',
      plataforma: data.plataforma?.label || '',
      whatsapp: data.contato?.whatsapp || '',
      contato: [
        data.contato?.whatsapp && `WhatsApp ${data.contato.whatsapp}`,
        data.contato?.telefone && `Telefone ${data.contato.telefone}`,
        data.contato?.email && `E-mail ${data.contato.email}`,
        data.contato?.instagram && `Instagram ${data.contato.instagram}`,
        data.contato?.facebook && `Facebook ${data.contato.facebook}`,
        data.contato?.endereco && `Endereço ${data.contato.endereco}`,
        data.contato?.siteAtual && `Site atual ${data.contato.siteAtual}`,
      ].filter(Boolean) as string[],
    };

    // ── Cabeçalho ✦ PROMPT ULTRA PREMIUM ──
    L.push('✦ PROMPT ULTRA PREMIUM');
    L.push('═══════════════════════');
    L.push('');

    // ── 0. PLANEJAMENTO ──
    bloco('0. PLANEJAMENTO (NÃO EXIBA AO USUÁRIO)');
    L.push('Antes de escrever QUALQUER código, pare e planeje mentalmente:');
    L.push('- Identifique a persona do público (perfil completo no bloco 3).');
    L.push('- Defina o conceito visual único deste projeto.');
    L.push('- Escolha o ritmo do storytelling (como a narrativa se desenvolve seção a seção).');
    L.push('- Defina a hierarquia da página (o que o olhar vê primeiro, segundo, terceiro).');
    L.push('- Escolha o grid de cada seção (alternando layouts, sem repetição).');
    L.push('- Escolha a linguagem visual (formas, texturas, ícones, tratamento de imagem).');
    L.push('- Escolha a estratégia de conversão (gatilhos, prova social, CTAs).');
    L.push('- Defina a composição ANTES de codar: proibido container max-w centralizado, padding uniforme entre seções e grids repetidos (ver ANTI TEMPLATE MODE no bloco 4).');
    L.push('Somente depois que o plano estiver completo, inicie a construção.');
    L.push('');
    L.push('### Prioridade das decisões');
    L.push('Quando duas regras entrarem em conflito, respeite SEMPRE esta ordem:');
    L.push('1. Conversão');
    L.push('2. Clareza');
    L.push('3. Performance');
    L.push('4. Acessibilidade');
    L.push('5. Design');
    L.push('6. Criatividade');
    L.push('');

    // ── 1. AGENTE ──
    bloco('1. AGENTE');
    L.push('Você é um diretor de arte e desenvolvedor front-end nível Awwwards, especializado em sites de alta conversão e estética premiada. Domina design system, tipografia, motion design, grids assimétricos, performance e acessibilidade. Regra de ouro: nada de template — cada projeto é uma experiência única e memorável.');
    L.push('');

    // ── 2. BRIEFING (variáveis do projeto) ──
    bloco('2. BRIEFING — VARIÁVEIS DO PROJETO');
    L.push('Use EXATAMENTE estes valores em todo o site (não invente nem troque):');
    if (V.empresa) L.push(`- {{empresa}} → ${V.empresa}`);
    if (V.nicho) {
      L.push(`- {{nicho}} → ${V.nicho}`);
    } else {
      L.push('- {{nicho}} → [não informado — deduza o segmento a partir do {{empresa}} e do contexto, e use-o em TODAS as instruções que referenciam {{nicho}}]');
    }
    if (V.headline) L.push(`- {{headline}} → "${V.headline}" (título do hero, obrigatória)`);
    if (V.cta) L.push(`- {{cta}} → ${V.cta} (texto do botão principal)`);
    if (V.objetivo) L.push(`- {{objetivo}} → ${V.objetivo}`);
    if (V.publico) L.push(`- {{publico}} → ${V.publico}`);
    if (V.plataforma) L.push(`- {{plataforma}} → ${V.plataforma}`);
    if (V.contato.length) L.push(`- {{contato}} → ${V.contato.join(' · ')}`);
    if (data.googleMaps) L.push('- {{maps}} → link do Google Maps: extraia os dados reais do perfil (endereço, cidade, estado, avaliações, horário, fotos) e use-os para enriquecer o site.');
    if (data.contextoNicho) {
      L.push('');
      L.push('### Contexto Inteligente do Nicho');
      L.push(data.contextoNicho);
    }
    if (data.briefing) {
      L.push('');
      L.push(`### Descrição do cliente
${data.briefing}`);
    }
    L.push('');
    L.push('### Regras de interpretação');
    L.push('Se alguma variável estiver ausente, inconsistente ou vazia:');
    L.push('- NUNCA invente dados (telefone, endereço, imagens, textos, números).');
    L.push('- Utilize apenas as informações fornecidas no briefing.');
    L.push('- Caso uma informação seja indispensável e não exista, use um placeholder claramente identificado (ex: [telefone do cliente]).');
    L.push('- Nunca contradiga outra variável.');
    L.push('');
    L.push('### Compatibilidade com a plataforma');
    L.push('Sempre utilize componentes e recursos suportados pela plataforma {{plataforma}}.');
    L.push('Nunca proponha soluções que dependam de bibliotecas, APIs ou recursos indisponíveis na plataforma.');
    L.push('Quando houver duas soluções possíveis, escolha a mais compatível com {{plataforma}}.');
    L.push('');

    // ── 3. PERSONA DO PÚBLICO ──
    bloco('3. PERSONA DO PÚBLICO');
    L.push('ANTES de criar qualquer coisa, identifique o cliente ideal deste negócio: faixa etária, poder aquisitivo, objetivo (o que ele quer resolver ao chegar no site) e comportamento (onde navega, o que valoriza, o que o faz confiar ou desistir).');
    if (V.publico) L.push(`Ponto de partida informado: **${V.publico}**.`);
    L.push('Adapte TUDO a esse perfil: linguagem (tom e vocabulário que ele usa), identidade visual (acabamento que gera identificação), conversão (argumentos e gatilhos que ele responde) e ofertas (benefícios que resolvem o problema dele). O site deve parecer criado por alguém que conhece esse cliente — nunca por uma empresa falando com "todo mundo".');
    L.push('');

    // ── 4. DIREÇÃO VISUAL ──
    bloco('4. DIREÇÃO VISUAL');
    if (data.estiloVisual) {
      L.push(`**Estilo:** ${data.estiloVisual.label} — ${data.estiloVisual.description}`);
      L.push('');
    }
    if (data.estiloVisual && data.estiloVisual.id === 'apple') {
      L.push('**Interpretação do estilo Apple:** Apple APENAS no acabamento visual — polimento impecável, espaçamento generoso, tipografia refinada. A COMPOSIÇÃO NÃO pode ser Apple: proibido tudo centralizado, excesso de espaço em branco e simetria extrema. A composição deve ser ousada, assimétrica e cinematográfica — referências: Luxury Editorial, Awwwards Winner, High Fashion Campaign, Architecture Portfolio.');
      L.push('');
    }
    if (data.modoIA) {
      L.push(`**Modo IA: ${data.modoIA.label}**`);
      L.push(data.modoIA.instrucoes);
      L.push('');
    }
    if (data.estiloVisual && data.modoIA) {
      L.push('**Como combinar Estilo + Modo IA:** o ESTILO define a base de refinamento — limpeza, acabamento, elegância da interface. O MODO IA define a ousadia da composição — experimentação de layout, grids e movimento. Aplique os dois ao mesmo tempo: interface refinada e minimalista no comportamento, composição criativa e editorial no layout. Se parecerem conflitar, o estilo vence na interface e o modo vence na composição — nunca abandone um em favor do outro.');
      L.push('');
    }
    L.push(CREATIVE_DIRECTION);
    L.push('');
    if (wizard.wowMode) {
      L.push(WOW_MODE_EXTRA);
      L.push('');
    }
    L.push('**Limite da criatividade:** a criatividade nunca pode comprometer Performance, Acessibilidade, SEO, Legibilidade e Conversão. Quando houver conflito, priorize esses cinco pilares.');
    L.push('');
    L.push('### ANTI TEMPLATE MODE [OBRIGATÓRIO]');
    L.push('A composição NUNCA pode parecer template SaaS. Proibições técnicas diretas:');
    L.push('- PROIBIDO container centralizado único com max-w-* (max-w-xl/2xl/3xl/5xl/7xl + mx-auto) repetido em todas as seções;');
    L.push('- PROIBIDO o mesmo padding vertical em todas as seções (ex: py-24/py-32 igual em tudo) e o mesmo padding lateral;');
    L.push('- PROIBIDO border-t/border-b como separador de seção — separe com contraste de fundo, sobreposição ou espaço negativo;');
    L.push('- PROIBIDO hero com texto centralizado e imagem ao lado, cards grid-cols-3 iguais, grids repetidos e blocos empilhados;');
    L.push('- PROIBIDO componentes padrão do Lovable, shadcn/ui, Tailwind UI, layout típico Webflow ou Framer.');
    L.push('');
    L.push('DESTRUA O CONTAINER: misture full width, bleeding sections, elementos quebrando o grid, cards invadindo outras seções, imagens saindo da tela, textos enormes, sobreposições, negative margins e layers.');
    L.push('');
    L.push('Cada seção possui um grid e um ritmo próprios — sequência obrigatória de variação:');
    L.push('1. Hero: full-bleed, sem max-w, texto à esquerda (~60%), imagem à direita flutuando para fora da tela, elementos sobrepostos.');
    L.push('2. Segunda seção: bento grid assimétrico (colunas de alturas diferentes).');
    L.push('3. Terceira: cards diagonais (rotate leve alternado) ou editorial magazine.');
    L.push('4. Quarta: imagem ocupando a tela inteira (full-bleed, texto sobreposto).');
    L.push('5. Quinta: composição assimétrica (grid-cols-12 com colunas desiguais).');
    L.push('Nenhuma seção reutiliza a composição da anterior; cada seção deve parecer feita por um designer diferente.');
    L.push('');
    L.push('PROIBIDO card padrão (imagem + título + texto + botão empilhados). Todo card tem identidade própria: formato, hierarquia interna, sobreposições e direção de leitura únicas.');
    L.push('');
    L.push('PENSE COMO UM DIRETOR DE ARTE: antes de criar cada seção, pergunte "isso parece um template?" — se sim, destrua a composição e recrie do zero.');
    L.push('');
    L.push('ESTILO DE COMPOSIÇÃO DO PROJETO: escolha aleatoriamente UM destes — Editorial Magazine, Luxury Brand, Apple Keynote, Nike Campaign, Awwwards Experimental, Museum Exhibition, High Fashion, Architecture Portfolio, Minimal Brutalism, Swiss Editorial — e aplique como partido compositivo de TODO o site. Jamais reutilize o mesmo estilo em dois projetos consecutivos.');
    L.push('');

    // ── 5. DESIGN SYSTEM [OBRIGATÓRIO] ──
    const prim = data.paleta?.primaria || '#0a0a0f';
    const sec = data.paleta?.secundaria || '#a855f7';
    const dark = luminance(prim) < 0.55;
    const texto = dark ? '#f5f5f5' : '#111114';
    const textoSec = dark ? '#a1a1aa' : '#52525b';
    const surface = dark ? mix(prim, '#ffffff', 0.07) : mix(prim, '#000000', 0.04);
    const border = dark ? mix(prim, '#ffffff', 0.16) : mix(prim, '#000000', 0.12);
    const secLight = mix(sec, '#ffffff', 0.18);
    const secDark = mix(sec, '#000000', 0.22);

    bloco('5. DESIGN SYSTEM [OBRIGATÓRIO]');
    if (data.paleta?.predefinida) L.push(`**Paleta escolhida:** ${data.paleta.predefinida}`);
    L.push('### Cores (valores EXATOS — não invente outros)');
    L.push(`- Fundo da página inteira: \`${prim}\``);
    L.push(`- Superfície (cards/banners): \`${surface}\``);
    L.push(`- Bordas/dividers: \`${border}\``);
    L.push(`- Texto principal: \`${texto}\``);
    L.push(`- Texto secundário (legendas): \`${textoSec}\``);
    L.push(`- Destaque/accent (botões, links, ícones, hover): \`${sec}\``);
    L.push(`- Accent claro (hover): \`${secLight}\``);
    L.push(`- Accent escuro (pressionado): \`${secDark}\``);
    L.push('');
    L.push('### Regras de aplicação');
    L.push('1. Fundo do site INTEIRO = cor primária (nada de fundo branco ou tema padrão).');
    L.push('2. Botão primário: fundo `' + sec + '`, texto `' + (dark ? prim : '#ffffff') + '`.');
    L.push('3. `' + sec + '` aparece apenas em botões primários, links, ícones, seleção, hover e badges.');
    L.push('4. PROIBIDO roxo, azul, laranja, rosa, vermelho, verde, gradientes padrão ou tema default da ferramenta.');
    L.push('5. Hover/ativo: use os tons claro/escuro do accent.');
    L.push('6. DOMINÂNCIA DE COR [OBRIGATÓRIO]: ao abrir a página, a PRIMEIRA impressão deve ser a paleta escolhida — fundo predominantemente na cor primária e elementos de destaque na cor de acento. Se qualquer seção parecer cinza/bege/neutra (tons de zinc, gray, slate, neutral do Tailwind ou fundos acinzentados sem a cor primária), está ERRADA — repinte com a cor primária e o acento.');
    L.push('7. PROIBIDO tons de cinza como cor dominante: fundos, seções e containers NUNCA usam #e5e5e5, #d4d4d4, #a3a3a3, #737373, #525252, #27272a ou qualquer cinza neutro — se precisar de superfície, use `' + surface + '` (derivado da cor primária), nunca um cinza desacoplado da paleta.');
    L.push('8. O acento `' + sec + '` deve estar VISIVELMENTE presente: no botão CTA, em badges/tags, em números/statísticas, em detalhes de hover ou em destaques tipográficos — o site não pode parecer monocromático.');
    L.push('');
    if (data.tipografia) {
      const fontId = data.tipografia.id || data.tipografia.label;
      const fontUrl = FONT_IMPORT_URLS[fontId] || '';
      L.push('### Tipografia');
      L.push(`Fonte principal: **${data.tipografia.label}**`);
      if (fontUrl) {
        L.push(`- IMPORTE no index.html: \`<link href="${fontUrl}" rel="stylesheet">\``);
        L.push(`- Aplique \`font-family: '${fontId}', Inter, sans-serif\` em TODO o site (títulos, parágrafos, botões, inputs).`);
      } else {
        L.push(`- Aplique \`font-family: '${fontId}', Inter, sans-serif\` em TODO o site.`);
      }
      L.push('- Escala: títulos grandes e contrastantes (clamp), corpo 16px+, legendas com tracking. Fallback: Inter.');
      L.push('');
    }
    L.push('### Consistência do sistema visual');
    L.push('Todos os componentes pertencem ao MESMO sistema: espaçamento (escala 4/8/12/16/24/32/48/64px), bordas e raios (mesma família), sombras (mesma direção e profundidade), ícones (mesma família e stroke), animações (mesmas curvas e durações), tipografia (mesma escala). Se um componente destoa, ele está errado — ajuste, não abra exceção.');
    L.push('- CANTOS ARREDONDADOS: todo card, imagem, badge e input usa cantos arredondados generosos (border-radius alto, ex: rounded-2xl/rounded-3xl ou 16-24px). PROIBIDO card com cantos retos/vivos (rounded-none, sharp corners).');
    L.push('');

    // ── 6. ANIMAÇÕES & MICROINTERAÇÕES ──
    if (data.animacoes?.length || data.efeitosVisuais?.length) {
      bloco('6. ANIMAÇÕES & MICROINTERAÇÕES');
      if (data.animacoes?.length) {
        L.push('Implemente SOMENTE as animações selecionadas, com moderação e propósito (guiar atenção, contar estado, celebrar ação):');
        data.animacoes.forEach((a: any) => L.push(`- **${a.label}:** ${a.description}`));
        L.push('');
        L.push('- Easing personalizado (cubic-bezier), duração 200-600ms; reveals com stagger sutil (30-80ms); nada que atrase o conteúdo ou scroll-hijacking.');
        L.push('- CADA SEÇÃO com coreografia própria: escolha 1-2 animações da lista por seção (contadores no bloco de estatísticas, marquee na faixa de clientes, tilt nos cards). Proibido repetir o mesmo padrão de reveal em todas as seções.');
        L.push('- Landing page de página única: adapte animações que exigem múltiplas páginas (ex: Page Transitions) para transições entre seções (fade/scale ao entrar em cada seção). Nunca crie páginas extras só para justificar uma animação.');
        L.push('- NÚMEROS EM MOVIMENTO [OBRIGATÓRIO]: todo card de estatística/número (ex: "48h de fermentação", "4,9★", "450°C", contadores de anos/avaliações) DEVE estar animado com contagem progressiva (count-up ao entrar na tela) ou efeito equivalente em movimento — NUNCA número parado/estático. Ative o contador ao entrar no viewport.');
        L.push('');
      }
      if (data.efeitosVisuais?.length) {
        L.push('Efeitos visuais premium (nível Awwwards), com moderação e propósito:');
        data.efeitosVisuais.forEach((e: any) => L.push(`- **${e.label}:** ${e.description}`));
        L.push('');
      }
      L.push('Microinterações: toda ação clicável com feedback imediato (hover/active/focus ring); formulários com borda no foco e botão com loading; navbar com blur ao rolar; ícones da mesma família; microcopy com personalidade ("Quero meu orçamento grátis" em vez de "Enviar").');
      L.push('');
    }

    // ── 7. IMAGENS PREMIUM [RECOMENDADO] ──
    bloco('7. IMAGENS PREMIUM [RECOMENDADO]');
    L.push('- Altíssima qualidade e composição cinematográfica — nada de stock genérico, fotos óbvias ou placeholders.');
    L.push('- Retratam o nicho ({{nicho}}) com autenticidade: ambientes, pessoas, produtos e resultados reais.');
    L.push('- Direção de fotografia: luz dramática, enquadramento editorial, profundidade de campo, cores alinhadas à paleta.');
    L.push('- Hero: imagem que conta a história do negócio em 1 segundo. Galerias: variação de planos (geral, médio, detalhe) para criar ritmo.');
    L.push('- Tratamento consistente em todas as fotos (mesmo filtro/gradação) para parecer uma campanha única.');
    L.push('- Use enquadramentos e tipos de imagem típicos do nicho definido em {{nicho}}, privilegiando resultados visuais (before/after, close-ups, detalhes de acabamento) apenas quando fizer sentido para o segmento.');
    L.push('');

    // ── 8. PERFORMANCE [OBRIGATÓRIO] ──
    bloco('8. PERFORMANCE [OBRIGATÓRIO]');
    L.push('- Lighthouse 95+ (Performance, A11y, Best Practices, SEO).');
    L.push('- Lazy loading abaixo da dobra; WebP/AVIF; fonte com display=swap e preconnect.');
    L.push('- CSS com design tokens; animações apenas em transform/opacity; bundle enxuto, sem libs pesadas.');
    L.push('');

    // ── 9. ACESSIBILIDADE [OBRIGATÓRIO] ──
    bloco('9. ACESSIBILIDADE [OBRIGATÓRIO]');
    L.push('- WCAG AA: contraste validado, foco visível, landmarks semânticos.');
    L.push('- HTML semântico (header, nav, main, section, footer); alt descritivo; labels associados; navegação por teclado; prefers-reduced-motion.');
    L.push('');

    // ── 10. SEO ──
    bloco('10. SEO');
    L.push('### SEO Técnico [OBRIGATÓRIO]');
    L.push('- Title e meta description únicos e persuasivos; Open Graph + Twitter Card; H1 único com {{headline}}; JSON-LD (LocalBusiness para negócios locais); URLs limpas e canônicas.');
    L.push('');
    L.push('### SEO de Conteúdo [OPCIONAL — aplique apenas quando fizer sentido para o tipo de página]');
    L.push('- Hierarquia h2/h3 clara e palavras-chave naturais do nicho ({{nicho}}), sem keyword stuffing. Em landing pages de conversão, priorize a clareza da oferta acima do volume de palavras-chave.');
    L.push('');

    // ── 11. EXCLUSIVIDADE [OBRIGATÓRIO] ──
    bloco('11. EXCLUSIVIDADE [OBRIGATÓRIO]');
    L.push('1. Este projeto é 100% diferente de qualquer site anterior — nunca reutilize layouts, componentes ou padrões visuais, nem os seus próprios.');
    L.push('2. PROIBIDO componente padrão: crie hero, cards, galeria, CTA e depoimentos personalizados do zero. Se parecer pronto de biblioteca ou template, refaça.');
    L.push('3. Hero 100% exclusivo do nicho: o hero deve representar visualmente o PRINCIPAL BENEFÍCIO do segmento ({{nicho}}), utilizando composição, fotografia e elementos exclusivos daquele mercado. NUNCA o hero padrão da ferramenta.');
    L.push('4. Grids diferentes em cada seção (2 colunas, 3 colunas, assimétrico, bento, editorial, faixa cheia) — proibido repetir o mesmo grid em seções seguidas.');
    L.push('5. Identidade visual nascida do nicho: texturas, ícones, formas e referências próprias do segmento, não uma receita genérica.');
    L.push('6. ORIGINALIDADE ABSOLUTA: se qualquer parte lembrar um template popular (Webflow, Framer, Lovable, Tailwind UI, Shadcn, Bootstrap, SaaS starter), redesenhe até ficar irreconhecível.');
    L.push('7. Benchmark sem cópia: analise mentalmente os melhores sites internacionais do segmento e absorva apenas princípios (hierarquia, ritmo, artesanato tipográfico, ousadia, luz) — nunca layouts ou componentes de outra marca. Pergunte-se: "um estúdio premiado aprovaria esta peça?"');
    L.push('8. Aplique o ANTI TEMPLATE MODE definido no bloco 4 em cada seção — composição exclusiva, grids variados, nenhum padrão de template.');
    L.push('');

    // ── 12. SEÇÕES & STORYTELLING ──
    if (data.estrutura && data.estrutura.length > 0) {
      bloco('12. SEÇÕES & STORYTELLING');
      L.push('Construa na ordem indicada, cada seção com identidade própria:');
      data.estrutura.forEach((s: any, i: number) => L.push(`${i + 1}. **${s.label}** — ${s.description}`));
      L.push('');
      L.push('- STORYTELLING contínuo, da primeira à última seção: gancho no hero → problema/desejo → prova → oferta → CTA final. Se a estrutura acima não incluir uma seção dedicada de prova social, incorpore depoimentos, números e avaliações dentro das seções mais adequadas (resultados na galeria, avaliações nos preços, história no sobre). Cada seção é um capítulo que conecta com o próximo.');
      L.push('- FLUXO VISUAL: cada seção conduz o olhar para a próxima (alinhamentos encadeados, contraste com hierarquia, ritmo, CTAs posicionados estrategicamente). O visitante nunca "para" sem saber para onde olhar.');
      L.push('- DIREÇÃO DE UX: cada seção responde a uma pergunta do visitante — "O que é?" (hero), "Por que confiar?" (prova), "O que oferece?" (serviços), "Quanto custa?" (preços), "Como contratar?" (processo/FAQ). No CTA final, nenhuma dúvida remanescente.');
      L.push('- Componentes exclusivos por segmento (cards de serviço com formato próprio, galerias com hover único, CTA com microcopy do nicho) — nada de card genérico imagem+título+botão.');
      L.push('- Não adicione seções fora da lista acima sem necessidade real.');
      L.push('');
    }
    if (data.funcionalidades && data.funcionalidades.length > 0) {
      L.push('**Recursos a implementar:** ' + data.funcionalidades.map((f: any) => f.label).join('; ') + '.');
      L.push('');
    }
    if (data.referencias && data.referencias.length > 0) {
      L.push('**Referências (inspiração de composição e acabamento — nunca copie conteúdo):**');
      data.referencias.forEach((r: string) => L.push(`- ${r}`));
      L.push('');
    }
    if (data.arquivosReferencia && data.arquivosReferencia.length > 0) {
      L.push('**Arquivos de referência anexados** (guiar design, identidade e conteúdo):');
      data.arquivosReferencia.forEach((f: any) => {
        const extra = f.tamanho ? ` (${f.tamanho})` : '';
        L.push(`- **${f.nome}** — ${f.tipo}${extra}`);
      });
      L.push('');
    }
    if (data.contextoAdicional) {
      L.push(`**Observações adicionais:** ${data.contextoAdicional}`);
      L.push('');
    }

    // ── 13. CONVERSÃO [OBRIGATÓRIO] ──
    bloco('13. CONVERSÃO [OBRIGATÓRIO]');
    L.push('- Gatilhos mentais ao longo da página: prova social (depoimentos, números, avaliações), urgência/escassez quando fizer sentido (vagas limitadas, oferta por tempo), FAQ que quebra objeções (preço, prazo, garantia).');
    L.push(`- ${V.cta ? `CTA "${V.cta}"` : 'CTA principal'} no hero, repetido no meio e no fim, com microcopy persuasiva orientada a benefício.`);
    L.push(`- WhatsApp como canal principal de conversão (botão flutuante + CTAs)${V.whatsapp ? `: ${V.whatsapp}` : ''}.`);
    L.push(`- Respeite o Modo IA (${data.modoIA?.label || 'padrão'}) e a persona em todas as decisões de conversão.`);
    L.push('');

    // ── 14. CHECKLIST FINAL ──
    bloco('14. CHECKLIST FINAL (revise antes de entregar)');
    [
      'Não parece template',
      'Não usa componentes padrão',
      'Layout 100% exclusivo deste nicho',
      'Hero único e memorável',
      'Grids diferentes em cada seção',
      'Storytelling contínuo',
      'Fluxo visual natural entre seções',
      'Imagens premium do nicho',
      'Gatilhos de conversão presentes',
      'Persona do público refletida na linguagem',
      'Dúvidas do visitante eliminadas até o CTA',
      'Sistema visual consistente do início ao fim',
      'Irreconhecível como Webflow/Framer/Lovable/Shadcn',
      'Visual digno do Awwwards',
      'Lighthouse 95+',
      'Mobile impecável',
      'Conversão otimizada',
      'SEO completo',
      'Acessibilidade AA',
      'Código organizado',
      'Componentes reutilizáveis',
      'Design consistente',
      'Tipografia refinada',
      'Espaçamento perfeito',
      'Microinterações presentes',
      'CTA destacado',
    ].forEach((item) => L.push(`☑ ${item}`));
    L.push('');

    // ── 15. AUTOAVALIAÇÃO ──
    bloco('15. AUTOAVALIAÇÃO (antes de finalizar)');
    L.push('Faça uma revisão silenciosa do projeto completo. Se QUALQUER item abaixo não atingir nível premium, reprojete a seção:');
    L.push('- Parece um template?');
    L.push('- Existe alguma seção visualmente fraca?');
    L.push('- A hierarquia tipográfica é clara?');
    L.push('- O CTA chama atenção suficiente?');
    L.push('- Há repetição de layouts?');
    L.push('- A identidade visual é exclusiva?');
    L.push('- O projeto teria qualidade para o portfólio de uma agência de alto nível?');
    L.push('');
    L.push('Somente entregue quando todos os critérios forem atendidos.');
    L.push('');

    return L.join('\n');
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

      {/* ── Progress Bar ── */}
      {!showResult && !showTerminal && (
        <div className="sticky top-16 z-20 glass rounded-2xl border border-white/5 px-4 py-3 backdrop-blur-xl">
          <StepIndicator current={step} total={TOTAL_STEPS} onNavigate={goStep} />
          <div className="flex items-center justify-between mt-2 mb-1.5">
            <span className="text-xs font-medium text-zinc-400">
              {STEP_META[step - 1]?.label}
            </span>
            <span className="text-xs font-bold gradient-text">
              {progress.pct}%
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress.pct}%` }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            />
          </div>
          {progress.pct === 100 && (
            <p className="text-[10px] text-emerald-400 mt-1.5 flex items-center gap-1">
              <CheckCircle2 size={11} /> Briefing completo — pronto para gerar!
            </p>
          )}
        </div>
      )}

      {/* ── Step 1: Nicho ── */}
      <AnimatePresence mode="wait">
      {step === 1 && (
        <Step key="nicho" title="Nicho" subtitle="Qual é o ramo do seu negócio?">
        <div className="space-y-4">
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
                      if (isSelected) {
                        wizard.updateField('niche', '');
                      } else {
                        wizard.updateField('niche', n.label);
                        // Auto-gera frase de impacto do nicho se vazio ou se era uma sugestão antiga
                        const sugs = HEADLINES_BY_NICHE[n.label] || HEADLINES_BY_NICHE.default;
                        const allSugs = Object.values(HEADLINES_BY_NICHE).flat();
                        const curSlogan = wizard.slogan || '';
                        if (!curSlogan || allSugs.includes(curSlogan)) {
                          wizard.updateField('slogan', sugs[0]);
                          toast.success(`Frase de impacto gerada: "${sugs[0]}"`);
                        }
                        // Aplica as seções recomendadas do nicho se o usuário não escolheu manualmente
                        if (wizard.structures.length === 0) {
                          const recIds = NICHE_STRUCTURES[n.id] || DEFAULT_STRUCTURES;
                          useWizardStore.setState({ structures: recIds as any });
                          toast.success(`Seções sugeridas para ${n.label} aplicadas`);
                        }
                      }
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
        </div>
      </Step>
      )}

      {/* ── Step 3: Identidade Visual ── */}
      {step === 3 && (
        <Step key="identidade" title="Identidade Visual" subtitle="Estilo, paleta e tipografia">
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

          {/* Paleta de Cores */}
          <div>
            <label className="text-xs text-zinc-400 mb-2 block">Paleta de Cores</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {PALETTES.map((p) => {
                const isSelected = wizard.palette === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      wizard.updateField('palette', p.id);
                      if (p.primary) wizard.updateField('primaryColor', p.primary);
                      if (p.secondary) wizard.updateField('secondaryColor', p.secondary);
                    }}
                    className={cn(
                      'p-2 rounded-lg text-left transition-all border flex items-center gap-2',
                      isSelected
                        ? 'border-purple-500/40 bg-purple-500/10'
                        : 'border-white/5 hover:border-white/10'
                    )}
                  >
                    {p.id === 'personalizada' ? (
                      <span className="w-8 h-8 rounded-md border border-white/10 bg-gradient-to-br from-purple-500 via-pink-500 to-amber-400 flex items-center justify-center">
                        <span className="text-[10px]">🎨</span>
                      </span>
                    ) : (
                      <span className="flex w-8 h-8 rounded-md overflow-hidden border border-white/10">
                        <span className="flex-1" style={{ backgroundColor: p.primary }} />
                        <span className="flex-1" style={{ backgroundColor: p.secondary }} />
                      </span>
                    )}
                    <span className="text-[10px] sm:text-xs text-white">{p.label}</span>
                  </button>
                );
              })}
            </div>

            {(wizard.palette === 'personalizada' || !PALETTES.some(p => p.id === wizard.palette)) && (
              <div className="flex gap-4 items-center mt-3">
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
                  {['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'].map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        const pairs: Record<string, string> = {
                          '#8B5CF6': '#A78BFA', '#3B82F6': '#06B6D4', '#10B981': '#34D399',
                          '#F59E0B': '#EF4444', '#EF4444': '#F97316', '#EC4899': '#8B5CF6',
                        };
                        wizard.updateField('primaryColor', c);
                        wizard.updateField('secondaryColor', pairs[c] || '#A78BFA');
                      }}
                      className="w-6 h-6 rounded-md border border-white/10 hover:scale-110 transition-transform"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            )}
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
      </Step>
      )}

      {/* ── Step 4: Animações ── */}
      {step === 4 && (
        <Step key="animacoes" title="Animações" subtitle="Animações, efeitos premium e recursos do site">
        <div className="space-y-4">
          {/* Animações */}
          <div>
            <label className="text-xs text-zinc-400 mb-2 flex items-center gap-1.5">
              Animações
              <span className="text-[9px] uppercase tracking-wider text-zinc-500 bg-white/5 border border-white/10 rounded-full px-1.5 py-0.5">
                {isPro ? '40+' : '15 disponíveis'}
              </span>
            </label>
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

          {/* Efeitos Visuais Premium */}
          <div>
            <label className="text-xs text-zinc-400 mb-2 flex items-center gap-1.5">
              Efeitos Visuais
              <span className="text-[9px] uppercase tracking-wider text-amber-400/90 bg-amber-500/10 border border-amber-500/20 rounded-full px-1.5 py-0.5">
                nível Awwwards
              </span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {VISUAL_EFFECTS.map((e) => {
                const isSelected = wizard.visualEffects?.includes(e.id) ?? false;
                return (
                  <button
                    key={e.id}
                    title={e.description}
                    onClick={() => wizard.toggleVisualEffect(e.id)}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-medium transition-all border',
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                        : 'border-white/5 text-zinc-500 hover:border-white/10 hover:text-zinc-400'
                    )}
                  >
                    {e.label}
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-zinc-600 mt-1.5">
              Efeitos premium de interação e acabamento — implementados com moderação e propósito.
            </p>
          </div>

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
        </div>
      </Step>
      )}

      {/* ── Step 2: Empresa ── */}
      {step === 2 && (
        <Step key="empresa" title="Empresa" subtitle="Dados do negócio — quanto mais completo, mais rico o prompt">
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
            <label className="text-xs text-zinc-400 mb-1.5 block">
              Frase de Impacto <span className="text-zinc-600">(headline do site)</span>
            </label>
            <input
              type="text"
              value={wizard.slogan || ''}
              onChange={(e) => wizard.updateField('slogan', e.target.value)}
              placeholder="Ex: Sua melhor versão começa aqui"
              className="input-glass"
            />
            <p className="text-[10px] text-zinc-600 mt-1">
              Vira o título principal do hero. Sem isso, a IA inventa um genérico.
            </p>
            {wizard.niche && (
              <div className="mt-2">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Sugestões para {wizard.niche}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const sugs = HEADLINES_BY_NICHE[wizard.niche!] || HEADLINES_BY_NICHE.default;
                      const next = sugs[Math.floor(Math.random() * sugs.length)];
                      wizard.updateField('slogan', next);
                      toast.success(`Frase: "${next}"`);
                    }}
                    className="text-[10px] px-2 py-0.5 rounded-md border border-white/10 hover:border-purple-500/40 hover:text-purple-300 text-zinc-400 transition-all"
                    title="Sortear outra frase"
                  >
                    🎲 Sortear
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(HEADLINES_BY_NICHE[wizard.niche] || HEADLINES_BY_NICHE.default).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => wizard.updateField('slogan', s)}
                      className={cn(
                        'px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-medium transition-all border',
                        wizard.slogan === s
                          ? 'bg-purple-500/15 border-purple-500/40 text-purple-300'
                          : 'border-white/5 text-zinc-500 hover:border-white/10 hover:text-zinc-400'
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              <label className="text-xs text-zinc-400 mb-1.5 block">
                CTA Principal <span className="text-zinc-600">(ação de conversão)</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {CTA_OPTIONS.map((c) => {
                  const isSelected = wizard.cta === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => wizard.updateField('cta', isSelected ? '' : c.id)}
                      className={cn(
                        'px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border flex items-center gap-1',
                        isSelected
                          ? 'bg-purple-500/15 border-purple-500/40 text-purple-300'
                          : 'border-white/5 text-zinc-400 hover:border-white/10'
                      )}
                    >
                      <span>{c.emoji}</span>
                      {c.label}
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-zinc-600 mt-1">
                Vira o botão em destaque no hero e repetido na página.
              </p>
            </div>
          </div>

          {/* ── Contato & Localização ── */}
          <div className="border-t border-white/5 pt-4">
            <p className="text-xs text-zinc-500 mb-3 flex items-center gap-1.5">
              <Globe size={12} /> Contato & Localização <span className="text-zinc-700">(opcional)</span>
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
                <label className="text-[10px] text-zinc-500 mb-1 block">Link do Google Maps</label>
                <input
                  type="text"
                  value={wizard.mapsUrl || ''}
                  onChange={(e) => wizard.updateField('mapsUrl', e.target.value)}
                  placeholder="https://maps.app.goo.gl/..."
                  className="input-glass"
                />
                <p className="text-[10px] text-zinc-600 mt-1">
                  💡 Com o link do Maps, o prompt instrui a IA a aproveitar endereço, cidade, estado, avaliações, horário e fotos do seu perfil.
                </p>
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

          <div className="border-t border-white/5 pt-4">
            <label className="text-xs text-zinc-400 mb-1.5 block">
              💡 Conte sua ideia <span className="text-zinc-600">(opcional)</span>
            </label>
            <textarea
              value={wizard.description || ''}
              onChange={(e) => wizard.updateField('description', e.target.value)}
              placeholder={`Exemplo:\n\nQuero um site que transmita confiança e traga clientes pelo WhatsApp. Destaque meus serviços e depoimentos.`}
              rows={4}
              className="input-glass resize-none w-full text-sm leading-relaxed"
            />
          </div>

          <div>
            <label className="text-xs text-zinc-400 mb-1.5 block">Público-Alvo <span className="text-zinc-600">(opcional)</span></label>
            <input
              type="text"
              value={wizard.targetAudience || ''}
              onChange={(e) => wizard.updateField('targetAudience', e.target.value)}
              placeholder="Ex: Famílias de 25 a 50 anos, classe B"
              className="input-glass"
            />
          </div>
        </div>
      </Step>
      )}

      {/* ── Step 5: Inteligência IA ── */}
      {step === 5 && (
        <Step key="ia" title="Inteligência IA" subtitle="Escolha a direção estratégica — muda completamente o prompt">
        <div className="space-y-3">
          {AI_MODES.map((m) => {
            const isSelected = wizard.aiMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => wizard.updateField('aiMode', m.id)}
                className={cn(
                  'w-full p-3.5 rounded-xl text-left transition-all border',
                  isSelected
                    ? 'border-purple-500/40 bg-purple-500/10 shadow-lg shadow-purple-500/10'
                    : 'border-white/5 hover:border-white/10'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{m.emoji}</span>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-white">{m.label}</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">{m.description}</p>
                  </div>
                  {isSelected && <CheckCircle2 size={16} className="text-purple-400" />}
                </div>
              </button>
            );
          })}

          {/* Modo WOW */}
          <div
            onClick={() => wizard.updateField('wowMode', !wizard.wowMode)}
            className={cn(
              'flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all',
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
      </Step>
      )}

            {/* ── Step 6: Gerar ── */}
            {step === 6 && (
            <Step key="gerar" title="Gerar" subtitle="Confira o resumo e gere o prompt ultra premium">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Empresa', value: wizard.companyName || '—' },
                  { label: 'Headline', value: wizard.slogan || '—' },
                  { label: 'Nicho', value: wizard.niche || wizard.customNiche || '—' },
                  { label: 'Objetivo', value: OBJECTIVES.find(o => o.id === wizard.objective)?.label || '—' },
                  { label: 'CTA', value: CTA_OPTIONS.find(c => c.id === wizard.cta)?.label || '—' },
                  { label: 'Estilo', value: STYLES.find(s => s.id === wizard.style)?.label || '—' },
                  { label: 'Paleta', value: PALETTES.find(p => p.id === wizard.palette)?.label || 'Personalizada' },
                  { label: 'Tipografia', value: wizard.font || '—' },
                  { label: 'Modo IA', value: AI_MODES.find(m => m.id === wizard.aiMode)?.label || '—' },
                  { label: 'Seções', value: wizard.structures.length ? `${wizard.structures.length} selecionadas` : 'Recomendadas pelo nicho' },
                  { label: 'Funcionalidades', value: wizard.functionalities.length ? `${wizard.functionalities.length} selecionadas` : '—' },
                  { label: 'Animações', value: wizard.animations.length ? `${wizard.animations.length} selecionadas` : '—' },
                  { label: 'Efeitos Visuais', value: wizard.visualEffects?.length ? `${wizard.visualEffects.length} selecionados` : '—' },
                  { label: 'Referências', value: referenceUrls.length + referenceFiles.length ? `${referenceUrls.length + referenceFiles.length} anexadas` : '—' },
                  { label: 'Modo WOW', value: wizard.wowMode ? 'Ativado ✨' : 'Desativado' },
                ].map((item) => (
                  <div key={item.label} className="bg-white/[0.03] border border-white/5 rounded-lg px-3 py-2">
                    <p className="text-[9px] uppercase tracking-wide text-zinc-600">{item.label}</p>
                    <p className="text-xs text-zinc-200 font-medium mt-0.5 truncate">{item.value}</p>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-zinc-600 text-center">
                Volte nos passos para ajustar. Pronto? Clique em Gerar Prompt abaixo.
              </p>
            </div>
            </Step>
            )}
      </AnimatePresence>

            {/* ── Sticky Action Bar (navegação / gerar) ── */}
      {!showResult && !showTerminal && (
        <div className="sticky bottom-0 pt-4 pb-6 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f] to-transparent">
          {step < TOTAL_STEPS ? (
            <div className="flex gap-2">
              <button
                onClick={() => goStep(step - 1)}
                disabled={step === 1}
                className={cn(
                  'px-4 py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 border',
                  step === 1
                    ? 'bg-zinc-900 text-zinc-700 border-white/5 cursor-not-allowed'
                    : 'bg-white/5 text-zinc-300 border-white/10 hover:bg-white/10'
                )}
              >
                <ChevronLeft size={16} />
                Voltar
              </button>
              <button
                onClick={() => goStep(step + 1)}
                className="flex-1 py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500 shadow-lg shadow-purple-500/20"
              >
                Continuar
                <ChevronRight size={16} />
              </button>
            </div>
          ) : (
            <>
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
              disabled={generating || progress.filled === 0}
              className={cn(
                'w-full py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2',
                progress.filled === 0
                  ? 'bg-zinc-800 text-zinc-500 border border-white/10 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500 shadow-lg shadow-purple-500/20'
              )}
            >
              <Zap size={18} />
              Gerar Prompt
            </button>
          )}
          <p className="text-[10px] text-zinc-600 text-center mt-2">
            {progress.filled === 0
              ? 'Preencha pelo menos uma seção para gerar o prompt.'
              : 'Campos vazios serão ignorados. O sistema monta um briefing profissional automaticamente.'}
          </p>
            </>
          )}
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
