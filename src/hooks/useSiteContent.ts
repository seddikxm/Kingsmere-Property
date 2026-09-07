import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { SiteContentEntry } from '@/types';

export const SITE_CONTENT_QUERY_KEY = ['site_content'];

export function useSiteContent() {
  return useQuery<Record<string, Record<string, unknown>>>({
    queryKey: SITE_CONTENT_QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase.from('site_content').select('*');
      if (error) throw error;
      const map: Record<string, Record<string, unknown>> = {};
      ((data as SiteContentEntry[] | null) ?? []).forEach((row) => {
        map[row.key] = row.value ?? {};
      });
      return map;
    },
    retry: false,
  });
}

export function useSiteContentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: Record<string, unknown> }) => {
      const { data: existing } = await supabase
        .from('site_content')
        .select('key')
        .eq('key', key)
        .maybeSingle();

      const payload = { key, value, updated_at: new Date().toISOString() };
      const { error } = existing
        ? await supabase.from('site_content').update(payload).eq('key', key)
        : await supabase.from('site_content').insert(payload);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SITE_CONTENT_QUERY_KEY }),
  });
}
