import { useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  Copy,
  Folder,
  ImageIcon,
  Link2,
  Search,
  Trash2,
  Upload,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import { MEDIA_FOLDERS, useMedia, useMediaDelete, useMediaUpload, type MediaFile } from '@/hooks/useMedia';

function formatSize(size: number | null) {
  if (size == null) return '';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(0)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function MediaManagerPage() {
  const [folder, setFolder] = useState('general');
  const [search, setSearch] = useState('');
  const [dragging, setDragging] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MediaFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const { data: files, isLoading } = useMedia(folder);
  const upload = useMediaUpload();
  const deleteMedia = useMediaDelete();

  const filtered = (files ?? []).filter((f) =>
    f.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList?.length) return;
    let failed = 0;
    for (const file of Array.from(fileList)) {
      try {
        await upload.mutateAsync({ folder, file });
      } catch {
        failed++;
      }
    }
    if (failed === 0) toast(`Uploaded ${fileList.length} image${fileList.length > 1 ? 's' : ''}`);
    else toast(`${failed} upload${failed > 1 ? 's' : ''} failed`, 'error');
  };

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast('Image URL copied');
    } catch {
      toast('Could not copy URL', 'error');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMedia.mutateAsync({ folder: deleteTarget.folder, name: deleteTarget.name });
      toast('Image deleted');
    } catch {
      toast('Delete failed', 'error');
    }
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
      >
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-gold-600">Content</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">Media Manager</h1>
        <p className="mt-2 text-stone-600">
          Upload, organize, and reuse images across the website.
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <Card className="h-fit">
          <CardContent className="space-y-1 p-3">
            <p className="mb-2 px-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-stone-400">
              Folders
            </p>
            {MEDIA_FOLDERS.map((f) => (
              <button
                key={f.value}
                onClick={() => {
                  setFolder(f.value);
                  setSearch('');
                }}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-300 ${
                  folder === f.value
                    ? 'bg-navy-800 text-white shadow-soft'
                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                <Folder className={`h-4 w-4 ${folder === f.value ? 'text-gold-400' : 'text-stone-400'}`} />
                {f.label}
              </button>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <Input
                placeholder="Search images..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Upload className="mr-2 h-4 w-4" />
              Upload images
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                handleFiles(e.target.files);
                e.target.value = '';
              }}
            />
          </div>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              handleFiles(e.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`flex cursor-pointer items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-8 transition-all duration-300 ${
              dragging ? 'border-gold-500 bg-gold-50' : 'border-stone-300 bg-white hover:border-stone-400'
            }`}
          >
            <Upload className={`h-5 w-5 ${dragging ? 'text-gold-600' : 'text-stone-400'}`} />
            <p className="text-sm text-stone-600">
              <span className="font-semibold text-stone-800">Drag & drop</span> images into the{' '}
              <span className="font-medium text-navy-800">
                {MEDIA_FOLDERS.find((f) => f.value === folder)?.label}
              </span>{' '}
              folder, or click to browse
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-52 w-full rounded-2xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center py-14 text-center">
                <ImageIcon className="h-10 w-10 text-stone-300" />
                <p className="mt-4 font-semibold text-stone-900">
                  {search ? 'No images match your search' : 'This folder is empty'}
                </p>
                <p className="mt-1 text-sm text-stone-500">
                  {search ? 'Try a different search term.' : 'Upload your first image above.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {filtered.map((file, i) => (
                <motion.div
                  key={file.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.3) }}
                  className="group overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-soft"
                >
                  <div className="relative aspect-square overflow-hidden bg-stone-100">
                    <img
                      src={file.url}
                      alt={file.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 flex items-center justify-center gap-2 bg-navy-950/70 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
                      <button
                        onClick={() => copyUrl(file.url)}
                        title="Copy URL"
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-gold-500"
                      >
                        <Link2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(file)}
                        title="Delete"
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2 px-3 py-2.5">
                    <p className="truncate text-xs font-medium text-stone-700">{file.name}</p>
                    <span className="flex shrink-0 items-center gap-1 text-[10px] uppercase tracking-wide text-stone-400">
                      <Copy className="h-3 w-3" />
                      {formatSize(file.size)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete this image?"
        description={`“${deleteTarget?.name}” will be permanently removed from storage. Pages using it will show a broken image.`}
      >
        {deleteTarget && (
          <img
            src={deleteTarget.url}
            alt={deleteTarget.name}
            className="mb-5 h-40 w-full rounded-xl object-cover"
          />
        )}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            disabled={deleteMedia.isPending}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {deleteMedia.isPending ? 'Deleting…' : 'Delete image'}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
