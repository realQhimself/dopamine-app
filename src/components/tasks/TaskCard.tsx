import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Clock, Star, Trash2 } from 'lucide-react';
import type { Task } from '../../types';
import { CheckAnimation } from '../celebrations/CheckAnimation';
import { XPFloat } from '../celebrations/XPFloat';
import { CATEGORY_COLORS } from '../../lib/constants';
import { taskItemVariants } from '../../lib/animations';

export function TaskCard({
  task,
  onToggle,
  onDelete,
}: {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [showXP, setShowXP] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleToggle = () => {
    if (!task.completed) {
      setShowXP(true);
    }
    onToggle(task.id);
  };

  const handleTouchStart = () => {
    longPressTimer.current = setTimeout(() => {
      setShowDelete(true);
    }, 600);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  return (
    <motion.div
      className="relative"
      variants={taskItemVariants}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
    >
      <div
        className={`flex items-center gap-3 px-4 py-3 bg-white/70 backdrop-blur-sm rounded-xl border transition-all ${
          task.completed
            ? 'border-gray-100 opacity-60'
            : 'border-gray-200 shadow-sm'
        }`}
      >
        <button onClick={handleToggle} className="flex-shrink-0">
          <CheckAnimation checked={task.completed} />
        </button>

        <div className="flex-1 min-w-0">
          <p
            className={`text-sm leading-snug ${
              task.completed ? 'line-through text-gray-400' : 'text-gray-900'
            }`}
          >
            {task.text}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
              <Clock size={10} />
              {task.estimatedMinutes}m
            </span>
            {task.isMVD && (
              <span className="flex items-center gap-0.5 text-[10px] text-amber-500">
                <Star size={10} fill="currentColor" />
                Essential
              </span>
            )}
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: CATEGORY_COLORS[task.category] ?? CATEGORY_COLORS.custom }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {!task.completed && (
            <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded-full">
              +{task.xpReward}
            </span>
          )}
          {showDelete && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="p-1 rounded-full bg-red-50 text-red-400 hover:bg-red-100"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task.id);
                setShowDelete(false);
              }}
            >
              <Trash2 size={14} />
            </motion.button>
          )}
        </div>
      </div>

      {showXP && (
        <XPFloat xp={task.xpReward} onComplete={() => setShowXP(false)} />
      )}
    </motion.div>
  );
}
