import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { checkmarkVariants } from '../../lib/animations';

export function CheckAnimation({ checked }: { checked: boolean }) {
  return (
    <motion.div
      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
        checked
          ? 'bg-emerald-500 border-emerald-500'
          : 'border-gray-300 bg-white'
      }`}
      variants={checkmarkVariants}
      animate={checked ? 'checked' : 'unchecked'}
    >
      {checked && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 15, delay: 0.05 }}
        >
          <Check size={14} className="text-white" strokeWidth={3} />
        </motion.div>
      )}
    </motion.div>
  );
}
