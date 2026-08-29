import {
  addMinutes,
  areIntervalsOverlapping,
  format,
  isBefore,
  isSameDay,
  parse,
  set,
} from 'date-fns';
import type { Appointment, BlockedDate, BusinessHours } from '@/types';

export type TimeSlot = {
  start: Date;
  end: Date;
  label: string;
};

export function isDateBlocked(date: Date, blockedDates: BlockedDate[]) {
  const dateStr = format(date, 'yyyy-MM-dd');
  return blockedDates.some((b) => b.blocked_date === dateStr);
}

export function isWithinNoticePeriod(
  _date: Date,
  startTime: Date,
  bookingNoticeHours: number
) {
  const now = new Date();
  const earliestAllowed = addMinutes(now, bookingNoticeHours * 60);
  return !isBefore(startTime, earliestAllowed);
}

export function parseTime(timeStr: string): { hours: number; minutes: number } {
  const parsed = parse(timeStr, 'HH:mm:ss', new Date());
  return { hours: parsed.getHours(), minutes: parsed.getMinutes() };
}

export function buildDateTime(date: Date, timeStr: string): Date {
  const { hours, minutes } = parseTime(timeStr);
  return set(date, { hours, minutes, seconds: 0, milliseconds: 0 });
}

export function generateTimeSlots(
  date: Date,
  serviceDurationMinutes: number,
  slotIntervalMinutes: number,
  businessHours: BusinessHours[],
  blockedDates: BlockedDate[],
  existingAppointments: Appointment[],
  bookingNoticeHours: number
): TimeSlot[] {
  if (isDateBlocked(date, blockedDates)) return [];

  const weekday = date.getDay();
  const dayHours = businessHours.find((h) => h.weekday === weekday);

  if (!dayHours || !dayHours.is_open) return [];

  const open = buildDateTime(date, dayHours.start_time);
  const close = buildDateTime(date, dayHours.end_time);

  if (isBefore(close, open)) return [];

  const slots: TimeSlot[] = [];
  let current = open;

  while (addMinutes(current, serviceDurationMinutes) <= close) {
    const slotStart = current;
    const slotEnd = addMinutes(current, serviceDurationMinutes);

    const overlaps = existingAppointments.some((appt) => {
      if (appt.status === 'cancelled') return false;

      const apptDate = parse(appt.appointment_date, 'yyyy-MM-dd', new Date());
      if (!isSameDay(date, apptDate)) return false;

      const apptStart = buildDateTime(apptDate, appt.start_time);
      const apptEnd = buildDateTime(apptDate, appt.end_time);

      return areIntervalsOverlapping(
        { start: slotStart, end: slotEnd },
        { start: apptStart, end: apptEnd },
        { inclusive: false }
      );
    });

    const respectsNotice = isWithinNoticePeriod(date, slotStart, bookingNoticeHours);

    if (!overlaps && respectsNotice) {
      slots.push({
        start: slotStart,
        end: slotEnd,
        label: format(slotStart, 'h:mm a'),
      });
    }

    current = addMinutes(current, slotIntervalMinutes);
  }

  return slots;
}

export function toSupabaseDate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function toSupabaseTime(date: Date): string {
  return format(date, 'HH:mm:ss');
}
