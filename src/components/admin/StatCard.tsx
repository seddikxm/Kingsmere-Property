import { motion } from 'motion/react';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  accent?: 'navy' | 'gold' | 'emerald' | 'stone';
  index?: number;
}

const accents = {
  navy: 'bg-navy-50 text-navy-700',
  gold: 'bg-gold-100 text-gold-700',
  emerald: 'bg-emerald-50 text-emerald-700',
  stone: 'bg-stone-100 text-stone-600',
};

export function StatCard({ label, value, hint, icon: Icon, accent = 'navy', index = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.32, 0.72, 0, 1] }}
    >
      <Card className="transition-shadow duration-300 hover:shadow-lift">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-stone-500">{label}</p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-stone-900">{value}</p>
              {hint ? <p className="mt-1 text-xs text-stone-400">{hint}</p> : null}
            </div>
            <div className={`rounded-xl p-3 ${accents[accent]}`}>
              <Icon className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
