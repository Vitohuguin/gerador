import type { PromptGenerationData, ContractGenerationData, GenerationResult, ProposalGenerationData, User, PlanTier } from '../types';

const API_BASE = `/api`;

export function getToken(): string | null {
  try {
    const stored = localStorage.getItem('promptforge-auth');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.state?.token || null;
    }
  } catch {}
  return null;
}

async function request<T>(method: string, endpoint: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const opts: RequestInit = { method, headers, credentials: 'include' };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${API_BASE}/${endpoint}`, opts);
  if (!res.ok) {
    const err = await res.text();
    let msg: string;
    let code: string | undefined;
    try {
      const parsed = JSON.parse(err);
      msg = parsed.error || parsed.detail || err;
      code = parsed.code;
    } catch {
      msg = err;
    }
    const e = new Error(msg) as Error & { code?: string };
    if (code) e.code = code;
    throw e;
  }
  return res.json();
}

function get<T>(endpoint: string): Promise<T> { return request<T>('GET', endpoint); }
function post<T>(endpoint: string, body?: unknown): Promise<T> { return request<T>('POST', endpoint, body); }
function put<T>(endpoint: string, body?: unknown): Promise<T> { return request<T>('PUT', endpoint, body); }
function del<T>(endpoint: string): Promise<T> { return request<T>('DELETE', endpoint); }

export const authAPI = {
  login: (email: string, password: string) => post<{ token: string; user: User }>('auth/login', { email, password }),
  register: (data: { name: string; email: string; password: string; plan: PlanTier; company: string }) =>
    post<{ token?: string; user: User; message?: string }>('auth/register', data),
  me: () => get<{ user: User }>('auth/me'),
  updateProfile: (data: Partial<User>) => put<{ user: User }>('auth/profile', data),
  resetPassword: (email: string) => post<{ ok: boolean; message: string }>('auth/reset-password', { email }),
  updatePassword: (accessToken: string, password: string) => post<{ ok: boolean; message: string }>('auth/update-password', { accessToken, password }),
  deleteAccount: () => del<{ ok: boolean; message: string }>('auth/account'),
};

export const usageAPI = {
  getUsage: () => get<{ prompts: { used: number; limit: number }; contracts: { used: number; limit: number }; projects: { used: number; limit: number } }>('usage'),
  // Geração local do wizard: registra uso e aplica o limite do plano
  trackGeneration: () => post<{ ok: boolean; used: number; limit: number }>('generation-track'),
};

export const plansAPI = {
  checkout: (planId: string) => post<{ checkoutUrl: string; offerId: string; checkoutId?: string }>('plans/checkout', { planId }),
  sync: () => post<{ ok: boolean; products: Record<string, string> }>('plans/sync'),
  subscription: () => get<{ subscription: any | null; history: any[] }>('subscription'),
  cancel: () => post<{ ok: boolean; plan: string }>('subscription/cancel'),
};

export const nvidiaAPI = {
  generatePrompt: async (data: PromptGenerationData, language: string = 'pt'): Promise<GenerationResult> => {
    return post('generate-prompt', { ...data, language });
  },
  generateContract: async (data: ContractGenerationData): Promise<GenerationResult> => {
    return post('generate-contract', data);
  },
  generateProposal: async (data: ProposalGenerationData): Promise<GenerationResult> => {
    return post('generate-proposal', data);
  },
  improvePrompt: async (content: string): Promise<string> => {
    const res = await post<{ content: string }>('improve-prompt', { content });
    return res.content;
  },
  correctPrompt: async (content: string): Promise<string> => {
    const res = await post<{ content: string }>('correct-prompt', { content });
    return res.content;
  },
  optimizePrompt: async (content: string): Promise<string> => {
    const res = await post<{ content: string }>('optimize-prompt', { content });
    return res.content;
  },
  generateAlternative: async (content: string): Promise<string> => {
    const res = await post<{ content: string }>('generate-alternative', { content });
    return res.content;
  },
};
