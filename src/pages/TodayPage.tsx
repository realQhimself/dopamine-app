import { useState, useEffect, useMemo } from 'react';
import { Plus, CalendarDays, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTaskStore } from '../stores/useTaskStore';
import { useProgressStore } from '../stores/useProgressStore';
import { useSettingsStore } from '../stores/useSettingsStore';
import { useCalendarStore } from '../stores/useCalendarStore';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { useCelebration } from '../hooks/useCelebration';
import { EnergySelector } from '../components/tasks/EnergySelector';
import { MVDBanner } from '../components/tasks/MVDBanner';
import { QuickWinBanner } from '../components/tasks/QuickWinBanner';
import { TaskList } from '../components/tasks/TaskList';
import { AddTaskModal } from '../components/tasks/AddTaskModal';
import { XPBar } from '../components/progress/XPBar';
import { StreakCounter } from '../components/progress/StreakCounter';
import { DailyProgress } from '../components/progress/DailyProgress';
import { CelebrationOverlay } from '../components/celebrations/CelebrationOverlay';
import { ChatFAB } from '../components/chat/ChatFAB';
import { ChatPanel } from '../components/chat/ChatPanel';
import { useChatStore } from '../stores/useChatStore';
import { XP_VALUES } from '../lib/constants';
import { STARTER_TASKS } from '../lib/taskTemplates';
import { pageVariants } from '../lib/animations';
import { getTodayString } from '../lib/dateUtils';

