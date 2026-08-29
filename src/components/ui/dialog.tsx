import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

function Dialog({ open, onClose, title, description, children, className }: DialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-stone-950/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={cn(
          'relative z-10 w-full max-w-lg rounded-2xl border border-stone-200 bg-white p-6 shadow-lift animate-fade-in',
          className
        )}
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
        >
          <X className="h-5 w-5" />
        </button>
        {title && <h2 className="text-xl font-semibold tracking-tight text-stone-900">{title}</h2>}
        {description && <p className="mt-1 text-sm text-stone-500">{description}</p>}
        <div className={cn((title || description) && 'mt-6')}>{children}</div>
      </div>
    </div>
  );
}

export { Dialog };
