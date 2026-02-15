import { Shield, ShieldOff } from 'lucide-react';
import { useSoundEffects } from '../../hooks/useSoundEffects';

export function MVDBanner({ active, onToggle, timeEstimate }: { active: boolean; onToggle: () => void; timeEstimate: number }) {
  const { play, haptic } = useSoundEffects();

  return (
    <button
      onClick={() => {
        play('click');
        haptic();
        onToggle();
      }}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
        active
          ? 'bg-amber-100 text-amber-700 border border-amber-200'
          : 'bg-gray-100 text-gray-500 border border-gray-200'
      }`}
    >
      {active ? <Shield size={14} /> : <ShieldOff size={14} />}
      {active ? `Bad Day (${timeEstimate}m)` : 'MVD'}
    </button>
  );
}
