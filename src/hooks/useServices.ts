import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Service } from '@/types';

export const SERVICES_QUERY_KEY = ['services'];

export function useServices(activeOnly = false) {
  return useQuery<Service[]>({
    queryKey: activeOnly ? [...SERVICES_QUERY_KEY, 'active'] : SERVICES_QUERY_KEY,
    queryFn: async () => {
      let query = supabase.from('services').select('*').order('created_at', { ascending: true });
      if (activeOnly) query = query.eq('is_active', true);
      const { data, error } = await query;
      if (error) throw error;
      return (data as Service[]) ?? [];
    },
  });
}

export function useServiceMutation() {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: async (service: Omit<Service, 'id' | 'created_at'>) => {
      const { error } = await supabase.from('services').insert(service);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SERVICES_QUERY_KEY }),
  });

  const update = useMutation({
    mutationFn: async ({ id, ...service }: Partial<Service> & { id: string }) => {
      const { error } = await supabase.from('services').update(service).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SERVICES_QUERY_KEY }),
  });

  return { create, update };
}

export function useImageUpload(folder: string) {
  return useMutation({
    mutationFn: async (file: File) => {
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const filePath = `${folder}/${folder}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('business-logos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('business-logos').getPublicUrl(filePath);
      return urlData.publicUrl;
    },
  });
}

export function useUploadServiceImage() {
  return useImageUpload('services');
}
