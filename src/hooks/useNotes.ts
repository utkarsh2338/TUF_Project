import { useState, useEffect } from 'react';

export function useNotes(monthKey: string) {
  const [notes, setNotes] = useState<Record<string, string>>({});

  const storageKey = `calendar_notes_${monthKey}`;

  // Reload whenever the month changes
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setNotes(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse notes', e);
      }
    } else {
      setNotes({}); // fresh month → start empty
    }
  }, [storageKey]);

  const saveNote = (key: string, content: string) => {
    const newNotes = { ...notes };
    if (!content.trim()) {
      delete newNotes[key];
    } else {
      newNotes[key] = content;
    }
    setNotes(newNotes);
    localStorage.setItem(storageKey, JSON.stringify(newNotes));
  };

  const getNote = (key: string) => notes[key] || '';

  /** True if the exact key has a note */
  const hasNote = (dateStr: string) => !!notes[dateStr];

  /**
   * Build the storage key for a selection.
   * - Single date: "yyyy-MM-dd"
   * - Date range:  "yyyy-MM-dd_to_yyyy-MM-dd"
   */
  const buildKey = (start: Date, end?: Date | null) => {
    const s = formatDateKey(start);
    if (!end) return s;
    const e = formatDateKey(end);
    if (s === e) return s; // same day → treat as single
    return `${s}_to_${e}`;
  };

  return { notes, saveNote, getNote, hasNote, buildKey };
}

/** Formats a Date to "yyyy-MM-dd" */
export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
