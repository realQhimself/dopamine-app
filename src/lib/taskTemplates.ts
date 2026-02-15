import type { TaskCategory, EnergyLevel } from '../types';

interface TaskTemplate {
  text: string;
  category: TaskCategory;
  energyLevel: EnergyLevel;
  estimatedMinutes: number;
  isMVD: boolean;
  isQuickWin: boolean;
  xpReward: number;
  recurring: boolean;
}

export const STARTER_TASKS: TaskTemplate[] = [
  {
    text: 'Check this box for instant dopamine',
    category: 'routine',
    energyLevel: 'low',
    estimatedMinutes: 1,
    isMVD: false,
    isQuickWin: true,
    xpReward: 5,
    recurring: false,
  },
  {
    text: 'Drink a glass of water',
    category: 'health',
    energyLevel: 'low',
    estimatedMinutes: 1,
    isMVD: true,
    isQuickWin: true,
    xpReward: 5,
    recurring: true,
  },
  {
    text: 'Do one thing on your to-do list',
    category: 'work',
    energyLevel: 'medium',
    estimatedMinutes: 10,
    isMVD: true,
    isQuickWin: false,
    xpReward: 15,
    recurring: true,
  },
  {
    text: 'Take a 5-minute walk',
    category: 'health',
    energyLevel: 'low',
    estimatedMinutes: 5,
    isMVD: false,
    isQuickWin: false,
    xpReward: 10,
    recurring: true,
  },
  {
    text: 'Work on main project for 25 minutes',
    category: 'work',
    energyLevel: 'high',
    estimatedMinutes: 25,
    isMVD: false,
    isQuickWin: false,
    xpReward: 25,
    recurring: true,
  },
];

export const CONTENT_CREATOR_PRESET: TaskTemplate[] = [
  {
    text: 'Review overnight content drafts',
    category: 'work',
    energyLevel: 'medium',
    estimatedMinutes: 15,
    isMVD: true,
    isQuickWin: false,
    xpReward: 15,
    recurring: true,
  },
  {
    text: 'Approve/edit at least 1 post',
    category: 'work',
    energyLevel: 'medium',
    estimatedMinutes: 10,
    isMVD: true,
    isQuickWin: false,
    xpReward: 15,
    recurring: true,
  },
  {
    text: 'Reply to 5+ comments',
    category: 'work',
    energyLevel: 'low',
    estimatedMinutes: 10,
    isMVD: false,
    isQuickWin: false,
    xpReward: 10,
    recurring: true,
  },
  {
    text: 'Comment on 3 niche accounts',
    category: 'work',
    energyLevel: 'low',
    estimatedMinutes: 10,
    isMVD: false,
    isQuickWin: false,
    xpReward: 10,
    recurring: true,
  },
  {
    text: 'Check analytics (30 seconds)',
    category: 'admin',
    energyLevel: 'low',
    estimatedMinutes: 1,
    isMVD: false,
    isQuickWin: true,
    xpReward: 5,
    recurring: true,
  },
  {
    text: 'Log follower count',
    category: 'admin',
    energyLevel: 'low',
    estimatedMinutes: 1,
    isMVD: false,
    isQuickWin: true,
    xpReward: 5,
    recurring: true,
  },
];
