import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WizardState, NicheCategory, Objective, PromptStyle, Platform, Language, AnimationType, SiteStructure, Functionality } from '../types';

interface WizardStore extends WizardState {
  projectName: string;
  companyName: string;
  slogan: string;
  segment: string;
  city: string;
  state: string;
  country: string;
  neighborhood: string;
  address: string;
  businessDescription: string;
  marketTime: string;
  whatsapp: string;
  phone: string;
  email: string;
  currentSite: string;
  googleMaps: string;
  instagram: string;
  facebook: string;
  targetAudience: string;
  ageRange: string;
  socialClass: string;
  projectGoal: string;
  mainPains: string;
  mainDesires: string;
  customNiche: string;
  briefingNotes: string;
  customObjective: string;
  wowMode: boolean;
  cta: string;
  visualEffects: string[];
  palette: string;
  aiMode: string;
  mapsUrl: string;

  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  completeStep: (step: number) => void;
  updateWizard: (data: Partial<WizardState>) => void;
  updateField: (field: string, value: string | boolean | number) => void;
  toggleAnimation: (anim: AnimationType) => void;
  toggleStructure: (struct: SiteStructure) => void;
  toggleFunctionality: (func: Functionality) => void;
  toggleVisualEffect: (id: string) => void;
  resetWizard: () => void;
}

const initialState: WizardState & {
  projectName: string;
  companyName: string; slogan: string; segment: string; city: string; state: string; country: string;
  neighborhood: string; address: string; businessDescription: string; marketTime: string;
  whatsapp: string; phone: string; email: string; currentSite: string; googleMaps: string;
  instagram: string; facebook: string;
  targetAudience: string; ageRange: string; socialClass: string; projectGoal: string;
  mainPains: string; mainDesires: string; customNiche: string; briefingNotes: string;
  customObjective: string;
  wowMode: boolean;
  cta: string;
  visualEffects: string[];
  palette: string;
  aiMode: string;
} = {
  currentStep: 1, totalSteps: 1, completedSteps: [],
  objective: null, niche: null, style: null, platform: 'lovable', language: 'pt',
  animations: [], structures: [], functionalities: [],
  font: 'Inter', colorScheme: 'Personalizada', primaryColor: '#8B5CF6', secondaryColor: '#A78BFA',
  targetAudience: '', referenceUrl: '', description: '', additionalContext: '',
  projectName: '',
  companyName: '', slogan: '', segment: '', city: '', state: '', country: 'Brasil',
  neighborhood: '', address: '', businessDescription: '', marketTime: '',
  whatsapp: '', phone: '', email: '', currentSite: '', googleMaps: '',
  instagram: '', facebook: '',
  ageRange: '', socialClass: '', projectGoal: '', mainPains: '',
  mainDesires: '', customNiche: '', briefingNotes: '', customObjective: '', wowMode: false, cta: '',
  visualEffects: [], palette: 'preto-dourado', aiMode: 'visual-premium', mapsUrl: '',
};

export const useWizardStore = create<WizardStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setStep: (step) => set({ currentStep: step }),

      nextStep: () => {
        const { currentStep, totalSteps } = get();
        if (currentStep < totalSteps) {
          set({ currentStep: currentStep + 1 });
        }
      },

      prevStep: () => {
        const { currentStep } = get();
        if (currentStep > 1) {
          set({ currentStep: currentStep - 1 });
        }
      },

      completeStep: (step) => {
        const { completedSteps } = get();
        if (!completedSteps.includes(step)) {
          set({ completedSteps: [...completedSteps, step] });
        }
      },

      updateWizard: (data) => set(data),

      updateField: (field, value) => set({ [field]: value } as Partial<WizardStore>),

      toggleAnimation: (anim) => {
        const { animations } = get();
        set({
          animations: animations.includes(anim)
            ? animations.filter(a => a !== anim)
            : [...animations, anim],
        });
      },

      toggleStructure: (struct) => {
        const { structures } = get();
        set({
          structures: structures.includes(struct)
            ? structures.filter(s => s !== struct)
            : [...structures, struct],
        });
      },

      toggleFunctionality: (func) => {
        const { functionalities } = get();
        set({
          functionalities: functionalities.includes(func)
            ? functionalities.filter(f => f !== func)
            : [...functionalities, func],
        });
      },

      toggleVisualEffect: (id) => {
        const { visualEffects } = get();
        set({
          visualEffects: visualEffects.includes(id)
            ? visualEffects.filter(v => v !== id)
            : [...visualEffects, id],
        });
      },

      resetWizard: () => {
        set(initialState);
        localStorage.removeItem('promptforge-wizard');
      },
    }),
    {
      name: 'promptforge-wizard',
      partialize: (state) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { setStep, nextStep, prevStep, completeStep, updateWizard, updateField, toggleAnimation, toggleStructure, toggleFunctionality, toggleVisualEffect, resetWizard, ...data } = state;
        return data;
      },
    },
  )
);