import { motion, AnimatePresence } from 'framer-motion';
import type { Level } from '../../types';
import { levelUpModalVariants, modalOverlayVariants } from '../../lib/animations';

export function LevelUpModal({ level, onDismiss }: { level: Level; onDismiss: () => void }) {
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[90] flex items-center justify-center">
        <motion.div
          className="absolute inset-0 bg-black/50"
          variants={modalOverlayVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          onClick={onDismiss}
        />
        <motion.div
          className="relative bg-white rounded-3xl p-8 text-center shadow-2xl max-w-xs mx-4"
          variants={levelUpModalVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <div className="text-6xl mb-4">{level.icon}</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Level Up!</h2>
          <p className="text-lg text-amber-600 font-semibold mb-2">
            Level {level.level}: {level.title}
          </p>
          <p className="text-sm text-gray-500 mb-6">
            You've reached {level.xpRequired} XP
          </p>
          <button
            onClick={onDismiss}
            className="w-full py-3 bg-amber-600 text-white rounded-2xl font-semibold hover:bg-amber-700 active:scale-95 transition-transform"
          >
            Keep Going!
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
