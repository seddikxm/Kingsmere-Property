import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export const MEDIA_QUERY_KEY = ['media'];

export const MEDIA_FOLDERS = [
  { value: 'general', label: 'General' },
  { value: 'hero', label: 'Hero' },
  { value: 'about', label: 'About' },
  { value: 'listings', label: 'Listings' },
  { value: 'agents', label: 'Agents' },
] as const;

export type MediaFile = {
  name: string;
  folder: string;
  url: string;
  size: number | null;
  createdAt: string | null;
};

function toPublicUrl(path: string) {
  const { data } = supabase.storage.from('media').getPublicUrl(path);
  return data.publicUrl;
}

export function useMedia(folder: string) {
  return useQuery<MediaFile[]>({
    queryKey: [...MEDIA_QUERY_KEY, folder],
    queryFn: async () => {
      const { data, error } = await supabase.storage.from('media').list(folder, {
        limit: 500,
        sortBy: { column: 'created_at', order: 'desc' },
      });
      if (error) throw error;
      return (data ?? [])
        .filter((f) => f.name !== '.emptyFolderPlaceholder')
        .map((f) => ({
          name: f.name,
          folder,
          url: toPublicUrl(folder ? `${folder}/${f.name}` : f.name),
          size: f.metadata?.size ?? null,
          createdAt: f.created_at ?? null,
        }));
    },
    retry: false,
  });
}

export function useMediaUpload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ folder, file }: { folder: string; file: File }) => {
      const base = file.name.replace(/[^a-zA-Z0-9._-]/g, '-').toLowerCase();
      const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${base}`;
      const path = folder ? `${folder}/${unique}` : unique;
      const { error } = await supabase.storage.from('media').upload(path, file, {
        cacheControl: '31536000',
        upsert: false,
      });
      if (error) throw error;
      return toPublicUrl(path);
    },
    onSuccess: (_url, { folder }) => {
      queryClient.invalidateQueries({ queryKey: [...MEDIA_QUERY_KEY, folder] });
    },
  });
}

export function useMediaDelete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ folder, name }: { folder: string; name: string }) => {
      const path = folder ? `${folder}/${name}` : name;
      const { error } = await supabase.storage.from('media').remove([path]);
      if (error) throw error;
    },
    onSuccess: (_data, { folder }) => {
      queryClient.invalidateQueries({ queryKey: [...MEDIA_QUERY_KEY, folder] });
    },
  });
}
