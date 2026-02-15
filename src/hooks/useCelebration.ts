import { useState, useEffect, useCallback } from 'react';
import type { CelebrationEvent } from '../types';

export function useCelebration() {
  const [queue, setQueue] = useState<CelebrationEvent[]>([]);
  const [current, setCurrent] = useState<CelebrationEvent | null>(null);

  useEffect(() => {
    if (!current && queue.length > 0) {
      setCurrent(queue[0]);
      setQueue((q) => q.slice(1));
    }
  }, [current, queue]);

  const dismiss = useCallback(() => setCurrent(null), []);

  const enqueue = useCallback((events: CelebrationEvent[]) => {
    if (events.length === 0) return;
    setQueue((q) => [...q, ...events]);
  }, []);

  const enqueueOne = useCallback((event: CelebrationEvent) => {
    setQueue((q) => [...q, event]);
  }, []);

  return { current, dismiss, enqueue, enqueueOne };
}
