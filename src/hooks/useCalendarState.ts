import { useState } from 'react';
import { DateRange } from '../types/calendar';
import { isBefore, startOfDay, isSameDay } from 'date-fns';

export function useCalendarState() {
  const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  const handleDateSelect = (date: Date) => {
    const selectedDate = startOfDay(date);
    
    // Deselect if clicking same date when only start is selected
    if (dateRange.start && !dateRange.end && isSameDay(selectedDate, dateRange.start)) {
      setDateRange({ start: null, end: null });
      return;
    }

    // Reset if both are selected
    if (dateRange.start && dateRange.end) {
      setDateRange({ start: selectedDate, end: null });
      return;
    }
    
    // If no start date, or we clicked a date before the start date
    if (!dateRange.start || isBefore(selectedDate, dateRange.start)) {
      setDateRange({ start: selectedDate, end: null });
    } else {
      setDateRange({ ...dateRange, end: selectedDate });
    }
  };

  return {
    dateRange,
    setDateRange,
    hoverDate,
    setHoverDate,
    handleDateSelect
  };
}
