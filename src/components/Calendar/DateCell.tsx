import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { isSameMonth, isToday, format, getDay } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { StickyNote, Star } from 'lucide-react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface DateCellProps {
  date: Date;
  currentMonth: Date;
  isStart: boolean;
  isEnd: boolean;
  isInRange: boolean;
  isHoverRange: boolean;
  isSingleSelection: boolean;
  hasNote: boolean;
  noteContent: string;
  isPinned: boolean;
  idx: number;
  onClick: () => void;
  onMouseEnter: () => void;
}

export default function DateCell({
  date, currentMonth, isStart, isEnd, isInRange, isHoverRange,
  isSingleSelection, hasNote, noteContent, isPinned,
  idx, onClick, onMouseEnter
}: DateCellProps) {
  const isCurrentMonth = isSameMonth(date, currentMonth);
  const isSelected     = isStart || isEnd;
  const isMiddle       = isInRange || isHoverRange;
  const today          = isToday(date);
  const dow            = getDay(date); // 0=Sun, 6=Sat
  const isSat          = dow === 6;
  const isSun          = dow === 0;

  const cellRef = useRef<HTMLDivElement>(null);
  const [tooltipPos, setTooltipPos] = useState<{ bottom: number; left: number } | null>(null);
  const TOOLTIP_W = 180;

  const showTooltip = !!(tooltipPos && hasNote && noteContent.trim());
  const tooltipText = noteContent.length > 80 ? noteContent.slice(0, 77) + '…' : noteContent;

  const handleMouseEnter = () => {
    onMouseEnter();
    if (hasNote && noteContent.trim() && cellRef.current) {
      const r = cellRef.current.getBoundingClientRect();
      const centerX = r.left + r.width / 2;
      setTooltipPos({
        bottom: window.innerHeight - r.top + 8,
        left: Math.max(8, Math.min(centerX - TOOLTIP_W / 2, window.innerWidth - TOOLTIP_W - 8)),
      });
    }
  };

  const handleMouseLeave = () => setTooltipPos(null);

  useEffect(() => { if (!hasNote) setTooltipPos(null); }, [hasNote]);

  // Weekend text color (overridden when selected)
  const weekendStyle = isCurrentMonth && !isSelected && !today
    ? isSat ? { color: 'var(--sat-color)' }
    : isSun ? { color: 'var(--sun-color)' }
    : {}
    : {};

  return (
    <motion.div
      ref={cellRef}
      className="relative flex items-center justify-center py-0.5"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: idx * 0.008, duration: 0.22, ease: [0.34, 1.4, 0.64, 1] }}
    >
      {/* Range strips */}
      <AnimatePresence>
        {isMiddle && !isSelected && (
          <motion.div key="range-mid"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="absolute inset-y-1.5 inset-x-0 -z-10"
            style={{ background: 'var(--theme-primary)', opacity: 0.1 }} />
        )}
        {isStart && !isSingleSelection && (
          <motion.div key="range-start"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="absolute inset-y-1.5 right-0 left-1/2 -z-10"
            style={{ background: 'var(--theme-primary)', opacity: 0.1 }} />
        )}
        {isEnd && !isSingleSelection && (
          <motion.div key="range-end"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="absolute inset-y-1.5 left-0 right-1/2 -z-10"
            style={{ background: 'var(--theme-primary)', opacity: 0.1 }} />
        )}
      </AnimatePresence>

      {/* Today rings */}
      {today && !isSelected && (
        <>
          <motion.div className="absolute inset-0 m-auto rounded-full pointer-events-none"
            style={{ width: 'min(2.5rem,110%)', height: 'min(2.5rem,110%)', border: '1.5px solid var(--theme-primary)' }}
            animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.div className="absolute inset-0 m-auto rounded-full border-2 pointer-events-none"
            style={{ width: 'min(2rem,100%)', height: 'min(2rem,100%)', borderColor: 'var(--theme-primary)' }}
            initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 0.8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }} />
        </>
      )}

      {/* Day button */}
      <motion.button
        onClick={onClick}
        whileTap={{ scale: 0.85 }}
        whileHover={!isSelected ? { scale: 1.08, transition: { type: 'spring', stiffness: 500, damping: 28 } } : {}}
        animate={isSelected ? { scale: 1.1 } : { scale: 1 }}
        transition={{ type: 'spring', stiffness: 420, damping: 24 }}
        className={cn(
          'relative w-8 h-8 sm:w-10 sm:h-10 rounded-full flex flex-col items-center justify-center z-10',
          'font-medium text-xs sm:text-sm touch-manipulation select-none transition-colors duration-100',
          !isCurrentMonth && 'opacity-30',
          isCurrentMonth && !isSelected && !today && 'text-[var(--text-primary)]',
          today && !isSelected && 'font-bold',
          !isSelected && 'hover:bg-[var(--theme-primary)]/8',
          isSelected && 'text-white',
        )}
        style={
          isSelected
            ? { background: 'var(--theme-primary)', boxShadow: '0 4px 12px -3px var(--theme-primary)' }
            : today
            ? { color: 'var(--theme-primary)' }
            : weekendStyle
        }
      >
        <span className="leading-none">{format(date, 'd')}</span>

        {/* Note dot */}
        <AnimatePresence>
          {hasNote && (
            <motion.span key="note-dot"
              initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 600, damping: 20 }}
              className="absolute bottom-0.5 w-1 h-1 rounded-full"
              style={{ background: isSelected ? 'rgba(255,255,255,0.9)' : 'var(--theme-primary)' }} />
          )}
        </AnimatePresence>
      </motion.button>

      {/* ⭐ Pin indicator — top-right of cell */}
      <AnimatePresence>
        {isPinned && (
          <motion.div
            key="pin-star"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
            className="absolute top-0 right-0 pointer-events-none z-20"
          >
            <Star
              className="w-2.5 h-2.5 fill-current drop-shadow-sm"
              style={{ color: '#f59e0b' }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Note tooltip portal */}
      {showTooltip && tooltipPos && ReactDOM.createPortal(
        <AnimatePresence>
          <motion.div
            key="note-tooltip"
            className="pointer-events-none"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ type: 'spring', stiffness: 500, damping: 28 }}
            style={{
              position: 'fixed',
              bottom: tooltipPos.bottom,
              left: tooltipPos.left,
              width: `${TOOLTIP_W}px`,
              zIndex: 9999,
            }}
          >
            <div className="relative rounded-xl px-3 py-2 shadow-2xl"
              style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center gap-1.5 mb-1">
                <StickyNote className="w-2.5 h-2.5 flex-shrink-0" style={{ color: 'var(--theme-primary)' }} />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {format(date, 'MMM d')}
                </span>
              </div>
              <p className="text-[11px] text-slate-200 leading-snug whitespace-pre-wrap break-words">
                {tooltipText}
              </p>
              {/* Arrow */}
              <div className="absolute left-1/2 -bottom-1.5 -translate-x-1/2 w-3 h-3 rotate-45"
                style={{ background: '#1e293b', borderRight: '1px solid rgba(255,255,255,0.08)', borderBottom: '1px solid rgba(255,255,255,0.08)' }} />
            </div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </motion.div>
  );
}
