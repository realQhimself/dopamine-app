import { motion } from 'framer-motion';

export function DailyProgress({ done, total }: { done: number; total: number }) {
  const percent = total === 0 ? 0 : done / total;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - percent);

  return (
    <div className="flex flex-col items-center my-4">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="8" />
          <motion.circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={percent >= 1 ? '#10b981' : '#6366f1'}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-900">{done}</span>
          <span className="text-xs text-gray-400">of {total}</span>
        </div>
      </div>
      {percent >= 1 && total > 0 && (
        <span className="text-sm font-medium text-emerald-600 mt-1">All done!</span>
      )}
    </div>
  );
}
