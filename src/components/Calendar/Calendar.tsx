import React, { useState, useEffect } from 'react';
import HeroSection from './HeroSection';
import CalendarGrid from './CalendarGrid';
import NotesPanel from '../Notes/NotesPanel';
import AllNotesPanel from '../Notes/AllNotesPanel';
import { useCalendarState } from '../../hooks/useCalendarState';
import { useNotes } from '../../hooks/useNotes';
import { useMonthImages, compressImage } from '../../hooks/useMonthImages';
import { usePinnedDates } from '../../hooks/usePinnedDates';
import { format, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Star } from 'lucide-react';

const MONTH_IMAGES: Record<number, string> = {
  0:  'https://images.unsplash.com/photo-1516912481808-3406841bd33c?auto=format&fit=crop&w=1000&q=80',
  1:  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1000&q=80',
  2:  'https://images.unsplash.com/photo-1490750967868-88df5691cc52?auto=format&fit=crop&w=1000&q=80',
  3:  'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1000&q=80',
  4:  'https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?auto=format&fit=crop&w=1000&q=80',
  5:  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
  6:  'https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?auto=format&fit=crop&w=1000&q=80',
  7:  'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=1000&q=80',
  8:  'https://images.unsplash.com/photo-1504198322253-cfa87a0ff25f?auto=format&fit=crop&w=1000&q=80',
  9:  'https://images.unsplash.com/photo-1444080748397-f442aa95c3e5?auto=format&fit=crop&w=1000&q=80',
  10: 'https://images.unsplash.com/photo-1477601263568-180e2c6d046e?auto=format&fit=crop&w=1000&q=80',
  11: 'https://images.unsplash.com/photo-1418985991508-e47386d96a71?auto=format&fit=crop&w=1000&q=80',
};

