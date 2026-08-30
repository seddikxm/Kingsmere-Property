import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { DEMO_LISTINGS } from '@/data/demo-listings';
import type { Listing } from '@/types';

export const LISTING_QUERY_KEY = ['listings'];

function mergeWithDemoData(serverListings: Listing[] | null): Listing[] {
  if (serverListings && serverListings.length > 0) return serverListings;
  return DEMO_LISTINGS;
}

export function useListing(id?: string | null) {
  return useQuery<Listing | null>({
    queryKey: [...LISTING_QUERY_KEY, id || 'latest'],
    queryFn: async () => {
      let data: Listing | null = null;
      let error: Error | null = null;

      if (id) {
        const result = await supabase
          .from('listings')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        data = (result.data as unknown as Listing | null) ?? null;
        error = result.error ? new Error(result.error.message) : null;
      } else {
        const result = await supabase
          .from('listings')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        data = (result.data as unknown as Listing | null) ?? null;
        error = result.error ? new Error(result.error.message) : null;
      }

      // If a specific demo listing is requested, return it from local data
      if (id && id.startsWith('demo-')) {
        return DEMO_LISTINGS.find((l) => l.id === id) ?? null;
      }

      // If server has data, prefer it; otherwise fall back to most recent demo
      if (data) return data;
      if (error) {
        console.warn('Supabase listing fetch failed, using demo fallback:', error.message);
      }
      return DEMO_LISTINGS[0];
    },
  });
}

export function useListings() {
  return useQuery<Listing[]>({
    queryKey: LISTING_QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false });

      const serverListings = (data as unknown as Listing[]) ?? [];

      if (error) {
        console.warn('Supabase listings fetch failed, using demo fallback:', error.message);
      }

      return mergeWithDemoData(serverListings.length > 0 ? serverListings : null);
    },
  });
}

export function useCreateListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listing: Omit<Listing, 'id' | 'created_at' | 'updated_at'>) => {
      const { error } = await supabase.from('listings').insert(listing);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: LISTING_QUERY_KEY }),
  });
}

export function useUpdateListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listing: Partial<Listing> & { id: string }) => {
      const { id, ...rest } = listing;
      const { error } = await supabase.from('listings').update(rest).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: LISTING_QUERY_KEY }),
  });
}
