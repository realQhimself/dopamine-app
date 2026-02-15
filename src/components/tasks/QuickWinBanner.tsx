import { Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export function QuickWinBanner({ count, onTap }: { count: number; onTap?: () => void }) {
  if (count === 0) return null;
  return (
    <motion.button
      className="w-full flex items-center gap-2 px-4 py-2.5 mb-3 bg-amber-50 border border-amber-200 rounded-xl text-left"
      whileTap={{ scale: 0.98 }}
      onClick={onTap}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Zap size={16} className="text-amber-500 flex-shrink-0" />
      <span className="text-sm text-amber-700 font-medium">
        {count} quick win{count !== 1 ? 's' : ''} available — knock them out!
      </span>
    </motion.button>
  );
}
