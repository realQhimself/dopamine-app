import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useChatStore } from '../../stores/useChatStore';

export function ChatFAB() {
  const toggle = useChatStore((s) => s.toggle);
  const hasUnread = useChatStore((s) => s.hasUnread);

  return (
    <motion.button
      className="fixed bottom-20 left-4 w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-orange-200 flex items-center justify-center z-30"
      whileTap={{ scale: 0.85 }}
      whileHover={{ scale: 1.08 }}
      onClick={toggle}
    >
      <Sparkles size={20} />

      {/* Unread notification dot */}
      {hasUnread && (
        <motion.span
          className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-red-500 border-2 border-white"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 15 }}
        />
      )}
    </motion.button>
  );
}
