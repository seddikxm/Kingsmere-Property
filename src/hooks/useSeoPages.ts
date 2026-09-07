import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { SeoPage } from '@/types';

export const SEO_PAGES_QUERY_KEY = ['seo_pages'];

export function useSeoPages() {
  return useQuery<SeoPage[]>({
    queryKey: SEO_PAGES_QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase.from('seo_pages').select('*');
      if (error) throw error;
      return (data as SeoPage[] | null) ?? [];
    },
    retry: false,
  });
}

export function useSeoPage(slug: string) {
  const { data: pages } = useSeoPages();
  return pages?.find((p) => p.page_slug === slug) ?? null;
}

export function useSaveSeoPage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (page: Omit<SeoPage, 'updated_at'>) => {
      const { data: existing } = await supabase
        .from('seo_pages')
        .select('page_slug')
        .eq('page_slug', page.page_slug)
        .maybeSingle();

      const payload = { ...page, updated_at: new Date().toISOString() };
      const { error } = existing
        ? await supabase.from('seo_pages').update(payload).eq('page_slug', page.page_slug)
        : await supabase.from('seo_pages').insert(payload);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SEO_PAGES_QUERY_KEY }),
  });
}
