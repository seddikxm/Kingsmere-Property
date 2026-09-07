import { useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Activity, BarChart3, Calendar, CheckCircle2, PieChart as PieChartIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { StatCard } from '@/components/admin/StatCard';
import { useAppointments } from '@/hooks/useAppointments';
import {
  eachDayOfInterval,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  subDays,
} from 'date-fns';

const tooltipStyle = {
  borderRadius: '0.75rem',
  border: '1px solid #e7e5e4',
  fontSize: '0.8rem',
  boxShadow: '0 12px 40px -12px rgba(0,0,0,0.12)',
} as const;

const PIE_COLORS = ['#2f455b', '#c9a045', '#4a6c8a', '#a37e35', '#728eaa', '#d4b665', '#38546f'];

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export function AnalyticsPage() {
  const { data: appointments, isLoading } = useAppointments();

  const stats = useMemo(() => {
    if (!appointments) return null;
    const now = new Date();
    const thisMonth = appointments.filter((a) => isSameMonth(parseISO(a.appointment_date), now)).length;
    const completed = appointments.filter((a) => a.status === 'completed').length;
    const completionRate = appointments.length > 0 ? Math.round((completed / appointments.length) * 100) : 0;
    const weeks = Math.max(1, Math.ceil(eachDayOfInterval({ start: subDays(now, 89), end: now }).length / 7));
    const last90 = appointments.filter((a) => parseISO(a.appointment_date) >= subDays(now, 89)).length;
    return { total: appointments.length, thisMonth, completionRate, avgPerWeek: Math.round(last90 / weeks) };
  }, [appointments]);

  const trendData = useMemo(() => {
    if (!appointments) return [];
    return eachDayOfInterval({ start: subDays(new Date(), 29), end: new Date() }).map((day) => ({
      date: format(day, 'MMM d'),
      bookings: appointments.filter((a) => isSameDay(parseISO(a.appointment_date), day)).length,
    }));
  }, [appointments]);

  const serviceData = useMemo(() => {
    if (!appointments) return [];
    const counts = new Map<string, number>();
    appointments.forEach((a) => {
      const name = a.service?.name || 'Other';
      counts.set(name, (counts.get(name) || 0) + 1);
    });
    return [...counts.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [appointments]);

  const weekdayData = useMemo(() => {
    if (!appointments) return [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const counts = new Array(7).fill(0);
    appointments
      .filter((a) => parseISO(a.appointment_date) >= subDays(new Date(), 89))
      .forEach((a) => {
        counts[parseISO(a.appointment_date).getDay()] += 1;
      });
    return days.map((day, i) => ({ day, bookings: counts[i] }));
  }, [appointments]);

  const statusData = useMemo(() => {
    if (!appointments) return [];
    return (['pending', 'confirmed', 'completed', 'cancelled'] as const).map((status) => ({
      status: STATUS_LABELS[status],
      count: appointments.filter((a) => a.status === status).length,
    }));
  }, [appointments]);

  if (isLoading || !stats) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
      >
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-gold-600">Insights</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">Analytics</h1>
        <p className="mt-2 text-stone-600">Understand your appointment and service performance.</p>
      </motion.div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total appointments" value={stats.total} hint="All time" icon={Calendar} accent="navy" index={0} />
        <StatCard label="This month" value={stats.thisMonth} hint={format(new Date(), 'MMMM')} icon={BarChart3} accent="gold" index={1} />
        <StatCard label="Completion rate" value={`${stats.completionRate}%`} hint="Completed bookings" icon={CheckCircle2} accent="emerald" index={2} />
        <StatCard label="Avg per week" value={stats.avgPerWeek} hint="Last 90 days" icon={Activity} accent="stone" index={3} />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <motion.div
          className="lg:col-span-3"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.32, 0.72, 0, 1] }}
        >
          <Card>
            <CardHeader>
              <CardTitle>30-day booking trend</CardTitle>
              <p className="mt-1 text-sm text-stone-500">Appointments per day</p>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                    <defs>
                      <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#c9a045" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#c9a045" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#78716c' }} tickLine={false} axisLine={{ stroke: '#e7e5e4' }} interval={4} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#78716c' }} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{ stroke: '#2f455b', strokeWidth: 1 }} contentStyle={tooltipStyle} labelStyle={{ fontWeight: 600, color: '#1c1917' }} />
                    <Area type="monotone" dataKey="bookings" stroke="#c9a045" strokeWidth={2} fill="url(#trendFill)" activeDot={{ r: 4, fill: '#2f455b', stroke: '#fff', strokeWidth: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
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
              <CardTitle>By service</CardTitle>
              <p className="mt-1 text-sm text-stone-500">Appointment share per service</p>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={serviceData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={3} strokeWidth={0}>
                      {serviceData.map((_, index) => (
                        <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-2">
                {serviceData.map((entry, index) => (
                  <span key={entry.name} className="flex items-center gap-1.5 text-xs text-stone-600">
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                    {entry.name}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35, ease: [0.32, 0.72, 0, 1] }}
        >
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-navy-700" />
                <CardTitle>Bookings by weekday</CardTitle>
              </div>
              <p className="mt-1 text-sm text-stone-500">Last 90 days</p>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weekdayData} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#78716c' }} tickLine={false} axisLine={{ stroke: '#e7e5e4' }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#78716c' }} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{ fill: 'rgba(47,69,91,0.06)' }} contentStyle={tooltipStyle} labelStyle={{ fontWeight: 600, color: '#1c1917' }} />
                    <Bar dataKey="bookings" fill="#2f455b" radius={[6, 6, 0, 0]} maxBarSize={36} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45, ease: [0.32, 0.72, 0, 1] }}
        >
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <PieChartIcon className="h-4 w-4 text-navy-700" />
                <CardTitle>Appointment pipeline</CardTitle>
              </div>
              <p className="mt-1 text-sm text-stone-500">Current status distribution</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {statusData.map((row) => {
                  const pct = stats.total > 0 ? Math.round((row.count / stats.total) * 100) : 0;
                  return (
                    <div key={row.status}>
                      <div className="mb-1.5 flex items-center justify-between text-sm">
                        <span className="font-medium text-stone-700">{row.status}</span>
                        <span className="text-stone-500">
                          {row.count} · {pct}%
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-stone-100">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, delay: 0.5, ease: [0.32, 0.72, 0, 1] }}
                          className="h-full rounded-full bg-gradient-to-r from-navy-700 to-navy-500"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
