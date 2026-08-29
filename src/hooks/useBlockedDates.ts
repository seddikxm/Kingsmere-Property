import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { BlockedDate } from '@/types';

export const BLOCKED_DATES_QUERY_KEY = ['blocked_dates'];

export function useBlockedDates() {
  return useQuery<BlockedDate[]>({
    queryKey: BLOCKED_DATES_QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blocked_dates')
        .select('*')
        .order('blocked_date', { ascending: true });
      if (error) throw error;
      return (data as BlockedDate[]) ?? [];
    },
  });
}

export function useBlockedDateMutation() {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: async (blockedDate: Omit<BlockedDate, 'id' | 'created_at'>) => {
      const { error } = await supabase.from('blocked_dates').insert(blockedDate);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: BLOCKED_DATES_QUERY_KEY }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('blocked_dates').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: BLOCKED_DATES_QUERY_KEY }),
  });

  return { create, remove };
}
