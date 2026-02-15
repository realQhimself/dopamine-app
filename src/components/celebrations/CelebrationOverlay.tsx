import type { CelebrationEvent } from '../../types';
import { ConfettiOverlay } from './ConfettiOverlay';
import { LevelUpModal } from './LevelUpModal';
import { motion, AnimatePresence } from 'framer-motion';

export function CelebrationOverlay({
  event,
  onDismiss,
}: {
  event: CelebrationEvent | null;
  onDismiss: () => void;
}) {
  if (!event) return null;

  switch (event.type) {
    case 'level_up':
      return (
        <>
          <ConfettiOverlay onComplete={() => {}} />
          <LevelUpModal level={event.level} onDismiss={onDismiss} />
        </>
      );
    case 'all_tasks_done':
      return (
        <>
          <ConfettiOverlay onComplete={onDismiss} />
          <Toast message="You did it! All tasks done!" emoji="🎉" onDismiss={onDismiss} />
        </>
      );
    case 'mvd_complete':
      return (
        <>
          <ConfettiOverlay onComplete={onDismiss} />
          <Toast message="You showed up. That's what matters." emoji="💪" onDismiss={onDismiss} />
        </>
      );
    case 'streak_milestone':
      return (
        <Toast
          message={`${event.count}-day streak! You're on fire!`}
          emoji="🔥"
          onDismiss={onDismiss}
        />
      );
    case 'task_complete':
      // Handled inline by XPFloat, not here
      return null;
    default:
      return null;
  }
}

function Toast({ message, emoji, onDismiss }: { message: string; emoji: string; onDismiss: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed top-16 left-1/2 -translate-x-1/2 z-[80] bg-white shadow-xl rounded-2xl px-6 py-4 flex items-center gap-3 max-w-xs"
        initial={{ opacity: 0, y: -40, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        onClick={onDismiss}
      >
        <span className="text-2xl">{emoji}</span>
        <p className="text-sm font-medium text-gray-900">{message}</p>
      </motion.div>
    </AnimatePresence>
  );
}
