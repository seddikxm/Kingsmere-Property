import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface CalendarProps {
  selected?: Date;
  onSelect: (date: Date) => void;
  disabled?: (date: Date) => boolean;
  className?: string;
}

export function Calendar({ selected, onSelect, disabled, className }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const isDisabled = (date: Date) => {
    if (disabled) return disabled(date);
    return false;
  };

  return (
    <div className={cn('w-full rounded-2xl border border-stone-200 bg-white p-5 shadow-soft', className)}>
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}
          className="rounded-lg p-2 text-stone-500 hover:bg-stone-100 hover:text-stone-900"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-semibold text-stone-900">
          {format(currentMonth, 'MMMM yyyy')}
        </span>
        <button
          type="button"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="rounded-lg p-2 text-stone-500 hover:bg-stone-100 hover:text-stone-900"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {weekDays.map((day) => (
          <div key={day} className="py-2 text-xs font-medium text-stone-400">
            {day}
          </div>
        ))}
        {days.map((date) => {
          const disabledDate = isDisabled(date);
          return (
            <button
              key={date.toISOString()}
              type="button"
              disabled={disabledDate}
              onClick={() => onSelect(date)}
              className={cn(
                'relative aspect-square rounded-lg text-sm font-medium transition-all',
                !isSameMonth(date, currentMonth) && 'text-stone-300',
                isSameMonth(date, currentMonth) && !selected && !disabledDate && 'text-stone-700 hover:bg-stone-100',
                isToday(date) && !selected && 'text-navy-700 font-semibold',
                disabledDate && 'pointer-events-none text-stone-300',
                selected && isSameDay(date, selected) && 'bg-navy-800 text-white shadow-soft',
                selected && !isSameDay(date, selected) && 'text-stone-700 hover:bg-stone-100'
              )}
            >
              {format(date, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
}
