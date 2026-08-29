import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { BusinessLogo } from '@/types';

export const BUSINESS_LOGO_QUERY_KEY = ['business_logo'];

export function useBusinessLogo() {
  return useQuery<BusinessLogo | null>({
    queryKey: BUSINESS_LOGO_QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_logos')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return (data as BusinessLogo | null) ?? null;
    },
  });
}

export function useUploadBusinessLogo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'png';
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const filePath = `public/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('business-logos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('business-logos').getPublicUrl(filePath);
      const logoUrl = urlData.publicUrl;

      const { data: existing } = await supabase
        .from('business_logos')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase.from('business_logos').update({ logo_url: logoUrl }).eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('business_logos').insert({ logo_url: logoUrl });
        if (error) throw error;
      }

      return logoUrl;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: BUSINESS_LOGO_QUERY_KEY }),
  });
}

export function useRemoveBusinessLogo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data: existing } = await supabase
        .from('business_logos')
        .select('id, logo_url')
        .limit(1)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase.from('business_logos').delete().eq('id', existing.id);
        if (error) throw error;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: BUSINESS_LOGO_QUERY_KEY }),
  });
}
