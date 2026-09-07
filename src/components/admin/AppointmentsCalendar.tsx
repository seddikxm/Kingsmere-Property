import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  parse,
  parseISO,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Mail, Phone, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';
import { useUpdateAppointmentStatus } from '@/hooks/useAppointments';
import type { Appointment, AppointmentStatus } from '@/types';

const STATUS_OPTIONS: AppointmentStatus[] = ['pending', 'confirmed', 'cancelled', 'completed'];

const chipColors: Record<AppointmentStatus, string> = {
  pending: 'bg-gold-100 text-gold-800 border-gold-200',
  confirmed: 'bg-navy-100 text-navy-800 border-navy-200',
  completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  cancelled: 'bg-stone-100 text-stone-500 border-stone-200 line-through',
};

const dotColors: Record<AppointmentStatus, string> = {
  pending: 'bg-gold-500',
  confirmed: 'bg-navy-700',
  completed: 'bg-emerald-600',
  cancelled: 'bg-stone-300',
};

export function AppointmentsCalendar({ appointments }: { appointments: Appointment[] }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const updateStatus = useUpdateAppointmentStatus();
  const { toast } = useToast();

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const byDate = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    appointments.forEach((a) => {
      const key = format(parseISO(a.appointment_date), 'yyyy-MM-dd');
      const list = map.get(key) || [];
      list.push(a);
      map.set(key, list);
    });
    map.forEach((list) => list.sort((a, b) => a.start_time.localeCompare(b.start_time)));
    return map;
  }, [appointments]);

  const selectedAppointments = byDate.get(format(selectedDate, 'yyyy-MM-dd')) || [];

  const handleStatusChange = async (id: string, status: AppointmentStatus) => {
    try {
      await updateStatus.mutateAsync({ id, status });
      toast(`Appointment ${status}`);
    } catch {
      toast('Status update failed', 'error');
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-3">
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-soft">
          <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
            <h3 className="font-serif text-xl text-stone-900">{format(currentMonth, 'MMMM yyyy')}</h3>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(new Date())}>
                Today
              </Button>
              <button
                onClick={() => setCurrentMonth((m) => addMonths(m, -1))}
                className="rounded-lg p-2 text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-900"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
                className="rounded-lg p-2 text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-900"
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 border-b border-stone-100 bg-stone-50/60">
            {weekDays.map((d) => (
              <div key={d} className="px-2 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {days.map((day, i) => {
              const key = format(day, 'yyyy-MM-dd');
              const dayAppointments = byDate.get(key) || [];
              const inMonth = isSameMonth(day, currentMonth);
              const selected = isSameDay(day, selectedDate);
              return (
                <button
                  key={key}
                  onClick={() => setSelectedDate(day)}
                  className={`min-h-[96px] border-b border-r p-1.5 text-left transition-colors last:border-r-0 ${
                    i % 7 === 6 ? 'border-r-0' : ''
                  } ${i >= 35 ? 'border-b-0' : ''} ${
                    selected ? 'bg-navy-50/70' : inMonth ? 'bg-white hover:bg-stone-50' : 'bg-stone-50/50 hover:bg-stone-50'
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                      isToday(day)
                        ? 'bg-gold-500 font-bold text-white'
                        : inMonth
                          ? selected
                            ? 'bg-navy-800 text-white'
                            : 'text-stone-700'
                          : 'text-stone-300'
                    }`}
                  >
                    {format(day, 'd')}
                  </span>
                  <div className="mt-1 space-y-1">
                    {dayAppointments.slice(0, 2).map((a) => (
                      <span
                        key={a.id}
                        className={`flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-medium leading-tight ${chipColors[a.status]}`}
                      >
                        <span className={`h-1 w-1 shrink-0 rounded-full ${dotColors[a.status]}`} />
                        <span className="truncate">
                          {a.start_time.slice(0, 5)} {a.full_name.split(' ')[0]}
                        </span>
                      </span>
                    ))}
                    {dayAppointments.length > 2 && (
                      <span className="block px-1 text-[10px] font-medium text-stone-400">
                        +{dayAppointments.length - 2} more
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl text-stone-900">{format(selectedDate, 'EEEE, MMM d')}</h3>
            <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-500">
              {selectedAppointments.length} appointment{selectedAppointments.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {selectedAppointments.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-stone-400">
                  <CalendarIcon className="h-6 w-6" />
                </div>
                <p className="mt-3 text-sm font-medium text-stone-900">No appointments this day</p>
                <p className="mt-1 text-xs text-stone-500">Select another date on the calendar.</p>
              </div>
            ) : (
              selectedAppointments.map((a, idx) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: idx * 0.06, ease: [0.32, 0.72, 0, 1] }}
                  className="rounded-xl border border-stone-200 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-50 text-navy-700">
                        <Users className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-stone-900">{a.full_name}</p>
                        <p className="text-xs text-stone-500">{a.service?.name || 'Consultation'}</p>
                      </div>
                    </div>
                    <Badge variant={a.status as any} className="capitalize">
                      {a.status}
                    </Badge>
                  </div>

                  <div className="mt-3 space-y-1.5 text-xs text-stone-600">
                    <p className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-stone-400" />
                      {format(parse(a.start_time, 'HH:mm:ss', new Date()), 'h:mm a')} -{' '}
                      {format(parse(a.end_time, 'HH:mm:ss', new Date()), 'h:mm a')}
                    </p>
                    <p className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-stone-400" />
                      {a.email}
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-stone-400" />
                      {a.phone}
                    </p>
                  </div>

                  <div className="mt-3 border-t border-stone-100 pt-3">
                    <Select
                      value={a.status}
                      onChange={(e) => handleStatusChange(a.id, e.target.value as AppointmentStatus)}
                      className="h-8 w-full text-xs"
                      disabled={updateStatus.isPending}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </option>
                      ))}
                    </Select>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
