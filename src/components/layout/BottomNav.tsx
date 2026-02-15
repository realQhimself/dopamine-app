import { NavLink } from 'react-router-dom';
import { CalendarCheck, Settings } from 'lucide-react';
import { useSoundEffects } from '../../hooks/useSoundEffects';

const NAV_ITEMS = [
  { to: '/', icon: CalendarCheck, label: 'Today' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function BottomNav() {
  const { play, haptic } = useSoundEffects();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-200 pb-[env(safe-area-inset-bottom)] z-40">
      <div className="flex justify-around items-center h-14 max-w-lg mx-auto">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => { play('click'); haptic(); }}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl transition-colors ${
                isActive ? 'text-amber-600' : 'text-gray-400'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium">{item.label}</span>
                {isActive && (
                  <div className="w-1 h-1 rounded-full bg-amber-600 -mt-0.5" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
