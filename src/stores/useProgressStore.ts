import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DayRecord, CelebrationEvent, Level } from '../types';
import { LEVELS } from '../lib/constants';
import { getTodayString, getPreviousDay } from '../lib/dateUtils';

interface ProgressState {
  totalXP: number;
  dayHistory: DayRecord[];
  streakFreezes: number;

  addXP: (amount: number) => CelebrationEvent[];
  recordDay: (record: DayRecord) => void;
  getCurrentLevel: () => Level;
  getNextLevel: () => Level | null;
  getLevelProgress: () => number; // 0-1 fraction
  getCurrentStreak: () => number;
  getBestStreak: () => number;
  getTodayXP: () => number;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      totalXP: 0,
      dayHistory: [],
      streakFreezes: 1,

      addXP: (amount: number) => {
        const events: CelebrationEvent[] = [];
        const prevXP = get().totalXP;
        const newXP = prevXP + amount;

        // Check level up
        const prevLevel = getLevelForXP(prevXP);
        const newLevel = getLevelForXP(newXP);
        if (newLevel.level > prevLevel.level) {
          events.push({ type: 'level_up', level: newLevel });
        }

        set({ totalXP: newXP });
        return events;
      },

      recordDay: (record: DayRecord) => {
        set((s) => {
          const existing = s.dayHistory.findIndex((d) => d.date === record.date);
          const updated = [...s.dayHistory];
          if (existing >= 0) {
            updated[existing] = record;
          } else {
            updated.push(record);
          }
          // Keep last 365 days
          if (updated.length > 365) {
            updated.splice(0, updated.length - 365);
          }
          return { dayHistory: updated };
        });
      },

      getCurrentLevel: () => getLevelForXP(get().totalXP),

      getNextLevel: () => {
        const current = getLevelForXP(get().totalXP);
        return LEVELS.find((l) => l.level === current.level + 1) ?? null;
      },

      getLevelProgress: () => {
        const xp = get().totalXP;
        const current = getLevelForXP(xp);
        const next = LEVELS.find((l) => l.level === current.level + 1);
        if (!next) return 1;
        const range = next.xpRequired - current.xpRequired;
        const progress = xp - current.xpRequired;
        return Math.min(progress / range, 1);
      },

      getCurrentStreak: () => {
        const history = get().dayHistory;
        if (history.length === 0) return 0;

        let streak = 0;
        let checkDate = getTodayString();

        // Check if today has a record with completions
        const todayRecord = history.find((d) => d.date === checkDate);
        if (!todayRecord || todayRecord.tasksCompleted === 0) {
          // Maybe they haven't done anything today yet - check from yesterday
          checkDate = getPreviousDay(checkDate);
        }

        while (true) {
          const dayRecord = history.find((d) => d.date === checkDate);
          if (dayRecord && dayRecord.tasksCompleted > 0) {
            streak++;
            checkDate = getPreviousDay(checkDate);
          } else {
            break;
          }
        }
        return streak;
      },

      getBestStreak: () => {
        const history = [...get().dayHistory].sort((a, b) => a.date.localeCompare(b.date));
        if (history.length === 0) return 0;

        let best = 0;
        let current = 0;
        let lastDate = '';

        for (const record of history) {
          if (record.tasksCompleted === 0) {
            current = 0;
            continue;
          }
          if (lastDate && getDayDiff(lastDate, record.date) === 1) {
            current++;
          } else {
            current = 1;
          }
          best = Math.max(best, current);
          lastDate = record.date;
        }
        return best;
      },

      getTodayXP: () => {
        const today = getTodayString();
        const record = get().dayHistory.find((d) => d.date === today);
        return record?.xpEarned ?? 0;
      },
    }),
    { name: 'dopamine-progress', version: 1 }
  )
);

function getLevelForXP(xp: number): Level {
  let result = LEVELS[0];
  for (const level of LEVELS) {
    if (xp >= level.xpRequired) {
      result = level;
    }
  }
  return result;
}

function getDayDiff(date1: string, date2: string): number {
  const d1 = new Date(date1 + 'T00:00:00');
  const d2 = new Date(date2 + 'T00:00:00');
  return Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}
