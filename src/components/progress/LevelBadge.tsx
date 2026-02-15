import { useProgressStore } from '../../stores/useProgressStore';

export function LevelBadge() {
  const getCurrentLevel = useProgressStore((s) => s.getCurrentLevel);
  const level = getCurrentLevel();
  return (
    <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 rounded-full">
      <span className="text-sm">{level.icon}</span>
      <span className="text-xs font-bold text-amber-600">Lv.{level.level}</span>
    </div>
  );
}
