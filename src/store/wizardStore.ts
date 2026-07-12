import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WizardState, NicheCategory, Objective, PromptStyle, Platform, Language, AnimationType, SiteStructure, Functionality } from '../types';

interface WizardStore extends WizardState {
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

  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  completeStep: (step: number) => void;
  updateWizard: (data: Partial<WizardState>) => void;
  updateField: (field: string, value: string) => void;
  toggleTechnology: (tech: string) => void;
  toggleAnimation: (anim: AnimationType) => void;
  toggleStructure: (struct: SiteStructure) => void;
  toggleFunctionality: (func: Functionality) => void;
  resetWizard: () => void;
}

const initialState: WizardState & {
  companyName: string; slogan: string; segment: string; city: string; state: string; country: string;
  neighborhood: string; address: string; businessDescription: string; marketTime: string;
  whatsapp: string; phone: string; email: string; currentSite: string; googleMaps: string;
  instagram: string; facebook: string;
  targetAudience: string; ageRange: string; socialClass: string; projectGoal: string;
  mainPains: string; mainDesires: string; customNiche: string; briefingNotes: string;
  customObjective: string;
} = {
  currentStep: 1, totalSteps: 15, completedSteps: [],
  objective: null, niche: null, style: null, platform: 'lovable', language: 'pt',
  technologies: [], animations: [], structures: [], functionalities: [],
  font: 'Inter', colorScheme: 'Personalizada', primaryColor: '#A855F7', secondaryColor: '#D946EF',
  targetAudience: '', referenceUrl: '', description: '', additionalContext: '',
  companyName: '', slogan: '', segment: '', city: '', state: '', country: 'Brasil',
  neighborhood: '', address: '', businessDescription: '', marketTime: '',
  whatsapp: '', phone: '', email: '', currentSite: '', googleMaps: '',
  instagram: '', facebook: '',
  ageRange: '', socialClass: '', projectGoal: '', mainPains: '',
  mainDesires: '', customNiche: '', briefingNotes: '', customObjective: '',
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

      toggleTechnology: (tech) => {
        const { technologies } = get();
        set({
          technologies: technologies.includes(tech)
            ? technologies.filter(t => t !== tech)
            : [...technologies, tech],
        });
      },

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

      resetWizard: () => {
        set(initialState);
        localStorage.removeItem('promptforge-wizard');
      },
    }),
    {
      name: 'promptforge-wizard',
      partialize: (state) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { setStep, nextStep, prevStep, completeStep, updateWizard, updateField, toggleTechnology, toggleAnimation, toggleStructure, toggleFunctionality, resetWizard, ...data } = state;
        return data;
      },
    },
  )
);