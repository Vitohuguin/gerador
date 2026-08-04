import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Project } from '../types';
import { generateId } from '../lib/utils';

interface ProjectStore {
  projects: Project[];
  addProject: (data: Partial<Project>) => Project;
  updateProject: (id: string, data: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  getProjectById: (id: string) => Project | undefined;
}

const MOCK_PROJECTS: Project[] = [
  {
    id: 'proj_001', userId: 'usr_demo_001', name: 'Clínica Saúde+', description: 'Site institucional moderno para clínica médica',
    status: 'active', niche: 'health', platform: 'lovable', promptCount: 5, contractCount: 1,
    createdAt: '2025-05-10T10:00:00Z', updatedAt: '2025-06-28T15:30:00Z', color: '#10B981', tags: ['site', 'clinica', 'medicina'],
  },
  {
    id: 'proj_002', userId: 'usr_demo_001', name: 'Barbearia Vintage', description: 'Landing page com agendamento online',
    status: 'active', niche: 'beauty', platform: 'bolt', promptCount: 3, contractCount: 0,
    createdAt: '2025-06-01T14:20:00Z', updatedAt: '2025-06-25T09:00:00Z', color: '#F97316', tags: ['landing-page', 'agendamento'],
  },
  {
    id: 'proj_003', userId: 'usr_demo_001', name: 'TechFlow SaaS', description: 'Painel administrativo para startup de gestão',
    status: 'draft', niche: 'saas', platform: 'cursor', promptCount: 7, contractCount: 2,
    createdAt: '2025-06-10T08:00:00Z', updatedAt: '2025-06-20T12:00:00Z', color: '#8B5CF6', tags: ['saas', 'dashboard', 'react'],
  },
];

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      projects: MOCK_PROJECTS,

  addProject: (data) => {
    const project: Project = {
      id: generateId(), userId: data.userId || 'usr_demo_001', name: data.name || 'Novo Projeto',
      description: data.description || '', status: data.status || 'draft',
      niche: data.niche || 'tech', platform: data.platform || 'lovable',
      promptCount: data.promptCount || 0, contractCount: data.contractCount || 0,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      color: data.color || '#8B5CF6', tags: data.tags || [],
    };
    set((s) => ({ projects: [project, ...s.projects] }));
    return project;
  },

  updateProject: (id, data) => {
    set((s) => ({
      projects: s.projects.map((p) =>
        p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p
      ),
    }));
  },

  deleteProject: (id) => {
    set((s) => ({ projects: s.projects.filter((p) => p.id !== id) }));
  },

  getProjectById: (id) => get().projects.find((p) => p.id === id),
    }),
    { name: 'promptforge-projects' }
  )
);