import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Task, EnergyLevel, TaskCategory } from '../types';
import { generateId, getTodayString, isToday } from '../lib/dateUtils';

interface AddTaskInput {
  text: string;
  category: TaskCategory;
  energyLevel: EnergyLevel;
  estimatedMinutes: number;
  isMVD: boolean;
  xpReward: number;
  recurring: boolean;
}

interface TaskState {
  tasks: Task[];
  todayEnergy: EnergyLevel | null;
  mvdMode: boolean;
  lastResetDate: string | null;

  addTask: (input: AddTaskInput) => void;
  toggleTask: (id: string) => { xpEarned: number; allDone: boolean };
  deleteTask: (id: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  setEnergy: (level: EnergyLevel) => void;
  toggleMVD: () => void;
  resetDailyIfNeeded: () => void;
  getVisibleTasks: () => Task[];
  getQuickWins: () => Task[];
  getTodayProgress: () => { done: number; total: number; percent: number };
  getMVDTimeEstimate: () => number;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      todayEnergy: null,
      mvdMode: false,
      lastResetDate: null,

      addTask: (input: AddTaskInput) => {
        const isQuickWin = input.estimatedMinutes <= 2;
        const task: Task = {
          id: generateId(),
          text: input.text,
          completed: false,
          completedAt: null,
          category: input.category,
          energyLevel: input.energyLevel,
          estimatedMinutes: input.estimatedMinutes,
          isMVD: input.isMVD,
          isQuickWin,
          xpReward: isQuickWin ? Math.min(input.xpReward, 5) : input.xpReward,
          recurring: input.recurring,
          streak: 0,
          bestStreak: 0,
          lastCompletedDate: null,
          completedDates: [],
          createdAt: new Date().toISOString(),
          sortOrder: get().tasks.length,
        };
        set((s) => ({ tasks: [...s.tasks, task] }));
      },

      toggleTask: (id: string) => {
        const state = get();
        const task = state.tasks.find((t) => t.id === id);
        if (!task) return { xpEarned: 0, allDone: false };

        const today = getTodayString();
        const nowCompleting = !task.completed;
        let xpEarned = 0;

        if (nowCompleting) {
          xpEarned = task.xpReward;
          const wasCompletedToday = isToday(task.lastCompletedDate);
          const newStreak = wasCompletedToday ? task.streak : task.streak + 1;

          set((s) => ({
            tasks: s.tasks.map((t) =>
              t.id === id
                ? {
                    ...t,
                    completed: true,
                    completedAt: new Date().toISOString(),
                    lastCompletedDate: today,
                    completedDates: [...t.completedDates, today],
                    streak: newStreak,
                    bestStreak: Math.max(t.bestStreak, newStreak),
                  }
                : t
            ),
          }));
        } else {
          xpEarned = -task.xpReward; // negative = undo
          set((s) => ({
            tasks: s.tasks.map((t) =>
              t.id === id
                ? {
                    ...t,
                    completed: false,
                    completedAt: null,
                  }
                : t
            ),
          }));
        }

        // Check if all visible tasks are done
        const updatedState = get();
        const visible = getFilteredTasks(updatedState.tasks, updatedState.todayEnergy, updatedState.mvdMode);
        const allDone = visible.length > 0 && visible.every((t) => t.completed);

        return { xpEarned, allDone };
      },

      deleteTask: (id: string) => {
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }));
      },

      updateTask: (id: string, updates: Partial<Task>) => {
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        }));
      },

      setEnergy: (level: EnergyLevel) => set({ todayEnergy: level }),

      toggleMVD: () => set((s) => ({ mvdMode: !s.mvdMode })),

      resetDailyIfNeeded: () => {
        const today = getTodayString();
        const state = get();
        if (state.lastResetDate === today) return;

        set((s) => ({
          lastResetDate: today,
          todayEnergy: null,
          mvdMode: false,
          tasks: s.tasks.map((t) => {
            if (t.recurring && t.completed) {
              return { ...t, completed: false, completedAt: null };
            }
            return t;
          }),
        }));
      },

      getVisibleTasks: () => {
        const state = get();
        return getFilteredTasks(state.tasks, state.todayEnergy, state.mvdMode);
      },

      getQuickWins: () => {
        const state = get();
        return state.tasks.filter((t) => t.isQuickWin && !t.completed);
      },

      getTodayProgress: () => {
        const visible = get().getVisibleTasks();
        const done = visible.filter((t) => t.completed).length;
        const total = visible.length;
        return { done, total, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
      },

      getMVDTimeEstimate: () => {
        const state = get();
        return state.tasks
          .filter((t) => t.isMVD && !t.completed)
          .reduce((sum, t) => sum + t.estimatedMinutes, 0);
      },
    }),
    { name: 'dopamine-tasks', version: 1 }
  )
);

function getFilteredTasks(tasks: Task[], energy: EnergyLevel | null, mvdMode: boolean): Task[] {
  let filtered = tasks;

  if (mvdMode) {
    filtered = filtered.filter((t) => t.isMVD);
  } else if (energy === 'low') {
    filtered = filtered.filter((t) => t.energyLevel !== 'high');
  }

  return filtered.sort((a, b) => {
    // Incomplete first, then by sort order
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return a.sortOrder - b.sortOrder;
  });
}
