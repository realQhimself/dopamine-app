import { motion } from 'framer-motion';
import { useProgressStore } from '../../stores/useProgressStore';

export function XPBar() {
  const getCurrentLevel = useProgressStore((s) => s.getCurrentLevel);
  const getNextLevel = useProgressStore((s) => s.getNextLevel);
  const getLevelProgress = useProgressStore((s) => s.getLevelProgress);
  const totalXP = useProgressStore((s) => s.totalXP);

  const level = getCurrentLevel();
  const next = getNextLevel();
  const progress = getLevelProgress();

  return (
    <div className="flex items-center gap-2 flex-1">
      <span className="text-lg" title={`Level ${level.level}: ${level.title}`}>{level.icon}</span>
      <div className="flex-1">
        <div className="flex justify-between text-xs text-gray-500 mb-0.5">
          <span className="font-medium">{level.title}</span>
          <span>{totalXP} XP{next ? ` / ${next.xpRequired}` : ''}</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
      </div>
    </div>
  );
}
