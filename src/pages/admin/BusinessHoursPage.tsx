import { useState } from 'react';
import { Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useBusinessHours, useUpdateBusinessHours } from '@/hooks/useBusinessHours';
import { WEEKDAYS } from '@/lib/utils';
import type { BusinessHours } from '@/types';

export function BusinessHoursPage() {
  const { data: hours, isLoading } = useBusinessHours();
  const update = useUpdateBusinessHours();
  const [draft, setDraft] = useState<Record<string, Partial<BusinessHours>>>({});

  const hasChanges = Object.keys(draft).length > 0;

  const updateDraft = (id: string, changes: Partial<BusinessHours>) => {
    setDraft((prev) => ({ ...prev, [id]: { ...prev[id], ...changes } }));
  };

  const handleSave = async () => {
    for (const [id, changes] of Object.entries(draft)) {
      await update.mutateAsync({ id, ...changes });
    }
    setDraft({});
  };

  const displayHours = (id: string) => {
    const original = hours?.find((h) => h.id === id);
    return { ...original, ...draft[id] };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-stone-900">Business hours</h1>
          <p className="mt-1 text-stone-600">Set the days and hours available for booking.</p>
        </div>
        <Button onClick={handleSave} disabled={!hasChanges || update.isPending}>
          {update.isPending ? 'Saving...' : 'Save changes'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Weekly schedule</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(7)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
            </div>
          ) : (
            <div className="space-y-4">
              {hours?.map((hour) => {
                const display = displayHours(hour.id);
                const day = WEEKDAYS.find((d) => d.value === hour.weekday);
                return (
                  <div
                    key={hour.id}
                    className="flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-50 text-navy-700">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-stone-900">{day?.label}</p>
                        <p className="text-xs text-stone-500">
                          {display.is_open ? 'Open' : 'Closed'}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={display.is_open}
                          onChange={(e) => updateDraft(hour.id, { is_open: e.target.checked })}
                          className="h-4 w-4 rounded border-stone-300 text-navy-700 focus:ring-navy-700"
                        />
                        <span className="text-sm text-stone-700">Open</span>
                      </label>
                      <div className="flex items-center gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Start</Label>
                          <Input
                            type="time"
                            value={display.start_time?.slice(0, 5)}
                            onChange={(e) => updateDraft(hour.id, { start_time: `${e.target.value}:00` })}
                            disabled={!display.is_open}
                            className="h-9 w-32"
                          />
                        </div>
                        <span className="pt-5 text-stone-400">—</span>
                        <div className="space-y-1">
                          <Label className="text-xs">End</Label>
                          <Input
                            type="time"
                            value={display.end_time?.slice(0, 5)}
                            onChange={(e) => updateDraft(hour.id, { end_time: `${e.target.value}:00` })}
                            disabled={!display.is_open}
                            className="h-9 w-32"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
