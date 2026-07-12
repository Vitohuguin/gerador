import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Theme, Language } from '../types';

interface AppState {
  theme: Theme;
  language: Language;
  sidebarOpen: boolean;
  notifications: boolean;
  emailNotifications: boolean;
  defaultFormat: string;
  defaultPlatform: string;
  defaultTemplate: string;
  setTheme: (theme: Theme) => void;
  setLanguage: (language: Language) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setNotifications: (v: boolean) => void;
  setEmailNotifications: (v: boolean) => void;
  setDefaultFormat: (v: string) => void;
  setDefaultPlatform: (v: string) => void;
  setDefaultTemplate: (v: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'dark',
      language: 'pt',
      sidebarOpen: false,
      notifications: true,
      emailNotifications: true,
      defaultFormat: 'md',
      defaultPlatform: 'lovable',
      defaultTemplate: 'completo',
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setNotifications: (v) => set({ notifications: v }),
      setEmailNotifications: (v) => set({ emailNotifications: v }),
      setDefaultFormat: (v) => set({ defaultFormat: v }),
      setDefaultPlatform: (v) => set({ defaultPlatform: v }),
      setDefaultTemplate: (v) => set({ defaultTemplate: v }),
    }),
    { name: 'promptforge-app' }
  )
);