import { motion } from 'framer-motion';
import { xpFloatVariants } from '../../lib/animations';

export function XPFloat({ xp, onComplete }: { xp: number; onComplete: () => void }) {
  return (
    <motion.div
      className="absolute -top-2 left-1/2 -translate-x-1/2 pointer-events-none z-10 font-bold text-orange-600 text-sm whitespace-nowrap"
      variants={xpFloatVariants}
      initial="initial"
      animate="animate"
      onAnimationComplete={onComplete}
    >
      +{xp} XP
    </motion.div>
  );
}
