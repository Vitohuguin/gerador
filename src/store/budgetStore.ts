import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '../lib/utils';

export interface BudgetItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Budget {
  id: string;
  clientName: string;
  clientEmail: string;
  items: BudgetItem[];
  subtotal: number;
  discount: number;
  discountType: 'percent' | 'fixed';
  tax: number;
  taxType: 'percent' | 'fixed';
  total: number;
  notes: string;
  validityDays: number;
  createdAt: string;
}

interface BudgetStore {
  budgets: Budget[];
  addBudget: (data: Omit<Budget, 'id' | 'createdAt'>) => void;
  updateBudget: (id: string, data: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
}

export const useBudgetStore = create<BudgetStore>()(
  persist(
    (set) => ({
      budgets: [],
      addBudget: (data) => set((s) => ({
        budgets: [{ id: generateId(), ...data, createdAt: new Date().toISOString() }, ...s.budgets],
      })),
      updateBudget: (id, data) => set((s) => ({
        budgets: s.budgets.map((b) => b.id === id ? { ...b, ...data } : b),
      })),
      deleteBudget: (id) => set((s) => ({
        budgets: s.budgets.filter((b) => b.id !== id),
      })),
    }),
    { name: 'promptforge-budgets' }
  )
);
