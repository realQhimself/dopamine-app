import { motion } from 'framer-motion';
import { ENERGY_OPTIONS } from '../../lib/constants';
import type { EnergyLevel } from '../../types';
import { useSoundEffects } from '../../hooks/useSoundEffects';
import { Card } from '../shared/Card';

export function EnergySelector({ onSelect }: { onSelect: (level: EnergyLevel) => void }) {
  const { play, haptic } = useSoundEffects();

  return (
    <Card className="p-5 mb-4">
      <p className="text-center text-sm font-medium text-gray-600 mb-3">
        How's your energy today?
      </p>
      <div className="flex justify-center gap-4">
        {ENERGY_OPTIONS.map((opt, i) => (
          <motion.button
            key={opt.level}
            className="flex flex-col items-center gap-1 p-3 rounded-2xl hover:bg-gray-50 active:bg-gray-100 transition-colors"
            whileTap={{ scale: 0.9 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => {
              play('click');
              haptic();
              onSelect(opt.level);
            }}
          >
            <span className="text-3xl">{opt.emoji}</span>
            <span className="text-xs font-medium text-gray-700">{opt.label}</span>
            <span className="text-[10px] text-gray-400">{opt.description}</span>
          </motion.button>
        ))}
      </div>
    </Card>
  );
}
