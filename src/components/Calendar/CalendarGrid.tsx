import React, { useState } from 'react';
import {
  format, addMonths, subMonths, getDaysInMonth, startOfMonth,
  getDay, addDays, isSameDay, isSameMonth
} from 'date-fns';
import { ChevronLeft, ChevronRight, CalendarCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DateCell from './DateCell';
import { DateRange } from '../../types/calendar';

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

interface CalendarGridProps {
  dateRange: DateRange;
  hoverDate: Date | null;
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  onDateSelect: (date: Date) => void;
  onHoverDate: (date: Date | null) => void;
  hasNote: (dateStr: string) => boolean;
  getNote: (dateStr: string) => string;
  isPinned: (dateStr: string) => boolean;
  onDateDoubleClick: (date: Date) => void;
}

export default function CalendarGrid({
  dateRange, hoverDate, currentMonth, onMonthChange, onDateSelect, onHoverDate, hasNote, getNote, isPinned
}: CalendarGridProps) {
  const [direction, setDirection] = useState(0);
  const today = new Date();
  const isCurrentMonth = isSameMonth(currentMonth, today);

  const nextMonth  = () => { setDirection(1);  onMonthChange(addMonths(currentMonth, 1)); };
  const prevMonth  = () => { setDirection(-1); onMonthChange(subMonths(currentMonth, 1)); };
  const goToToday  = () => {
    const dir = currentMonth < today ? 1 : -1;
    setDirection(dir);
    onMonthChange(today);
  };

  const daysInMonth      = getDaysInMonth(currentMonth);
  const firstDayOfMonth  = startOfMonth(currentMonth);
  const startingDayIndex = getDay(firstDayOfMonth);

  const calendarDays: Date[] = [];
  for (let i = startingDayIndex - 1; i >= 0; i--)  calendarDays.push(addDays(firstDayOfMonth, -(i + 1)));
  for (let i = 0; i < daysInMonth; i++)             calendarDays.push(addDays(firstDayOfMonth, i));
  const lastDay = calendarDays[calendarDays.length - 1];
  for (let i = 1; i <= 42 - calendarDays.length; i++) calendarDays.push(addDays(lastDay, i));

  const slideVariants = {
    enter:  (d: number) => ({ x: d > 0 ?  40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:   (d: number) => ({ x: d > 0 ? -40 :  40, opacity: 0 }),
  };

  return (
    <div className="flex flex-col text-slate-800">

      {/* ── Month/Year header ── */}
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <div className="overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentMonth.toISOString()}
              initial={{ y: direction > 0 ? 20 : -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: direction > 0 ? -20 : 20, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            >
              <h2
                className="font-display leading-none tracking-tight text-[var(--theme-primary)]"
                style={{ fontSize: 'clamp(1.6rem, 5vw, 2.25rem)', fontWeight: 700 }}
              >
                {format(currentMonth, 'MMMM')}
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-slate-300 tracking-[0.2em] uppercase mt-0.5">
                {format(currentMonth, 'yyyy')}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation: Go to Today + arrows */}
        <div className="flex items-center gap-1">
          {/* Go to Today — spring in when away from current month */}
          <AnimatePresence>
            {!isCurrentMonth && (
              <motion.button
                key="go-today"
                initial={{ opacity: 0, scale: 0.7, width: 0 }}
                animate={{ opacity: 1, scale: 1, width: 'auto' }}
                exit={{ opacity: 0, scale: 0.7, width: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 26 }}
                onClick={goToToday}
                whileTap={{ scale: 0.88 }}
                whileHover={{ scale: 1.06 }}
                className="overflow-hidden flex items-center gap-1 px-2.5 py-1.5 rounded-full text-white text-xs font-bold mr-1 shadow-md"
                style={{
                  background: 'var(--theme-primary)',
                  boxShadow: '0 3px 10px -2px var(--theme-primary)',
                }}
              >
                <CalendarCheck className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="whitespace-nowrap">Today</span>
              </motion.button>
            )}
          </AnimatePresence>

          {/* Prev / Next arrows */}
          {[{ fn: prevMonth, icon: <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" /> },
            { fn: nextMonth, icon: <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" /> }
          ].map(({ fn, icon }, i) => (
            <motion.button
              key={i}
              onClick={fn}
              whileTap={{ scale: 0.85 }}
              whileHover={{ scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              className="
                p-1.5 sm:p-2 rounded-full
                text-slate-400 hover:text-[var(--theme-primary)]
                hover:bg-[var(--theme-primary-light)]/20
                transition-colors duration-150
              "
            >
              {icon}
            </motion.button>
          ))}
        </div>
      </div>

      {/* ── Day-of-week labels ── */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS_OF_WEEK.map((day) => (
          <div
            key={day}
            className="text-center text-[10px] sm:text-xs font-bold text-slate-300 uppercase tracking-widest py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* ── Date grid ── */}
      <div className="overflow-hidden" onMouseLeave={() => onHoverDate(null)}>
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={currentMonth.toISOString() + '-grid'}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="grid grid-cols-7"
          >
            {calendarDays.map((date, idx) => {
              const isStart = !!(dateRange.start && isSameDay(date, dateRange.start));
              const isEnd   = !!(dateRange.end   && isSameDay(date, dateRange.end));
              const isInRange = !!(
                dateRange.start && dateRange.end &&
                date > dateRange.start && date < dateRange.end
              );
              const isHoverRange = !!(
                !dateRange.end && dateRange.start && hoverDate &&
                ((date > dateRange.start && date <= hoverDate) ||
                 (date < dateRange.start && date >= hoverDate))
              );
              const isSingleSelection = !!(dateRange.start && !dateRange.end && !hoverDate);

              return (
                <DateCell
                  key={idx}
                  idx={idx}
                  date={date}
                  currentMonth={currentMonth}
                  isStart={isStart}
                  isEnd={isEnd}
                  isInRange={isInRange}
                  isHoverRange={isHoverRange && !isStart}
                  isSingleSelection={isSingleSelection}
                  hasNote={hasNote(format(date, 'yyyy-MM-dd'))}
                  noteContent={getNote(format(date, 'yyyy-MM-dd'))}
                  isPinned={isPinned(format(date, 'yyyy-MM-dd'))}
                  onClick={() => onDateSelect(date)}
                  onMouseEnter={() => {
                    if (dateRange.start && !dateRange.end) onHoverDate(date);
                  }}
                />
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
