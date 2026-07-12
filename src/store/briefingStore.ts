import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '../lib/utils';

export interface Briefing {
  id: string;
  clientName: string;
  companyName: string;
  industry: string;
  objectives: string[];
  projectDescription: string;
  targetAudience: string;
  competitors: string;
  references: string;
  colorPreferences: string;
  fontPreferences: string;
  tone: string;
  mandatoryElements: string;
  avoidedElements: string;
  deadline: string;
  budget: number;
  additionalNotes: string;
  createdAt: string;
}

interface BriefingStore {
  briefings: Briefing[];
  addBriefing: (data: Omit<Briefing, 'id' | 'createdAt'>) => void;
  updateBriefing: (id: string, data: Partial<Briefing>) => void;
  deleteBriefing: (id: string) => void;
}

export const useBriefingStore = create<BriefingStore>()(
  persist(
    (set) => ({
      briefings: [],
      addBriefing: (data) => set((s) => ({
        briefings: [{ id: generateId(), ...data, createdAt: new Date().toISOString() }, ...s.briefings],
      })),
      updateBriefing: (id, data) => set((s) => ({
        briefings: s.briefings.map((b) => b.id === id ? { ...b, ...data } : b),
      })),
      deleteBriefing: (id) => set((s) => ({
        briefings: s.briefings.filter((b) => b.id !== id),
      })),
    }),
    { name: 'promptforge-briefings' }
  )
);
