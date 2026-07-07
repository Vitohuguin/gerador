import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Contract } from '../types';
import { generateId } from '../lib/utils';

interface ContractStore {
  contracts: Contract[];
  addContract: (data: Partial<Contract>) => Contract;
  updateContract: (id: string, data: Partial<Contract>) => void;
  deleteContract: (id: string) => void;
  duplicateContract: (id: string) => Contract | null;
  getContractById: (id: string) => Contract | undefined;
}

const MOCK_CONTRACTS: Contract[] = [
  {
    id: 'ct_001', projectId: 'proj_001', userId: 'usr_demo_001',
    title: 'Contrato - Desenvolvimento de Site - Clínica Saúde+',
    content: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE DESENVOLVIMENTO DE SITE

Pelo presente instrumento particular, as partes abaixo qualificadas celebram o presente contrato de prestação de serviços de desenvolvimento de site, que se regerá pelas cláusulas seguintes:

**CONTRATANTE:**
Nome: Dr. Carlos Alberto
CPF/CNPJ: 123.456.789-00
Email: carlos@clinicasaude.com.br

**CONTRATADO:**
Nome: Ana Silva
Empresa: PixelCraft Studio
CPF/CNPJ: 987.654.321-00

**CLÁUSULA PRIMEIRA — ESCOPO DO PROJETO**
Desenvolvimento de site institucional para clínica médica, incluindo: Hero, Sobre, Especialidades, Equipe, Depoimentos, FAQ, Agendamento Online, Footer.

**CLÁUSULA SEGUNDA — PRAZO**
Início: 15/06/2025
Entrega: 15/07/2025 (30 dias corridos)
Revisões: 3 ciclos de revisão inclusos

**CLÁUSULA TERCEIRA — VALOR**
Valor total: R$ 4.500,00
Entrada (50%): R$ 2.250,00
Restante (50%): R$ 2.250,00 na entrega

**CLÁUSULA QUARTA — FORMA DE PAGAMENTO**
PIX: pix@pixelcraft.studio

**CLÁUSULA QUINTA — CONFIDENCIALIDADE**
Ambas as partes se comprometem a manter sigilo absoluto sobre as informações compartilhadas...

**CLÁUSULA SEXTA — DIREITOS AUTORAIS**
Após o pagamento integral, todos os direitos autorais do código-fonte serão transferidos ao contratante...

**CLÁUSULA SÉTIMA — RESCISÃO**
Em caso de rescisão sem justa causa, o contratante pagará pelos serviços já executados...

**CLÁUSULA OITAVA — FORO**
Fica eleito o foro da comarca de São Paulo, SP para dirimir quaisquer dúvidas...

São Paulo, SP, 10 de junho de 2025.`,
    status: 'signed', type: 'site',
    clauses: ['escopo', 'prazo', 'valor', 'pagamento', 'revisao', 'confidencialidade', 'propriedade', 'rescisao', 'foro'],
    totalValue: 4500, paymentMethod: 'pix', dueDate: '2025-07-15T00:00:00Z',
    clientName: 'Dr. Carlos Alberto', clientEmail: 'carlos@clinicasaude.com.br', clientDocument: '123.456.789-00',
    companyName: 'PixelCraft Studio', companyDocument: '987.654.321-00',
    version: 1, createdAt: '2025-06-10T10:00:00Z', updatedAt: '2025-06-12T14:00:00Z', tags: ['site', 'clinica'],
  },
];

export const useContractStore = create<ContractStore>()(
  persist(
    (set, get) => ({
      contracts: MOCK_CONTRACTS,

  addContract: (data) => {
    const contract: Contract = {
      id: generateId(), projectId: data.projectId || '', userId: data.userId || 'usr_demo_001',
      title: data.title || 'Novo Contrato', content: data.content || '',
      status: data.status || 'draft', type: data.type || 'site',
      clauses: data.clauses || [], totalValue: data.totalValue || 0,
      paymentMethod: data.paymentMethod || 'pix', dueDate: data.dueDate || '',
      clientName: data.clientName || '', clientEmail: data.clientEmail || '',
      clientDocument: data.clientDocument || '', companyName: data.companyName || '',
      companyDocument: data.companyDocument || '', version: 1,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), tags: data.tags || [],
    };
    set((s) => ({ contracts: [contract, ...s.contracts] }));
    return contract;
  },

  updateContract: (id, data) => {
    set((s) => ({
      contracts: s.contracts.map((c) =>
        c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString(), version: c.version + 1 } : c
      ),
    }));
  },

  deleteContract: (id) => {
    set((s) => ({ contracts: s.contracts.filter((c) => c.id !== id) }));
  },

  duplicateContract: (id) => {
    const original = get().contracts.find((c) => c.id === id);
    if (!original) return null;
    const copy: Contract = { ...original, id: generateId(), title: `${original.title} (Cópia)`, status: 'draft', version: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    set((s) => ({ contracts: [copy, ...s.contracts] }));
    return copy;
  },

  getContractById: (id) => get().contracts.find((c) => c.id === id),
    }),
    { name: 'promptforge-contracts' }
  )
);