export default function Calendar() {
  const [themeColors, setThemeColors] = useState<{ primary: string; secondary: string } | null>(null);

  // ── Feature: Month Persistence ──
  const [currentMonth, setCurrentMonth] = useState(() => {
    try {
      const saved = localStorage.getItem('calendar_current_month');
      return saved ? new Date(saved) : new Date();
    } catch { return new Date(); }
  });

  const handleMonthChange = (date: Date) => {
    setCurrentMonth(date);
    localStorage.setItem('calendar_current_month', date.toISOString());
  };

  const { dateRange, hoverDate, handleDateSelect, setHoverDate } = useCalendarState();
  const monthKey = format(currentMonth, 'yyyy-MM');
  const { notes, saveNote, getNote, hasNote, buildKey } = useNotes(monthKey);
  const { getCustomImage, saveCustomImage, removeCustomImage } = useMonthImages();
  const { isPinned, togglePin } = usePinnedDates();

  const defaultImageUrl = MONTH_IMAGES[currentMonth.getMonth()];
  const customImageUrl  = getCustomImage(monthKey);
  const heroImageUrl    = customImageUrl ?? defaultImageUrl;
  const hasCustomImage  = !!customImageUrl;

  const handleImageUpload = async (file: File) => {
    try {
      const dataUrl = await compressImage(file);
      saveCustomImage(monthKey, dataUrl);
    } catch (err) {
      console.error('Image upload failed', err);
    }
  };

  const handleRemoveImage = () => removeCustomImage(monthKey);

  const [showNotes, setShowNotes] = useState(false);
  const [showAllNotes, setShowAllNotes] = useState(false);
  const [currentNoteKey, setCurrentNoteKey] = useState<string | null>(null);
  const [currentNoteLabel, setCurrentNoteLabel] = useState('');
  const [currentNoteIsRange, setCurrentNoteIsRange] = useState(false);

  const totalNotes = Object.values(notes).filter((n) => n.trim()).length;

  useEffect(() => {
    if (themeColors) {
      document.documentElement.style.setProperty('--theme-primary', themeColors.primary);
      document.documentElement.style.setProperty('--theme-primary-light', themeColors.secondary);
    } else {
      document.documentElement.style.setProperty('--theme-primary', '#0ea5e9');
      document.documentElement.style.setProperty('--theme-primary-light', '#e0f2fe');
    }
  }, [themeColors]);

  const openNoteForSelection = () => {
    if (!dateRange.start) return;
    const isRange = !!(dateRange.end);
    const key = buildKey(dateRange.start, dateRange.end);
    const label = isRange
      ? `${format(dateRange.start, 'MMM d')} – ${format(dateRange.end!, 'MMM d, yyyy')}`
      : format(dateRange.start, 'MMMM d, yyyy');
    setCurrentNoteKey(key);
    setCurrentNoteLabel(label);
    setCurrentNoteIsRange(isRange);
    setShowNotes(true);
  };

  const openNoteForDate = (date: Date) => {
    const key = buildKey(date);
    const label = format(date, 'MMMM d, yyyy');
    setCurrentNoteKey(key);
    setCurrentNoteLabel(label);
    setCurrentNoteIsRange(false);
    setShowNotes(true);
  };

  const openNoteForKey = (key: string) => {
    const isRange = key.includes('_to_');
    let label = key;
    try {
      if (isRange) {
        const [s, e] = key.split('_to_');
        label = `${format(parseISO(s), 'MMM d')} – ${format(parseISO(e), 'MMM d, yyyy')}`;
      } else {
        label = format(parseISO(key), 'MMMM d, yyyy');
      }
    } catch { /* keep raw key as label */ }
    setCurrentNoteKey(key);
    setCurrentNoteLabel(label);
    setCurrentNoteIsRange(isRange);
    setShowAllNotes(false);
    setShowNotes(true);
  };

  const deleteNote = (key: string) => saveNote(key, '');

  return (
    /* Root card — entrance animation, stacked on mobile, side-by-side on md+ */
    <motion.div
      className="w-full mx-auto calendar-card rounded-2xl md:rounded-3xl border border-white/60 flex flex-col md:flex-row overflow-hidden"
      style={{ boxShadow: '0 25px 60px -12px rgba(0,0,0,0.18), 0 0 0 1px rgba(255,255,255,0.6) inset' }}
      initial={{ opacity: 0, y: 32, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55, ease: [0.34, 1.2, 0.64, 1] }}
    >
      {/* ── Hero panel ── */}
      <div className="w-full md:w-5/12 relative flex-shrink-0">
        {/* Binder rings — desktop only, 3D style */}
        <div className="hidden md:flex absolute top-0 left-0 w-full justify-evenly items-start px-5 z-20 pointer-events-none" style={{ marginTop: '-10px' }}>
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="ring-shadow flex flex-col items-center"
              style={{
                width: '14px', height: '32px',
                background: 'linear-gradient(180deg, #4a4a4a 0%, #1a1a1a 50%, #3a3a3a 100%)',
                borderRadius: '4px 4px 50% 50%',
                border: '1px solid #111',
              }}
            >
              <div style={{ width: '6px', height: '6px', marginTop: '4px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', boxShadow: '0 1px 0 rgba(0,0,0,0.5)' }} />
            </div>
          ))}
        </div>

        {/* Image */}
        <div className="h-48 sm:h-56 md:h-full md:min-h-[600px]">
          <HeroSection
            imageUrl={heroImageUrl}
            currentMonth={currentMonth}
            hasCustomImage={hasCustomImage}
            onColorsExtracted={setThemeColors}
            onUpload={handleImageUpload}
            onRemoveCustom={handleRemoveImage}
          />
        </div>
      </div>

      {/* ── Calendar panel ── */}
      <div className="w-full md:w-7/12 flex flex-col">
        {/* Scrollable body with grid */}
        <div className="flex-1 px-4 py-5 sm:px-6 sm:py-6 md:px-10 md:py-10">
          <CalendarGrid
            dateRange={dateRange}
            hoverDate={hoverDate}
            currentMonth={currentMonth}
            onMonthChange={handleMonthChange}
            onDateSelect={(date: Date) => handleDateSelect(date)}
            onHoverDate={setHoverDate}
            hasNote={hasNote}
            getNote={(dateStr: string) => getNote(dateStr)}
            isPinned={(dateStr: string) => isPinned(dateStr)}
            onDateDoubleClick={openNoteForDate}
          />
        </div>

        {/* Footer */}
        <div
          className="px-4 sm:px-6 md:px-10 py-4 border-t"
          style={{ borderColor: 'var(--surface-border)', background: 'var(--surface)' }}
        >
          {/* Selection label with animation */}
          <AnimatePresence mode="wait">
            <motion.p
              key={`${dateRange.start?.toISOString()}-${dateRange.end?.toISOString()}`}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="text-xs sm:text-sm font-medium mb-3 truncate"
              style={{ color: dateRange.start ? 'var(--theme-primary)' : '#94a3b8' }}
            >
              {dateRange.start && dateRange.end
                ? `📅 ${format(dateRange.start, 'MMM d')} – ${format(dateRange.end, 'MMM d, yyyy')}`
                : dateRange.start
                ? `📍 ${format(dateRange.start, 'MMMM d, yyyy')}`
                : 'Tap a date to start — tap again to set a range'}
            </motion.p>
          </AnimatePresence>

          <div className="flex items-center gap-2 flex-wrap">
            {/* All Notes */}
            <motion.button
              onClick={() => setShowAllNotes(true)}
              whileTap={{ scale: 0.92 }}
              whileHover={{ scale: 1.03 }}
              transition={{ type: 'spring', stiffness: 450, damping: 20 }}
              className="relative flex items-center gap-1.5 px-3 py-2 sm:px-4 rounded-full border border-slate-200 text-slate-500 hover:border-[var(--theme-primary)] hover:text-[var(--theme-primary)] transition-colors font-semibold text-xs sm:text-sm"
            >
              <BookOpen className="w-4 h-4 flex-shrink-0" />
              <span>All Notes</span>
              <AnimatePresence>
                {totalNotes > 0 && (
                  <motion.span
                    key="badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: 'spring', stiffness: 600, damping: 20 }}
                    className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] rounded-full text-[10px] font-bold flex items-center justify-center text-white px-1"
                    style={{ background: 'var(--theme-primary)' }}
                  >
                    {totalNotes}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Pin / Unpin — only for single date */}
            <AnimatePresence>
              {dateRange.start && !dateRange.end && (() => {
                const dateStr = format(dateRange.start, 'yyyy-MM-dd');
                const pinned  = isPinned(dateStr);
                return (
                  <motion.button
                    key="pin-btn"
                    initial={{ opacity: 0, scale: 0.85, x: -6 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.85, x: -6 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 22 }}
                    whileTap={{ scale: 0.9 }}
                    whileHover={{ scale: 1.06 }}
                    onClick={() => togglePin(dateStr)}
                    className="flex items-center gap-1 px-3 py-2 rounded-full border text-xs font-semibold transition-colors"
                    style={pinned ? {
                      background: '#fef3c7',
                      borderColor: '#f59e0b',
                      color: '#b45309',
                    } : {
                      borderColor: 'var(--surface-border, #e2e8f0)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <Star className={`w-3.5 h-3.5 ${pinned ? 'fill-current' : ''}`}
                      style={{ color: pinned ? '#f59e0b' : 'inherit' }} />
                    {pinned ? 'Pinned' : 'Pin Date'}
                  </motion.button>
                );
              })()}
            </AnimatePresence>
            {/* Add Note */}
            <AnimatePresence>
              {dateRange.start && (
                <motion.button
                  key="add-note-btn"
                  initial={{ opacity: 0, scale: 0.85, x: -8 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.85, x: -8 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 22 }}
                  whileTap={{ scale: 0.93 }}
                  whileHover={{ scale: 1.04 }}
                  onClick={openNoteForSelection}
                  className="flex-1 sm:flex-none px-3 py-2 sm:px-5 rounded-full text-white font-semibold text-xs sm:text-sm text-center"
                  style={{
                    background: 'var(--theme-primary)',
                    boxShadow: '0 4px 14px -3px var(--theme-primary)',
                  }}
                >
                  {dateRange.end ? '＋ Range Note' : '＋ Add Note'}
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Note Editor */}
        <AnimatePresence>
          {showNotes && (
            <motion.div
              key="note-overlay"
              className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)' }}
              onClick={() => setShowNotes(false)}
            >
              <motion.div
                initial={{ y: 40, scale: 0.97, opacity: 0 }}
                animate={{ y: 0, scale: 1, opacity: 1 }}
                exit={{ y: 30, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
              <NotesPanel
                isOpen={showNotes}
                onClose={() => setShowNotes(false)}
                noteKey={currentNoteKey}
                displayLabel={currentNoteLabel}
                isRange={currentNoteIsRange}
                initialNote={currentNoteKey ? getNote(currentNoteKey) : ''}
                onSave={saveNote}
              />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* All Notes Drawer */}
      <AllNotesPanel
        isOpen={showAllNotes}
        onClose={() => setShowAllNotes(false)}
        notes={notes}
        onDelete={deleteNote}
        onEdit={openNoteForKey}
      />
    </motion.div>
  );
}
