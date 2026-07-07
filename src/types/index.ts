export type Theme = 'dark' | 'light' | 'auto';

export type Language = 'pt' | 'en' | 'es' | 'fr' | 'de' | 'it';

export type PlanTier = 'none' | 'starter' | 'pro';

export type Platform =
  | 'lovable'
  | 'bolt'
  | 'v0'
  | 'cursor'
  | 'claude-code'
  | 'replit';

export type NicheCategory =
  | 'ecommerce'
  | 'saas'
  | 'health'
  | 'education'
  | 'real-estate'
  | 'finance'
  | 'food'
  | 'fitness'
  | 'beauty'
  | 'travel'
  | 'tech'
  | 'marketing'
  | 'law'
  | 'construction'
  | 'automotive'
  | 'entertainment'
  | 'fashion'
  | 'pets'
  | 'photography'
  | 'music'
  | 'games'
  | 'sports'
  | 'logistics'
  | 'agriculture'
  | 'consulting'
  | 'events'
  | 'art'
  | 'nonprofit'
  | 'security'
  | 'iot'
  | 'blockchain'
  | 'ai'
  | 'servicos';

export type PromptStyle =
  | 'minimalista'
  | 'brutalista'
  | 'glassmorphism'
  | 'neumorphism'
  | 'cyberpunk'
  | 'retrowave'
  | 'organic'
  | 'luxury'
  | 'corporate'
  | 'playful'
  | 'editorial'
  | 'dark-mode'
  | 'flat-design'
  | 'gradient-rich';

export type AnimationType =
  | 'scroll-reveal'
  | 'parallax'
  | 'hover-effects'
  | 'page-transitions'
  | 'loading-skeletons'
  | 'micro-interactions'
  | 'typing-effect'
  | 'glitch-effect'
  | 'morphing'
  | 'infinite-scroll'
  | 'stagger-children'
  | 'cursor-trail'
  | 'count-up'
  | 'marquee';

export type TechnologyCategory = 'frontend' | 'backend' | 'database' | 'hosting';

export type SiteStructure =
  | 'navbar-hero'
  | 'sobre'
  | 'servicos'
  | 'projetos'
  | 'portfolio'
  | 'equipe'
  | 'clientes'
  | 'galeria'
  | 'depoimentos'
  | 'faq'
  | 'precos'
  | 'contato'
  | 'footer'
  | 'cta-final'
  | 'blog'
  | 'area-cliente'
  | 'hero' | 'features' | 'pricing' | 'testimonials' | 'cta'
  | 'about' | 'team' | 'contact' | 'stats' | 'timeline'
  | 'integrations' | 'newsletter';

export type Functionality =
  | 'auth'
  | 'payment'
  | 'search'
  | 'notifications'
  | 'chat'
  | 'file-upload'
  | 'upload'
  | 'download'
  | 'dark-mode'
  | 'multilingual'
  | 'analytics'
  | 'social-share'
  | 'comments'
  | 'newsletter'
  | 'booking'
  | 'dashboard'
  | 'api'
  | 'export'
  | 'filters'
  | 'sorting'
  | 'pagination'
  | 'caching';

export type Objective =
  | 'landing-page'
  | 'site-institucional'
  | 'ecommerce'
  | 'portfolio'
  | 'blog'
  | 'dashboard'
  | 'marketplace'
  | 'assinatura'
  | 'curso-online'
  | 'rede-social'
  | 'app-mobile'
  | 'sistema-gestao'
  | 'landing-eventos'
  | 'one-page'
  | 'sistema-web'
  | 'pagina-captura'
  | 'area-membros'
  | 'crm'
  | 'erp'
  | 'sistema-admin';

export type ContractType =
  | 'site'
  | 'landing-page'
  | 'sistema-web'
  | 'dashboard'
  | 'aplicativo'
  | 'loja-virtual'
  | 'saas'
  | 'manutencao'
  | 'hospedagem'
  | 'consultoria'
  | 'seo'
  | 'marketing-digital';

