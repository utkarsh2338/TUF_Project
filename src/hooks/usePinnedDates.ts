import { useState, useEffect } from 'react';

const STORAGE_KEY = 'calendar_pinned_dates';

export function usePinnedDates() {
  const [pinned, setPinned] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? new Set<string>(JSON.parse(raw)) : new Set<string>();
    } catch {
      return new Set<string>();
    }
  });

  const persist = (next: Set<string>) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
    setPinned(new Set(next));
  };

  const togglePin = (dateStr: string) => {
    const next = new Set(pinned);
    if (next.has(dateStr)) next.delete(dateStr);
    else next.add(dateStr);
    persist(next);
  };

  const isPinned = (dateStr: string) => pinned.has(dateStr);

  return { isPinned, togglePin, pinnedCount: pinned.size };
}
