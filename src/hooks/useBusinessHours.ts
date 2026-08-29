import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { BusinessHours } from '@/types';

export const BUSINESS_HOURS_QUERY_KEY = ['business_hours'];

export function useBusinessHours() {
  return useQuery<BusinessHours[]>({
    queryKey: BUSINESS_HOURS_QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase.from('business_hours').select('*').order('weekday', { ascending: true });
      if (error) throw error;
      return (data as BusinessHours[]) ?? [];
    },
  });
}

export function useUpdateBusinessHours() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (hours: Partial<BusinessHours> & { id: string }) => {
      const { id, ...rest } = hours;
      const { error } = await supabase.from('business_hours').update(rest).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: BUSINESS_HOURS_QUERY_KEY }),
  });
}
