import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-navy-700 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-navy-800 text-white hover:bg-navy-900',
        secondary: 'border-transparent bg-stone-100 text-stone-700 hover:bg-stone-200',
        outline: 'border-stone-300 text-stone-700',
        pending: 'border-transparent bg-gold-100 text-gold-800',
        confirmed: 'border-transparent bg-emerald-100 text-emerald-800',
        cancelled: 'border-transparent bg-red-100 text-red-800',
        completed: 'border-transparent bg-navy-100 text-navy-800',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
