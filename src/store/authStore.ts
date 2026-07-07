import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, PlanTier } from '../types';
import { authAPI } from '../services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  registeredNeedsConfirmation: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    plan: PlanTier;
    company: string;
  }) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  clearError: () => void;
  clearConfirmation: () => void;
}

function isValidState(state: any): boolean {
  return !!(state && state.token);
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      registeredNeedsConfirmation: false,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const res = await authAPI.login(email, password);
          set({
            user: res.user,
            token: res.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (err: any) {
          set({ isLoading: false, error: err.message || 'Erro ao fazer login' });
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const res = await authAPI.register(data);
          if (res.message) {
            set({ isLoading: false, registeredNeedsConfirmation: true, error: null });
          } else {
            set({
              user: res.user,
              token: res.token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          }
        } catch (err: any) {
          set({ isLoading: false, error: err.message || 'Erro ao cadastrar' });
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
        localStorage.removeItem('promptforge-auth');
      },

      resetPassword: async (email) => {
        set({ isLoading: true, error: null });
        try {
          await authAPI.resetPassword(email);
          set({ isLoading: false, error: null });
        } catch (err: any) {
          set({ isLoading: false, error: err.message || 'Erro ao enviar email de recuperação' });
        }
      },

      updateProfile: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const res = await authAPI.updateProfile(data);
          set({ user: res.user, isLoading: false, error: null });
        } catch (err: any) {
          set({ isLoading: false, error: err.message || 'Erro ao atualizar perfil' });
        }
      },

      clearError: () => set({ error: null }),
      clearConfirmation: () => set({ registeredNeedsConfirmation: false }),
    }),
    {
      name: 'promptforge-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      merge: (persisted, current) => {
        const valid = isValidState(persisted);
        return valid ? { ...current, ...(persisted as Partial<AuthState>) } : current;
      },
    }
  )
);
