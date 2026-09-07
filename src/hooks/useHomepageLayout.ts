import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { HomepageSection } from '@/types';

export const HOMEPAGE_LAYOUT_QUERY_KEY = ['homepage_sections'];

export function useHomepageLayout() {
  return useQuery<HomepageSection[]>({
    queryKey: HOMEPAGE_LAYOUT_QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('homepage_sections')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return (data as HomepageSection[] | null) ?? [];
    },
    retry: false,
  });
}

export function useSaveHomepageLayout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sections: HomepageSection[]) => {
      const { error } = await supabase.from('homepage_sections').upsert(
        sections.map((s) => ({ ...s, sort_order: s.sort_order })),
        { onConflict: 'section_key' },
      );
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: HOMEPAGE_LAYOUT_QUERY_KEY }),
  });
}
