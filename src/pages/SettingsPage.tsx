import { useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, Vibrate, Sparkles, Download, Upload, Trash2, CalendarDays, LogOut, Loader2 } from 'lucide-react';
import { useSettingsStore } from '../stores/useSettingsStore';
import { useCalendarStore } from '../stores/useCalendarStore';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { Card } from '../components/shared/Card';
import { pageVariants } from '../lib/animations';
import { getTodayString } from '../lib/dateUtils';

export default function SettingsPage() {
  const { play, haptic } = useSoundEffects();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [connecting, setConnecting] = useState(false);

  // Calendar store
  const calendarConnected = useCalendarStore((s) => s.connected);
  const calendarEmail = useCalendarStore((s) => s.userEmail);
  const calendarError = useCalendarStore((s) => s.error);
  const connectCalendar = useCalendarStore((s) => s.connect);
  const disconnectCalendar = useCalendarStore((s) => s.disconnect);

  const soundEnabled = useSettingsStore((s) => s.soundEnabled);
  const hapticEnabled = useSettingsStore((s) => s.hapticEnabled);
  const celebrationIntensity = useSettingsStore((s) => s.celebrationIntensity);
  const toggleSound = useSettingsStore((s) => s.toggleSound);
  const toggleHaptic = useSettingsStore((s) => s.toggleHaptic);
  const setCelebrationIntensity = useSettingsStore((s) => s.setCelebrationIntensity);

  const handleExport = () => {
    const data = {
      tasks: localStorage.getItem('dopamine-tasks'),
      progress: localStorage.getItem('dopamine-progress'),
      settings: localStorage.getItem('dopamine-settings'),
      exportedAt: new Date().toISOString(),
      version: 1,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dopamine-backup-${getTodayString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    play('coin');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string);
          if (data.tasks) localStorage.setItem('dopamine-tasks', data.tasks);
          if (data.progress) localStorage.setItem('dopamine-progress', data.progress);
          if (data.settings) localStorage.setItem('dopamine-settings', data.settings);
          window.location.reload();
        } catch {
          alert('Invalid backup file');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleReset = () => {
    localStorage.removeItem('dopamine-tasks');
    localStorage.removeItem('dopamine-progress');
    localStorage.removeItem('dopamine-settings');
    window.location.reload();
  };

  return (
    <motion.div
      className="px-4 pt-6 pb-4"
      variants={pageVariants}
      initial="initial"
      animate="animate"
    >
      <h1 className="text-xl font-bold text-gray-900 mb-6">Settings</h1>

      {/* Sound & Haptic */}
      <Card className="p-4 mb-3">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Feedback</h2>

        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            {soundEnabled ? <Volume2 size={18} className="text-amber-500" /> : <VolumeX size={18} className="text-gray-400" />}
            <span className="text-sm text-gray-700">Sound effects</span>
          </div>
          <button
            onClick={() => { toggleSound(); haptic(); }}
            className={`w-11 h-6 rounded-full transition-colors relative ${soundEnabled ? 'bg-amber-500' : 'bg-gray-300'}`}
          >
            <motion.div
              className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow"
              animate={{ left: soundEnabled ? '22px' : '2px' }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </button>
        </div>

        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <Vibrate size={18} className={hapticEnabled ? 'text-amber-500' : 'text-gray-400'} />
            <span className="text-sm text-gray-700">Haptic feedback</span>
          </div>
          <button
            onClick={() => { toggleHaptic(); play('click'); }}
            className={`w-11 h-6 rounded-full transition-colors relative ${hapticEnabled ? 'bg-amber-500' : 'bg-gray-300'}`}
          >
            <motion.div
              className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow"
              animate={{ left: hapticEnabled ? '22px' : '2px' }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </button>
        </div>
      </Card>

      {/* Celebration intensity */}
      <Card className="p-4 mb-3">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={18} className="text-amber-500" />
          <h2 className="text-sm font-semibold text-gray-700">Celebrations</h2>
        </div>
        <div className="flex gap-2">
          {(['full', 'minimal', 'off'] as const).map((level) => (
            <button
              key={level}
              onClick={() => { setCelebrationIntensity(level); play('click'); haptic(); }}
              className={`flex-1 py-2 rounded-xl text-xs font-medium capitalize transition-colors ${
                celebrationIntensity === level
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </Card>

      {/* Calendar Integration */}
      <Card className="p-4 mb-3">
        <div className="flex items-center gap-2 mb-3">
          <CalendarDays size={18} className="text-blue-500" />
          <h2 className="text-sm font-semibold text-gray-700">Google Calendar</h2>
        </div>

        {calendarConnected ? (
          <div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm text-gray-700">Connected</p>
                {calendarEmail && (
                  <p className="text-xs text-gray-400">{calendarEmail}</p>
                )}
              </div>
              <button
                onClick={() => {
                  disconnectCalendar();
                  play('click');
                  haptic();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              >
                <LogOut size={12} />
                Disconnect
              </button>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">
              Today's events auto-import as checkable tasks each morning.
            </p>
          </div>
        ) : (
          <div>
            <p className="text-xs text-gray-500 mb-3">
              Connect your Google Calendar to auto-import today's events as tasks. Tip: subscribe your Apple Calendar in Google to get both.
            </p>
            <button
              onClick={async () => {
                setConnecting(true);
                play('click');
                haptic();
                await connectCalendar();
                setConnecting(false);
              }}
              disabled={connecting}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-500 text-white text-sm font-medium rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {connecting ? (
                <><Loader2 size={16} className="animate-spin" /> Connecting...</>
              ) : (
                <><CalendarDays size={16} /> Connect Google Calendar</>
              )}
            </button>
            {calendarError && (
              <p className="text-xs text-red-500 mt-2">{calendarError}</p>
            )}
          </div>
        )}
      </Card>

      {/* Data */}
      <Card className="p-4 mb-3">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Data</h2>
        <div className="flex gap-2 mb-3">
          <button
            onClick={handleExport}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-100 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
          >
            <Download size={16} />
            Export
          </button>
          <button
            onClick={handleImport}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-100 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
          >
            <Upload size={16} />
            Import
          </button>
        </div>
        {!showResetConfirm ? (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-colors"
          >
            <Trash2 size={16} />
            Reset all data
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="flex-1 py-2.5 bg-red-500 text-white text-sm font-medium rounded-xl"
            >
              Confirm Reset
            </button>
            <button
              onClick={() => setShowResetConfirm(false)}
              className="flex-1 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl"
            >
              Cancel
            </button>
          </div>
        )}
      </Card>

      {/* About */}
      <div className="text-center py-6">
        <p className="text-xs text-gray-400">Dopamine v0.1.0</p>
        <p className="text-xs text-gray-400 mt-1">Built for ADHD brains</p>
      </div>
    </motion.div>
  );
}
