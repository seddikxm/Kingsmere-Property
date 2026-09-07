import { useMemo, useState } from 'react';
import { format, parse, parseISO } from 'date-fns';
import { Calendar, List, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import { AppointmentsCalendar } from '@/components/admin/AppointmentsCalendar';
import { useAppointments, useUpdateAppointmentStatus } from '@/hooks/useAppointments';
import { Input } from '@/components/ui/input';
import type { AppointmentStatus } from '@/types';

const STATUS_OPTIONS: AppointmentStatus[] = ['pending', 'confirmed', 'cancelled', 'completed'];

export function AppointmentsPage() {
  const { data: appointments, isLoading } = useAppointments();
  const updateStatus = useUpdateAppointmentStatus();
  const { toast } = useToast();
  const [filter, setFilter] = useState<AppointmentStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'list' | 'calendar'>('list');

  const filtered = useMemo(() => {
    if (!appointments) return [];
    return appointments
      .filter((a) => (filter === 'all' ? true : a.status === filter))
      .filter((a) => {
        const term = search.toLowerCase();
        return (
          a.full_name.toLowerCase().includes(term) ||
          a.email.toLowerCase().includes(term) ||
          a.service?.name?.toLowerCase().includes(term) ||
          false
        );
      })
      .sort((a, b) => {
        const da = parseISO(a.appointment_date).getTime();
        const db = parseISO(b.appointment_date).getTime();
        return da - db || a.start_time.localeCompare(b.start_time);
      });
  }, [appointments, filter, search]);

  const handleStatusChange = async (id: string, status: AppointmentStatus) => {
    try {
      await updateStatus.mutateAsync({ id, status });
      toast(`Appointment ${status}`);
    } catch {
      toast('Status update failed', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-stone-900">Appointments</h1>
          <p className="mt-1 text-stone-600">Manage and update client appointment statuses.</p>
        </div>
        <div className="flex items-center gap-1 self-start rounded-full border border-stone-200 bg-white p-1 shadow-soft">
          <button
            onClick={() => setView('list')}
            className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-300 ${
              view === 'list' ? 'bg-navy-800 text-white shadow-soft' : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <List className="h-4 w-4" />
            List
          </button>
          <button
            onClick={() => setView('calendar')}
            className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-300 ${
              view === 'calendar' ? 'bg-navy-800 text-white shadow-soft' : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <Calendar className="h-4 w-4" />
            Calendar
          </button>
        </div>
      </div>

      {view === 'calendar' ? (
        isLoading ? (
          <Skeleton className="h-[560px] w-full rounded-2xl" />
        ) : (
          <AppointmentsCalendar appointments={appointments || []} />
        )
      ) : (
      <Card>
        <CardHeader>
          <CardTitle>All appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <Input
                placeholder="Search by client, email, or service..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-stone-400" />
              <Select value={filter} onChange={(e) => setFilter(e.target.value as AppointmentStatus | 'all')}>
                <option value="all">All statuses</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-10 text-center text-stone-500">
              No appointments found.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-stone-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-stone-50 text-stone-600">
                  <tr>
                    <th className="px-4 py-3 font-medium">Client</th>
                    <th className="px-4 py-3 font-medium">Service</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Time</th>
                    <th className="px-4 py-3 font-medium">Phone</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filtered.map((appointment) => (
                    <tr key={appointment.id} className="bg-white hover:bg-stone-50">
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-stone-900">{appointment.full_name}</p>
                          <p className="text-xs text-stone-500">{appointment.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-stone-700">{appointment.service?.name}</td>
                      <td className="px-4 py-4 text-stone-700">
                        {format(parseISO(appointment.appointment_date), 'MMM do, yyyy')}
                      </td>
                      <td className="px-4 py-4 text-stone-700">
                        {format(parse(appointment.start_time, 'HH:mm:ss', new Date()), 'h:mm a')} –{' '}
                        {format(parse(appointment.end_time, 'HH:mm:ss', new Date()), 'h:mm a')}
                      </td>
                      <td className="px-4 py-4 text-stone-700">{appointment.phone}</td>
                      <td className="px-4 py-4">
                        <Select
                          value={appointment.status}
                          onChange={(e) => handleStatusChange(appointment.id, e.target.value as AppointmentStatus)}
                          className="h-8 text-xs"
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                            </option>
                          ))}
                        </Select>
                      </td>
                      <td className="px-4 py-4 text-stone-600 max-w-xs whitespace-normal break-words">{appointment.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      )}
    </div>
  );
}
