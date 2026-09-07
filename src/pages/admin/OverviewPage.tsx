import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ArrowRight, Calendar, CheckCircle2, Clock, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { StatCard } from '@/components/admin/StatCard';
import { useAppointments } from '@/hooks/useAppointments';
import { useServices } from '@/hooks/useServices';
import {
  eachDayOfInterval,
  format,
  isAfter,
  isFuture,
  isSameDay,
  parseISO,
  subDays,
} from 'date-fns';

export function OverviewPage() {
  const { data: appointments, isLoading: appointmentsLoading } = useAppointments();
  const { data: services, isLoading: servicesLoading } = useServices();

  const isLoading = appointmentsLoading || servicesLoading;

  const stats = useMemo(() => {
    if (!appointments || !services) return null;
    const now = new Date();
    const upcoming = appointments.filter((a) => isAfter(parseISO(a.appointment_date), now) && a.status !== 'cancelled');
    const pending = appointments.filter((a) => a.status === 'pending');
    const completed = appointments.filter((a) => a.status === 'completed');
    const activeServices = services.filter((s) => s.is_active).length;
    return { upcoming: upcoming.length, pending: pending.length, completed: completed.length, activeServices };
  }, [appointments, services]);

  const chartData = useMemo(() => {
    if (!appointments) return [];
    const days = eachDayOfInterval({ start: subDays(new Date(), 13), end: new Date() });
    return days.map((day) => ({
      date: format(day, 'MMM d'),
      bookings: appointments.filter((a) => isSameDay(parseISO(a.appointment_date), day)).length,
    }));
  }, [appointments]);

  const nextAppointments = useMemo(() => {
    if (!appointments) return [];
    return appointments
      .filter((a) => isFuture(parseISO(a.appointment_date)) && a.status !== 'cancelled')
      .slice(0, 5);
  }, [appointments]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
      >
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-gold-600">
          {format(new Date(), 'EEEE, MMMM do')}
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
          {greeting}
        </h1>
        <p className="mt-2 text-stone-600">
          Here is what is happening with your real estate appointments today.
        </p>
      </motion.div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Upcoming appointments" value={stats?.upcoming ?? 0} hint="Scheduled ahead" icon={Calendar} accent="navy" index={0} />
          <StatCard label="Pending requests" value={stats?.pending ?? 0} hint="Awaiting confirmation" icon={Clock} accent="gold" index={1} />
          <StatCard label="Completed" value={stats?.completed ?? 0} hint="All time" icon={CheckCircle2} accent="emerald" index={2} />
          <StatCard label="Active services" value={stats?.activeServices ?? 0} hint="On public website" icon={TrendingUp} accent="stone" index={3} />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-5">
        <motion.div
          className="lg:col-span-3"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.32, 0.72, 0, 1] }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Booking activity</CardTitle>
                  <p className="mt-1 text-sm text-stone-500">Appointments per day, last 14 days</p>
                </div>
                <span className="rounded-full bg-navy-50 px-3 py-1 text-xs font-medium text-navy-700">
                  Live data
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                      <defs>
                        <linearGradient id="bookingsFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#2f455b" stopOpacity={0.28} />
                          <stop offset="100%" stopColor="#2f455b" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 11, fill: '#78716c' }}
                        tickLine={false}
                        axisLine={{ stroke: '#e7e5e4' }}
                        interval="preserveStartEnd"
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 11, fill: '#78716c' }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        cursor={{ stroke: '#c9a045', strokeWidth: 1 }}
                        contentStyle={{
                          borderRadius: '0.75rem',
                          border: '1px solid #e7e5e4',
                          fontSize: '0.8rem',
                          boxShadow: '0 12px 40px -12px rgba(0,0,0,0.12)',
                        }}
                        labelStyle={{ fontWeight: 600, color: '#1c1917' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="bookings"
                        stroke="#2f455b"
                        strokeWidth={2}
                        fill="url(#bookingsFill)"
                        activeDot={{ r: 4, fill: '#c9a045', stroke: '#fff', strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25, ease: [0.32, 0.72, 0, 1] }}
        >
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Upcoming appointments</CardTitle>
                <Link
                  to="/admin/appointments"
                  className="flex items-center gap-1 text-xs font-medium text-navy-700 transition-colors hover:text-navy-900"
                >
                  View all
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : nextAppointments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-stone-400">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <p className="mt-4 text-sm font-medium text-stone-900">No upcoming appointments</p>
                  <p className="mt-1 text-xs text-stone-500">New bookings will appear here.</p>
                </div>
              ) : (
                <div className="divide-y divide-stone-100">
                  {nextAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between py-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-50 text-navy-700">
                          <Users className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-stone-900">{appointment.full_name}</p>
                          <p className="text-sm text-stone-500">{appointment.service?.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-stone-900">
                          {format(parseISO(appointment.appointment_date), 'MMM do')}
                        </p>
                        <Badge variant={appointment.status as any} className="mt-1 capitalize">
                          {appointment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
