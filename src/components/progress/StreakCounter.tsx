import { Flame } from 'lucide-react';
import { useProgressStore } from '../../stores/useProgressStore';

export function StreakCounter() {
  const getCurrentStreak = useProgressStore((s) => s.getCurrentStreak);
  const streak = getCurrentStreak();
  if (streak === 0) return null;
  return (
    <div className="flex items-center gap-1 px-2 py-1 bg-orange-50 rounded-full">
      <Flame size={14} className="text-orange-500" />
      <span className="text-xs font-bold text-orange-600">{streak}d</span>
    </div>
  );
}
