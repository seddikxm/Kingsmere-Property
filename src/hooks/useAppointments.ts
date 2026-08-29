import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Appointment, AppointmentStatus } from '@/types';

export const APPOINTMENTS_QUERY_KEY = ['appointments'];

export function useAppointments() {
  return useQuery<Appointment[]>({
    queryKey: APPOINTMENTS_QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select('*, service:services(*)')
        .order('appointment_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;
      return (data as unknown as Appointment[]) ?? [];
    },
  });
}

export function useBookAppointment() {
  return useMutation({
    mutationFn: async (appointment: Omit<Appointment, 'id' | 'status' | 'created_at'>) => {
      const { error } = await supabase.from('appointments').insert({
        ...appointment,
        status: 'pending',
      });
      if (error) throw error;
    },
  });
}

export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: AppointmentStatus }) => {
      const { error } = await supabase.from('appointments').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: APPOINTMENTS_QUERY_KEY }),
  });
}
