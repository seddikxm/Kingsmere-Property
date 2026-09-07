import { useRef, useState } from 'react';
import { Check, ImageIcon, Upload } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import { MEDIA_FOLDERS, useMedia, useMediaUpload } from '@/hooks/useMedia';

type MediaPickerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (url: string) => void;
};

export function MediaPickerDialog({ open, onOpenChange, onSelect }: MediaPickerDialogProps) {
  const [tab, setTab] = useState<'library' | 'upload'>('library');
  const [folder, setFolder] = useState<string>('general');
  const [selected, setSelected] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const { data: files, isLoading } = useMedia(folder);
  const upload = useMediaUpload();

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList?.length) return;
    for (const file of Array.from(fileList)) {
      try {
        await upload.mutateAsync({ folder, file });
        toast(`Uploaded ${file.name}`);
      } catch {
        toast(`Upload failed: ${file.name}`, 'error');
      }
    }
  };

  const confirmSelection = () => {
    if (!selected) return;
    onSelect(selected);
    onOpenChange(false);
    setSelected(null);
  };

  return (
    <Dialog
      open={open}
      onClose={() => onOpenChange(false)}
      title="Choose an image"
      description="Pick from the media library or upload a new file."
      className="max-w-3xl"
    >
      <div className="mb-5 flex items-center gap-1 rounded-full border border-stone-200 bg-stone-50 p-1">
        {(['library', 'upload'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-all duration-300 ${
              tab === t ? 'bg-navy-800 text-white shadow-soft' : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'library' ? (
        <div className="space-y-4">
          <Select value={folder} onChange={(e) => { setFolder(e.target.value); setSelected(null); }}>
            {MEDIA_FOLDERS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </Select>

          {isLoading ? (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="aspect-square w-full rounded-xl" />
              ))}
            </div>
          ) : !files?.length ? (
            <div className="flex flex-col items-center rounded-xl border border-dashed border-stone-300 py-12 text-center">
              <ImageIcon className="h-8 w-8 text-stone-300" />
              <p className="mt-3 text-sm font-medium text-stone-700">This folder is empty</p>
              <p className="mt-1 text-xs text-stone-500">Switch to the Upload tab to add images.</p>
            </div>
          ) : (
            <div className="grid max-h-[46vh] grid-cols-3 gap-3 overflow-y-auto pr-1 sm:grid-cols-4">
              {files.map((file) => (
                <button
                  key={file.name}
                  type="button"
                  onClick={() => setSelected(file.url)}
                  className={`group relative aspect-square overflow-hidden rounded-xl border-2 transition-all duration-300 ${
                    selected === file.url
                      ? 'border-gold-500 shadow-glow'
                      : 'border-transparent hover:border-stone-300'
                  }`}
                >
                  <img src={file.url} alt={file.name} className="h-full w-full object-cover" />
                  {selected === file.url && (
                    <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-gold-500 text-white">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={confirmSelection} disabled={!selected} className="gold">
              Use selected image
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
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
            className={`flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed px-6 py-14 text-center transition-all duration-300 ${
              dragging ? 'border-gold-500 bg-gold-50' : 'border-stone-300 bg-stone-50 hover:border-stone-400'
            }`}
          >
            <Upload className={`h-9 w-9 ${dragging ? 'text-gold-600' : 'text-stone-400'}`} />
            <p className="mt-3 text-sm font-semibold text-stone-800">
              Drag & drop images here, or click to browse
            </p>
            <p className="mt-1 text-xs text-stone-500">
              Uploads go to the “{MEDIA_FOLDERS.find((f) => f.value === folder)?.label}” folder
            </p>
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

          <div className="flex items-center justify-between gap-3">
            <Select value={folder} onChange={(e) => setFolder(e.target.value)}>
              {MEDIA_FOLDERS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </Select>
            <Button variant="outline" onClick={() => setTab('library')}>
              Back to library
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  );
}
