import { useState, useEffect } from 'react';

export function useDarkMode() {
  const [dark, setDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('calendar_dark_mode');
    return saved === 'true'; // default: light
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('calendar_dark_mode', String(dark));
  }, [dark]);

  return { dark, toggleDark: () => setDark((d) => !d) };
}
