export type EnergyLevel = 'high' | 'medium' | 'low';
export type TaskCategory = 'routine' | 'work' | 'health' | 'creative' | 'admin' | 'custom' | 'calendar';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  completedAt: string | null;
  category: TaskCategory;
  energyLevel: EnergyLevel;
  estimatedMinutes: number;
  isMVD: boolean;           // Minimum Viable Day essential
  isQuickWin: boolean;      // <= 2 minutes
  xpReward: number;
  recurring: boolean;       // resets daily
  streak: number;
  bestStreak: number;
  lastCompletedDate: string | null;
  completedDates: string[];
  createdAt: string;
  sortOrder: number;
}

export interface Level {
  level: number;
  title: string;
  xpRequired: number;
  icon: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string | null;
  condition: string;
}

export interface DayRecord {
  date: string;
  tasksCompleted: number;
  totalTasks: number;
  xpEarned: number;
  energyLevel: EnergyLevel | null;
  wasMVD: boolean;
}

export interface CalendarEvent {
  id: string;
  summary: string;
  start: string;       // ISO datetime or date
  end: string;
  allDay: boolean;
  calendarName: string;
  calendarColor: string;
}

export type CelebrationEvent =
  | { type: 'task_complete'; xp: number }
  | { type: 'all_tasks_done' }
  | { type: 'streak_milestone'; count: number }
  | { type: 'level_up'; level: Level }
  | { type: 'mvd_complete' };
