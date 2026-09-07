import { useState } from 'react';
import { ArrowDown, ArrowUp, ImageIcon, ImagePlus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MediaPickerDialog } from '@/components/admin/MediaPickerDialog';

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold uppercase tracking-wider text-stone-500">{label}</Label>
      {children}
      {hint && <p className="text-xs text-stone-400">{hint}</p>}
    </div>
  );
}

export function ImageField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold uppercase tracking-wider text-stone-500">{label}</Label>
      <div className="flex items-center gap-3">
        <div className="flex h-20 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-stone-200 bg-stone-50">
          {value ? (
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImageIcon className="h-6 w-6 text-stone-300" />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-navy-800 px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-navy-900"
          >
            <ImagePlus className="h-3.5 w-3.5" />
            Choose image
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="inline-flex items-center gap-1.5 self-start text-xs text-stone-400 transition-colors hover:text-red-600"
            >
              <X className="h-3 w-3" />
              Remove
            </button>
          )}
        </div>
      </div>
      <MediaPickerDialog open={open} onOpenChange={setOpen} onSelect={onChange} />
    </div>
  );
}

export function ReorderButtons({
  index,
  total,
  onMove,
}: {
  index: number;
  total: number;
  onMove: (from: number, to: number) => void;
}) {
  return (
    <div className="flex shrink-0 flex-col gap-1">
      <button
        type="button"
        disabled={index === 0}
        onClick={() => onMove(index, index - 1)}
        title="Move up"
        className="flex h-7 w-7 items-center justify-center rounded-lg border border-stone-200 text-stone-500 transition-colors hover:border-navy-700 hover:text-navy-800 disabled:opacity-30"
      >
        <ArrowUp className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        disabled={index === total - 1}
        onClick={() => onMove(index, index + 1)}
        title="Move down"
        className="flex h-7 w-7 items-center justify-center rounded-lg border border-stone-200 text-stone-500 transition-colors hover:border-navy-700 hover:text-navy-800 disabled:opacity-30"
      >
        <ArrowDown className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function NumberInput({
  value,
  onChange,
  min,
  max,
  step,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <Input
      type="number"
      value={Number.isNaN(value) ? '' : value}
      min={min}
      max={max}
      step={step}
      onChange={(e) => onChange(parseFloat(e.target.value))}
    />
  );
}