export type ContractClause =
  | 'escopo'
  | 'prazo'
  | 'valor'
  | 'pagamento'
  | 'entrega'
  | 'revisao'
  | 'rescisao'
  | 'confidencialidade'
  | 'propriedade'
  | 'garantia'
  | 'foro';

export type PaymentMethod = 'pix' | 'cartao' | 'boleto' | 'transferencia';

export type ProjectStatus = 'draft' | 'active' | 'completed' | 'archived';

export type PromptStatus = 'draft' | 'generated' | 'approved' | 'archived';

export type ContractStatus = 'draft' | 'pending' | 'signed' | 'expired';

export type ProposalStatus = 'draft' | 'sent' | 'accepted' | 'rejected';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  plan: PlanTier;
  createdAt: string;
  company: string;
  phone: string;
  bio: string;
  location: string;
  website: string;
}

export interface Plan {
  id: PlanTier;
  name: string;
  price: number;
  currency: string;
  period: 'monthly' | 'annual';
  features: string[];
  highlighted: boolean;
  color: string;
  icon: string;
  promptLimit: number;
  contractLimit: number;
  projectLimit: number;
  teamMembers: number;
  analytics: boolean;
  prioritySupport: boolean;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: PlanTier;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  paymentMethod: PaymentMethod;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  description: string;
  status: ProjectStatus;
  niche: NicheCategory;
  platform: Platform;
  promptCount: number;
  contractCount: number;
  createdAt: string;
  updatedAt: string;
  color: string;
  tags: string[];
}

