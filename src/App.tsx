import React from 'react';
import Calendar from './components/Calendar/Calendar';
import { useDarkMode } from './hooks/useDarkMode';
import { Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';

function App() {
  const { dark, toggleDark } = useDarkMode();

  return (
    <div
      className="relative flex items-start sm:items-center justify-center min-h-screen sm:p-6 md:p-10 font-sans transition-colors duration-300"
      style={{ background: 'var(--page-bg)' }}
    >
      {/* ── Dark Mode Toggle ── fixed top-right, always visible */}
      <motion.button
        onClick={toggleDark}
        whileTap={{ scale: 0.88, rotate: dark ? -15 : 15 }}
        whileHover={{ scale: 1.1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
        className="fixed top-4 right-4 z-[100] w-10 h-10 rounded-full flex items-center justify-center shadow-lg border"
        style={{
          background : dark ? '#1e2433' : '#ffffff',
          borderColor: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
          color      : dark ? '#f1f5f9' : '#475569',
          boxShadow  : '0 4px 16px rgba(0,0,0,0.15)',
        }}
        title={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {dark
          ? <Sun  className="w-4 h-4" />
          : <Moon className="w-4 h-4" />
        }
      </motion.button>

      <div className="w-full max-w-5xl">
        <Calendar />
      </div>
    </div>
  );
}

export default App;