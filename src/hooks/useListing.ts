import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Listing } from '@/types';

export const LISTING_QUERY_KEY = ['listings'];

export function useListing(id?: string | null) {
  return useQuery<Listing | null>({
    queryKey: [...LISTING_QUERY_KEY, id || 'latest'],
    queryFn: async () => {
      if (id) {
        const { data, error } = await supabase
          .from('listings')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        if (error) throw error;
        return (data as unknown as Listing | null) ?? null;
      }
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return (data as unknown as Listing | null) ?? null;
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

      if (error) throw error;
      return (data as unknown as Listing[]) ?? [];
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
