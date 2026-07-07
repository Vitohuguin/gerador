import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '../lib/utils';
import type { ProposalStatus } from '../types';

export interface ProposalItem {
  id: string;
  title: string;
  clientName: string;
  clientEmail: string;
  projectScope: string;
  technologies: string;
  timeline: string;
  totalValue: number;
  notes: string;
  status: ProposalStatus;
  createdAt: string;
}

interface ProposalStore {
  proposals: ProposalItem[];
  addProposal: (data: Partial<ProposalItem>) => ProposalItem;
  updateProposal: (id: string, data: Partial<ProposalItem>) => void;
  deleteProposal: (id: string) => void;
  getProposalById: (id: string) => ProposalItem | undefined;
}

const MOCK_PROPOSALS: ProposalItem[] = [
  {
    id: 'prop_001', title: 'Proposta - Site Clínica Saúde+', clientName: 'Dr. Carlos Alberto',
    clientEmail: 'carlos@clinicasaude.com.br', projectScope: 'Desenvolvimento de landing page para clínica médica',
    technologies: 'React, Next.js, Tailwind CSS', timeline: '30 dias', totalValue: 4500,
    notes: 'Inclui 3 revisões', status: 'sent', createdAt: '2025-06-20T10:00:00Z',
  },
  {
    id: 'prop_002', title: 'Proposta - Dashboard TechFlow', clientName: 'TechFlow SaaS',
    clientEmail: 'contato@techflow.io', projectScope: 'Dashboard financeiro completo',
    technologies: 'React, TypeScript, Supabase', timeline: '45 dias', totalValue: 12000,
    notes: '', status: 'draft', createdAt: '2025-06-25T14:00:00Z',
  },
];

export const useProposalStore = create<ProposalStore>()(
  persist(
    (set, get) => ({
      proposals: MOCK_PROPOSALS,

      addProposal: (data) => {
        const proposal: ProposalItem = {
          id: generateId(),
          title: data.title || 'Nova Proposta',
          clientName: data.clientName || '',
          clientEmail: data.clientEmail || '',
          projectScope: data.projectScope || '',
          technologies: data.technologies || '',
          timeline: data.timeline || '30 dias',
          totalValue: data.totalValue || 0,
          notes: data.notes || '',
          status: data.status || 'draft',
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ proposals: [proposal, ...s.proposals] }));
        return proposal;
      },

      updateProposal: (id, data) => {
        set((s) => ({
          proposals: s.proposals.map((p) =>
            p.id === id ? { ...p, ...data } : p
          ),
        }));
      },

      deleteProposal: (id) => {
        set((s) => ({ proposals: s.proposals.filter((p) => p.id !== id) }));
      },

      getProposalById: (id) => get().proposals.find((p) => p.id === id),
    }),
    { name: 'promptforge-proposals' }
  )
);