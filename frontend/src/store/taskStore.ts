import { create } from 'zustand';
import { api } from '../utils/api.js';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate?: string;
  assigneeId?: string;
  creatorId: string;
  createdAt: string;
  updatedAt: string;
  creator?: { id: string; email: string };
  assignee?: { id: string; email: string };
}

interface TaskStats {
  total: number;
  byStatus: {
    TODO: number;
    IN_PROGRESS: number;
    DONE: number;
  };
  byPriority: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
  };
}

interface TaskState {
  tasks: Task[];
  stats: TaskStats | null;
  loading: boolean;
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  } | null;
  fetchTasks: (filters?: Record<string, any>) => Promise<void>;
  fetchStats: () => Promise<void>;
  createTask: (title: string, description?: string, priority?: string, assigneeId?: string) => Promise<void>;
  updateTask: (id: string, data: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  stats: null,
  loading: false,
  pagination: null,

  fetchTasks: async (filters = {}) => {
    try {
      set({ loading: true });
      const response = await api.get('/tasks', { params: filters });
      set({
        tasks: response.data.data,
        pagination: response.data.pagination,
        loading: false,
      });
    } catch (err) {
      console.error('Error fetching tasks:', err);
      set({ loading: false });
    }
  },

  fetchStats: async () => {
    try {
      const response = await api.get('/tasks/stats');
      set({ stats: response.data.data });
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  },

  createTask: async (title, description, priority = 'MEDIUM', assigneeId) => {
    try {
      set({ loading: true });
      const creatorId = useAuthStore.getState().user?.id;
      if (!creatorId) throw new Error('User not logged in');

      await api.post('/tasks', {
        title,
        description,
        priority,
        assigneeId: assigneeId || undefined,
        creatorId,
      });
      // Refresh tasks and stats
      await get().fetchTasks();
      await get().fetchStats();
    } catch (err) {
      console.error('Error creating task:', err);
      set({ loading: false });
      throw err;
    }
  },

  updateTask: async (id, data) => {
    try {
      set({ loading: true });
      await api.patch(`/tasks/${id}`, data);
      await get().fetchTasks();
      await get().fetchStats();
    } catch (err) {
      console.error('Error updating task:', err);
      set({ loading: false });
      throw err;
    }
  },

  deleteTask: async (id) => {
    try {
      set({ loading: true });
      await api.delete(`/tasks/${id}`);
      await get().fetchTasks();
      await get().fetchStats();
    } catch (err) {
      console.error('Error deleting task:', err);
      set({ loading: false });
      throw err;
    }
  },
}));

// Circular reference resolution
import { useAuthStore } from './authStore.js';
