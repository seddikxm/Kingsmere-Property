import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { CalendarX2, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useBlockedDates, useBlockedDateMutation } from '@/hooks/useBlockedDates';

export function BlockedDatesPage() {
  const { data: blockedDates, isLoading } = useBlockedDates();
  const { create, remove } = useBlockedDateMutation();
  const [date, setDate] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;
    await create.mutateAsync({ blocked_date: date, reason: reason || null });
    setDate('');
    setReason('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-stone-900">Blocked dates</h1>
        <p className="mt-1 text-stone-600">Prevent bookings on holidays, vacations, or unavailable days.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Block a date</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="blocked_date">Date</Label>
                <Input id="blocked_date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Reason <span className="text-stone-400">(optional)</span></Label>
                <Textarea id="reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Holiday, out of office, etc." />
              </div>
              <Button type="submit" className="w-full" disabled={create.isPending}>
                Block date
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Blocked dates</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
              </div>
            ) : blockedDates?.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-10 text-center text-stone-500">
                No blocked dates yet.
              </div>
            ) : (
              <div className="space-y-3">
                {blockedDates?.map((blocked) => (
                  <div
                    key={blocked.id}
                    className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-700">
                        <CalendarX2 className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-stone-900">
                          {format(parseISO(blocked.blocked_date), 'EEEE, MMMM do, yyyy')}
                        </p>
                        {blocked.reason && <p className="text-xs text-stone-500">{blocked.reason}</p>}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => remove.mutate(blocked.id)}
                      disabled={remove.isPending}
                      className="text-stone-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
