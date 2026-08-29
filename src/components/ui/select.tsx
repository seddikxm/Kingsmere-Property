import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className, label, children, ...props }, ref) => (
  <div className="w-full">
    {label && <label className="mb-2 block text-sm font-medium text-stone-700">{label}</label>}
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          'flex h-11 w-full appearance-none rounded-lg border border-stone-300 bg-white px-4 py-2 pr-10 text-sm text-stone-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-700 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
    </div>
  </div>
));
Select.displayName = 'Select';

export { Select };
