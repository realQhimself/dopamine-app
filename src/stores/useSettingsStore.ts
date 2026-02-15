import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  soundEnabled: boolean;
  hapticEnabled: boolean;
  celebrationIntensity: 'full' | 'minimal' | 'off';
  onboardingComplete: boolean;

  toggleSound: () => void;
  toggleHaptic: () => void;
  setCelebrationIntensity: (intensity: 'full' | 'minimal' | 'off') => void;
  completeOnboarding: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      soundEnabled: true,
      hapticEnabled: true,
      celebrationIntensity: 'full',
      onboardingComplete: false,

      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
      toggleHaptic: () => set((s) => ({ hapticEnabled: !s.hapticEnabled })),
      setCelebrationIntensity: (intensity) => set({ celebrationIntensity: intensity }),
      completeOnboarding: () => set({ onboardingComplete: true }),
    }),
    { name: 'dopamine-settings', version: 1 }
  )
);