export interface Prompt {
  id: string;
  projectId: string;
  userId: string;
  title: string;
  content: string;
  rawPrompt: string;
  status: PromptStatus;
  objective: Objective;
  niche: NicheCategory;
  style: PromptStyle;
  platform: Platform;
  language: Language;
  technologies: string[];
  animations: AnimationType[];
  structures: SiteStructure[];
  functionalities: Functionality[];
  font: string;
  colorScheme: string;
  favorites: boolean;
  version: number;
  tokens: number;
  estimatedTime: number;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export interface Contract {
  id: string;
  projectId: string;
  userId: string;
  title: string;
  content: string;
  status: ContractStatus;
  type: ContractType;
  clauses: ContractClause[];
  totalValue: number;
  paymentMethod: PaymentMethod;
  dueDate: string;
  clientName: string;
  clientEmail: string;
  clientDocument: string;
  companyName: string;
  companyDocument: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export interface Proposal {
  id: string;
  projectId: string;
  userId: string;
  title: string;
  content: string;
  status: ProposalStatus;
  clientName: string;
  clientEmail: string;
  totalValue: number;
  timeline: string;
  deliverableCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  projectId: string;
  userId: string;
  clientName: string;
  items: BudgetItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentTerms: string;
  validityDays: number;
  status: 'draft' | 'sent' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface BudgetItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  category: string;
}

export interface Briefing {
  id: string;
  projectId: string;
  userId: string;
  clientName: string;
  companyName: string;
  industry: NicheCategory;
  objectives: Objective[];
  targetAudience: string;
  competitorUrls: string[];
  referenceUrls: string[];
  colorPreferences: string[];
  fontPreferences: string[];
  tone: string;
  mandatoryElements: string[];
  avoidedElements: string[];
  deadline: string;
  budget: number;
  additionalNotes: string;
  createdAt: string;
  updatedAt: string;
}

export interface WizardStep {
  id: number;
  title: string;
  description: string;
  icon: string;
  fields: string[];
}

export interface WizardState {
  currentStep: number;
  totalSteps: number;
  completedSteps: number[];
  objective: Objective | null;
  niche: NicheCategory | null;
  style: PromptStyle | null;
  platform: Platform | null;
  language: Language;
  technologies: string[];
  animations: AnimationType[];
  structures: SiteStructure[];
  functionalities: Functionality[];
  font: string;
  colorScheme: string;
  primaryColor: string;
  secondaryColor: string;
  targetAudience: string;
  referenceUrl: string;
  description: string;
  additionalContext: string;
}

export interface WizardStepConfig {
  id: number;
  title: string;
  description: string;
  icon: string;
  component: string;
}

export interface Niche {
  id: NicheCategory;
  label: string;
  labelEn: string;
  icon: string;
  emoji: string;
  description: string;
  color: string;
  premium?: boolean;
}

export interface StyleOption {
  id: PromptStyle;
  label: string;
  labelEn: string;
  icon: string;
  description: string;
  preview: string;
  premium?: boolean;
}

export interface PlatformOption {
  id: Platform;
  label: string;
  icon: string;
  url: string;
  description: string;
  color: string;
}

export interface LanguageOption {
  id: Language;
  label: string;
  flag: string;
  nativeName: string;
}

export interface AnimationOption {
  id: AnimationType;
  label: string;
  description: string;
  category: string;
  premium?: boolean;
}

export interface TechnologyOption {
  id: string;
  label: string;
  category: TechnologyCategory;
  icon: string;
  popular: boolean;
}

export interface FontOption {
  id: string;
  label: string;
  category: 'sans-serif' | 'serif' | 'display' | 'mono';
  googleUrl: string;
  preview: string;
}

export interface StructureOption {
  id: SiteStructure;
  label: string;
  icon: string;
  description: string;
}

export interface FunctionalityOption {
  id: Functionality;
  label: string;
  icon: string;
  category: string;
  complexity: 'low' | 'medium' | 'high';
}

export interface ObjectiveOption {
  id: Objective;
  label: string;
  icon: string;
  description: string;
}

export interface ContractTypeOption {
  id: ContractType;
  label: string;
  icon: string;
  description: string;
  defaultClauses: ContractClause[];
}

export interface ClauseOption {
  id: ContractClause;
  label: string;
  icon: string;
  description: string;
  required: boolean;
}

export interface PaymentMethodOption {
  id: PaymentMethod;
  label: string;
  icon: string;
  description: string;
}

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  badge?: number;
  children?: NavItem[];
}

export interface DashboardStats {
  totalProjects: number;
  totalPrompts: number;
  totalContracts: number;
  totalProposals: number;
  promptsThisMonth: number;
  contractsThisMonth: number;
  revenueThisMonth: number;
  activeClients: number;
}

export interface GenerationResult {
  id: string;
  content: string;
  tokens: number;
  estimatedTime: number;
  model: string;
  timestamp: string;
}

export interface NvidiaPromptResponse {
  id: string;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  choices: Array<{
    index: number;
    message: {
      role: 'assistant';
      content: string;
    };
    finish_reason: 'stop' | 'length' | 'content_filter';
  }>;
}

export interface NvidiaContractResponse {
  id: string;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  content: string;
  metadata: {
    wordCount: number;
    clauseCount: number;
    generatedAt: string;
  };
}

export interface NvidiaProposalResponse {
  id: string;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  content: string;
  sections: string[];
}

export interface ApiError {
  code: string;
  message: string;
  details?: string;
}

export interface FilterOptions {
  search: string;
  niche: NicheCategory | 'all';
  platform: Platform | 'all';
  status: PromptStatus | ContractStatus | 'all';
  sortBy: 'date' | 'name' | 'tokens' | 'status';
  sortOrder: 'asc' | 'desc';
  favorites?: boolean;
}

export interface PromptGenerationData {
  objective: Objective;
  niche: NicheCategory;
  style: PromptStyle;
  platform: Platform;
  language: Language;
  technologies: string[];
  animations: AnimationType[];
  structures: SiteStructure[];
  functionalities: Functionality[];
  font: string;
  colorScheme: string;
  targetAudience: string;
  referenceUrl: string;
  description: string;
  additionalContext: string;
}

export interface ContractGenerationData {
  type: ContractType;
  clauses: ContractClause[];
  totalValue: number;
  paymentMethod: PaymentMethod;
  dueDate: string;
  clientName: string;
  clientEmail: string;
  clientDocument: string;
  companyName: string;
  companyDocument: string;
  projectDescription: string;
  additionalTerms: string;
  language: Language;
}

export interface ProposalGenerationData {
  clientName: string;
  clientEmail: string;
  projectDescription: string;
  totalValue: number;
  timeline: string;
  deliverables: string[];
  technologies: string[];
  teamSize: number;
  language: Language;
  additionalNotes: string;
}