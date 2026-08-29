import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  side?: 'left' | 'right';
}

function Sheet({ open, onClose, title, description, children, side = 'right' }: SheetProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="absolute inset-0 bg-stone-950/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={cn(
          'relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-lift animate-slide-up',
          side === 'right' && 'ml-auto',
          side === 'left' && 'mr-auto'
        )}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4">
          <div>
            {title && <h2 className="text-lg font-semibold tracking-tight text-stone-900">{title}</h2>}
            {description && <p className="text-sm text-stone-500">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}

export { Sheet };
