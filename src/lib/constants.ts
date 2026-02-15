import type { Level } from '../types';

export const XP_VALUES = {
  taskComplete: 10,
  quickWinComplete: 5,
  allTasksDone: 50,
  mvdComplete: 30,
  streakDay: 5,
  streakMilestone3: 25,
  streakMilestone7: 75,
  streakMilestone14: 150,
  streakMilestone30: 500,
} as const;

export const LEVELS: Level[] = [
  { level: 1, title: 'Spark', xpRequired: 0, icon: '✨' },
  { level: 2, title: 'Flicker', xpRequired: 50, icon: '🕯️' },
  { level: 3, title: 'Glow', xpRequired: 150, icon: '💡' },
  { level: 4, title: 'Blaze', xpRequired: 350, icon: '🔥' },
  { level: 5, title: 'Beam', xpRequired: 700, icon: '☀️' },
  { level: 6, title: 'Radiant', xpRequired: 1200, icon: '🌟' },
  { level: 7, title: 'Brilliant', xpRequired: 2000, icon: '💫' },
  { level: 8, title: 'Luminous', xpRequired: 3200, icon: '🌈' },
  { level: 9, title: 'Supernova', xpRequired: 5000, icon: '💥' },
  { level: 10, title: 'Transcendent', xpRequired: 8000, icon: '🏆' },
];

export const ENERGY_OPTIONS = [
  { level: 'low' as const, emoji: '🔋', label: 'Low', description: 'Take it easy' },
  { level: 'medium' as const, emoji: '⚡', label: 'Medium', description: 'Steady pace' },
  { level: 'high' as const, emoji: '🚀', label: 'High', description: 'Let\'s go!' },
];

export const CATEGORY_COLORS: Record<string, string> = {
  routine: '#f59e0b',
  work: '#3b82f6',
  health: '#10b981',
  creative: '#f59e0b',
  admin: '#6b7280',
  custom: '#f97316',
  calendar: '#3b82f6',
};
