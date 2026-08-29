import { useQuery } from '@tanstack/react-query';
import { format, addDays } from 'date-fns';
import { supabase } from '@/lib/supabase';
import type { Appointment } from '@/types';

export const PUBLIC_APPOINTMENTS_QUERY_KEY = ['public_appointments'];

export function usePublicAppointments(centerDate?: Date) {
  return useQuery<Pick<Appointment, 'appointment_date' | 'start_time' | 'end_time' | 'status'>[]>({
    queryKey: [...PUBLIC_APPOINTMENTS_QUERY_KEY, centerDate?.toISOString()],
    queryFn: async () => {
      const start = centerDate ? addDays(centerDate, -7) : new Date();
      const end = centerDate ? addDays(centerDate, 14) : addDays(start, 21);

      const { data, error } = await supabase.rpc('get_appointments_for_date_range', {
        start_date: format(start, 'yyyy-MM-dd'),
        end_date: format(end, 'yyyy-MM-dd'),
      });

      if (error) {
        console.error('Availability RPC error:', error.message);
        throw error;
      }

      return (data as Pick<Appointment, 'appointment_date' | 'start_time' | 'end_time' | 'status'>[]) ?? [];
    },
    enabled: !!centerDate,
  });
}
