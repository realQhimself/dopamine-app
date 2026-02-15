import { useState } from 'react';
import { Modal } from '../shared/Modal';
import type { EnergyLevel, TaskCategory } from '../../types';
import { ENERGY_OPTIONS } from '../../lib/constants';
import { useSoundEffects } from '../../hooks/useSoundEffects';

const CATEGORIES: { value: TaskCategory; label: string }[] = [
  { value: 'routine', label: 'Routine' },
  { value: 'work', label: 'Work' },
  { value: 'health', label: 'Health' },
  { value: 'creative', label: 'Creative' },
  { value: 'admin', label: 'Admin' },
  { value: 'custom', label: 'Other' },
];

interface AddTaskInput {
  text: string;
  category: TaskCategory;
  energyLevel: EnergyLevel;
  estimatedMinutes: number;
  isMVD: boolean;
  xpReward: number;
  recurring: boolean;
}

export function AddTaskModal({
  isOpen,
  onClose,
  onAdd,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (input: AddTaskInput) => void;
}) {
  const { play, haptic } = useSoundEffects();
  const [text, setText] = useState('');
  const [category, setCategory] = useState<TaskCategory>('work');
  const [energy, setEnergy] = useState<EnergyLevel>('medium');
  const [minutes, setMinutes] = useState(10);
  const [recurring, setRecurring] = useState(false);
  const [isMVD, setIsMVD] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    play('coin');
    haptic();

    const xpReward = minutes <= 2 ? 5 : minutes <= 10 ? 10 : minutes <= 30 ? 15 : 25;

    onAdd({
      text: trimmed,
      category,
      energyLevel: energy,
      estimatedMinutes: minutes,
      isMVD,
      xpReward,
      recurring,
    });

    // Reset form
    setText('');
    setCategory('work');
    setEnergy('medium');
    setMinutes(10);
    setRecurring(false);
    setIsMVD(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Task">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Task text */}
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What needs doing?"
          className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm border border-gray-200 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
          autoFocus
        />

        {/* Category */}
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1.5 block">Category</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  category === cat.value
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Energy level */}
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1.5 block">Energy needed</label>
          <div className="flex gap-2">
            {ENERGY_OPTIONS.map((opt) => (
              <button
                key={opt.level}
                type="button"
                onClick={() => setEnergy(opt.level)}
                className={`flex-1 py-2 rounded-xl text-xs font-medium transition-colors ${
                  energy === opt.level
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {opt.emoji} {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Time estimate */}
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1.5 block">
            Time estimate: {minutes} min
          </label>
          <input
            type="range"
            min={1}
            max={60}
            value={minutes}
            onChange={(e) => setMinutes(Number(e.target.value))}
            className="w-full accent-amber-600"
          />
          <div className="flex justify-between text-[10px] text-gray-400">
            <span>1m</span>
            <span>60m</span>
          </div>
        </div>

        {/* Toggles */}
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={recurring}
              onChange={(e) => setRecurring(e.target.checked)}
              className="rounded accent-amber-600"
            />
            Daily task
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={isMVD}
              onChange={(e) => setIsMVD(e.target.checked)}
              className="rounded accent-amber-500"
            />
            Essential (MVD)
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-3 bg-amber-600 text-white rounded-2xl font-semibold hover:bg-amber-700 active:scale-[0.98] transition-transform"
        >
          Add Task
        </button>
      </form>
    </Modal>
  );
}
