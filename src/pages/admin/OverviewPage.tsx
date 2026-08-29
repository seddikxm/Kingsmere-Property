import { useMemo } from 'react';
import { Calendar, CheckCircle2, Clock, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppointments } from '@/hooks/useAppointments';
import { useServices } from '@/hooks/useServices';
import { format, isAfter, isFuture, parseISO } from 'date-fns';

export function OverviewPage() {
  const { data: appointments, isLoading: appointmentsLoading } = useAppointments();
  const { data: services, isLoading: servicesLoading } = useServices();

  const stats = useMemo(() => {
    if (!appointments || !services) return null;
    const now = new Date();
    const upcoming = appointments.filter((a) => isAfter(parseISO(a.appointment_date), now) && a.status !== 'cancelled');
    const pending = appointments.filter((a) => a.status === 'pending');
    const completed = appointments.filter((a) => a.status === 'completed');
    const activeServices = services.filter((s) => s.is_active).length;
    return { upcoming: upcoming.length, pending: pending.length, completed: completed.length, activeServices };
  }, [appointments, services]);

  const nextAppointments = useMemo(() => {
    if (!appointments) return [];
    return appointments
      .filter((a) => isFuture(parseISO(a.appointment_date)) && a.status !== 'cancelled')
      .slice(0, 5);
  }, [appointments]);

  const statCards = [
    { label: 'Upcoming appointments', value: stats?.upcoming ?? 0, icon: Calendar, color: 'text-navy-700 bg-navy-100' },
    { label: 'Pending requests', value: stats?.pending ?? 0, icon: Clock, color: 'text-gold-700 bg-gold-100' },
    { label: 'Completed', value: stats?.completed ?? 0, icon: CheckCircle2, color: 'text-emerald-700 bg-emerald-100' },
    { label: 'Active services', value: stats?.activeServices ?? 0, icon: TrendingUp, color: 'text-stone-700 bg-stone-100' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-stone-900">Overview</h1>
        <p className="mt-1 text-stone-600">Welcome back. Here is what is happening with your real estate appointments.</p>
      </div>

      {appointmentsLoading || servicesLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => (
            <Card key={card.label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-stone-500">{card.label}</p>
                    <p className="mt-2 text-3xl font-bold text-stone-900">{card.value}</p>
                  </div>
                  <div className={`rounded-xl p-3 ${card.color}`}>
                    <card.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Upcoming appointments</CardTitle>
        </CardHeader>
        <CardContent>
          {appointmentsLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : nextAppointments.length === 0 ? (
            <p className="text-sm text-stone-500">No upcoming appointments.</p>
          ) : (
            <div className="divide-y divide-stone-100">
              {nextAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-600">
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
    </div>
  );
}
