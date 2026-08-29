import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { BusinessSettings } from '@/types';

export const BUSINESS_SETTINGS_QUERY_KEY = ['business_settings'];

export function useBusinessSettings() {
  return useQuery<BusinessSettings | null>({
    queryKey: BUSINESS_SETTINGS_QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_settings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return (data as BusinessSettings | null) ?? null;
    },
  });
}

export function useBusinessSettingsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Partial<BusinessSettings>) => {
      const { data: existing } = await supabase
        .from('business_settings')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('business_settings')
          .update(settings)
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('business_settings').insert(settings);
        if (error) throw error;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: BUSINESS_SETTINGS_QUERY_KEY }),
  });
}