export default function TodayPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const { play, haptic } = useSoundEffects();
  const { current, dismiss, enqueue, enqueueOne } = useCelebration();
  const chatOpen = useChatStore((s) => s.isOpen);
  const toggleChat = useChatStore((s) => s.toggle);

  // Task store
  const tasks = useTaskStore((s) => s.tasks);
  const todayEnergy = useTaskStore((s) => s.todayEnergy);
  const mvdMode = useTaskStore((s) => s.mvdMode);
  const addTask = useTaskStore((s) => s.addTask);
  const toggleTask = useTaskStore((s) => s.toggleTask);
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const setEnergy = useTaskStore((s) => s.setEnergy);
  const toggleMVD = useTaskStore((s) => s.toggleMVD);
  const resetDailyIfNeeded = useTaskStore((s) => s.resetDailyIfNeeded);

  // Progress store
  const addXP = useProgressStore((s) => s.addXP);
  const recordDay = useProgressStore((s) => s.recordDay);

  // Calendar store
  const calendarConnected = useCalendarStore((s) => s.connected);
  const calendarEvents = useCalendarStore((s) => s.events);
  const calendarSyncing = useCalendarStore((s) => s.syncing);
  const syncToday = useCalendarStore((s) => s.syncToday);
  const lastSyncDate = useCalendarStore((s) => s.lastSyncDate);

  // Reset daily tasks on mount
  useEffect(() => {
    resetDailyIfNeeded();
  }, [resetDailyIfNeeded]);

  // First run: populate starter tasks
  useEffect(() => {
    const settings = useSettingsStore.getState();
    const taskState = useTaskStore.getState();
    if (!settings.onboardingComplete && taskState.tasks.length === 0) {
      STARTER_TASKS.forEach((t) => taskState.addTask(t));
      settings.completeOnboarding();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-sync calendar events on mount
  useEffect(() => {
    if (calendarConnected && lastSyncDate !== getTodayString()) {
      syncToday();
    }
  }, [calendarConnected, lastSyncDate, syncToday]);

  // Convert calendar events to tasks (merged into visible list)
  const calendarTasks = useMemo(() => {
    if (!calendarConnected || calendarEvents.length === 0) return [];
    const existingCalIds = new Set(
      tasks.filter((t) => t.id.startsWith('cal_')).map((t) => t.id),
    );
    return calendarEvents
      .filter((e) => !existingCalIds.has(`cal_${e.id}`))
      .map((event, i) => {
        const startDate = new Date(event.start);
        const endDate = new Date(event.end);
        const durationMin = event.allDay ? 30 : Math.max(5, Math.round((endDate.getTime() - startDate.getTime()) / 60000));
        const timeStr = event.allDay
          ? 'All day'
          : startDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
        return {
          id: `cal_${event.id}`,
          text: `${timeStr} — ${event.summary}`,
          completed: false,
          completedAt: null,
          category: 'calendar' as const,
          energyLevel: 'medium' as const,
          estimatedMinutes: durationMin,
          isMVD: false,
          isQuickWin: durationMin <= 2,
          xpReward: 10,
          recurring: false,
          streak: 0,
          bestStreak: 0,
          lastCompletedDate: null,
          completedDates: [],
          createdAt: new Date().toISOString(),
          sortOrder: -1000 + i, // Calendar tasks sort to top
        };
      });
  }, [calendarConnected, calendarEvents, tasks]);

  // Compute derived state reactively (not via store methods which don't trigger re-renders)
  const visibleTasks = useMemo(() => {
    let filtered = tasks;
    if (mvdMode) {
      filtered = filtered.filter((t) => t.isMVD);
    } else if (todayEnergy === 'low') {
      filtered = filtered.filter((t) => t.energyLevel !== 'high');
    }
    // Merge in calendar tasks (only in non-MVD mode)
    const allTasks = mvdMode ? [...filtered] : [...filtered, ...calendarTasks];
    return allTasks.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return a.sortOrder - b.sortOrder;
    });
  }, [tasks, mvdMode, todayEnergy, calendarTasks]);

  const quickWins = useMemo(
    () => tasks.filter((t) => t.isQuickWin && !t.completed),
    [tasks]
  );

  const progress = useMemo(() => {
    const done = visibleTasks.filter((t) => t.completed).length;
    const total = visibleTasks.length;
    return { done, total, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
  }, [visibleTasks]);

  const mvdTime = useMemo(
    () => tasks.filter((t) => t.isMVD && !t.completed).reduce((sum, t) => sum + t.estimatedMinutes, 0),
    [tasks]
  );

  const handleToggleTask = (id: string) => {
    play('check');
    haptic();

    const result = toggleTask(id);

    if (result.xpEarned > 0) {
      const celebrations = addXP(result.xpEarned);
      enqueueOne({ type: 'task_complete', xp: result.xpEarned });

      if (celebrations.length > 0) {
        // Small delay so XP float shows first
        setTimeout(() => enqueue(celebrations), 500);
      }

      if (result.allDone) {
        const isMVDComplete = mvdMode;
        setTimeout(() => {
          if (isMVDComplete) {
            enqueueOne({ type: 'mvd_complete' });
            const mvdCelebrations = addXP(XP_VALUES.mvdComplete);
            if (mvdCelebrations.length > 0) enqueue(mvdCelebrations);
          } else {
            enqueueOne({ type: 'all_tasks_done' });
            const allDoneCelebrations = addXP(XP_VALUES.allTasksDone);
            if (allDoneCelebrations.length > 0) enqueue(allDoneCelebrations);
          }
          play('celebrate');
        }, 800);
      }

      // Record today's progress
      const updatedProgress = useTaskStore.getState().getTodayProgress();
      recordDay({
        date: getTodayString(),
        tasksCompleted: updatedProgress.done,
        totalTasks: updatedProgress.total,
        xpEarned: useProgressStore.getState().getTodayXP(),
        energyLevel: todayEnergy,
        wasMVD: mvdMode,
      });
    } else if (result.xpEarned < 0) {
      // Unchecked — remove XP (addXP handles negative)
      addXP(result.xpEarned);
    }
  };

  const handleDeleteTask = (id: string) => {
    play('click');
    haptic([30, 50, 30]);
    deleteTask(id);
  };

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <motion.div
      className="px-4 pt-6 pb-4"
      variants={pageVariants}
      initial="initial"
      animate="animate"
    >
      {/* Greeting */}
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-bold text-gray-900">{getGreeting()}</h1>
        {calendarConnected && (
          <button
            onClick={() => syncToday()}
            disabled={calendarSyncing}
            className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 disabled:opacity-50"
          >
            <RefreshCw size={12} className={calendarSyncing ? 'animate-spin' : ''} />
            {calendarSyncing ? 'Syncing...' : <><CalendarDays size={12} /> {calendarEvents.length} events</>}
          </button>
        )}
      </div>
      <p className="text-sm text-gray-500 mb-4">Let's make today count.</p>

      {/* Energy check-in */}
      {todayEnergy === null && <EnergySelector onSelect={setEnergy} />}

      {/* Header: XP + Streak + MVD */}
      <div className="flex items-center gap-2 mb-4">
        <XPBar />
        <StreakCounter />
        <MVDBanner active={mvdMode} onToggle={toggleMVD} timeEstimate={mvdTime} />
      </div>

      {/* Daily progress ring */}
      <DailyProgress done={progress.done} total={progress.total} />

      {/* Quick wins banner */}
      <QuickWinBanner count={quickWins.length} />

      {/* Task list */}
      <TaskList
        tasks={visibleTasks}
        onToggle={handleToggleTask}
        onDelete={handleDeleteTask}
      />

      {/* Add task FAB */}
      <motion.button
        className="fixed bottom-20 right-4 w-14 h-14 bg-amber-600 text-white rounded-full shadow-lg shadow-amber-200 flex items-center justify-center z-30"
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        onClick={() => {
          play('click');
          haptic();
          setShowAddModal(true);
        }}
      >
        <Plus size={24} />
      </motion.button>

      {/* Add task modal */}
      <AddTaskModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={addTask}
      />

      {/* Chat FAB + Panel */}
      <ChatFAB />
      <ChatPanel isOpen={chatOpen} onClose={toggleChat} />

      {/* Celebrations */}
      <CelebrationOverlay event={current} onDismiss={dismiss} />
    </motion.div>
  );
}
