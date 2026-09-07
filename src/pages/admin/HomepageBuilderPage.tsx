import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Eye, EyeOff, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import { ReorderButtons } from '@/components/admin/ContentFields';
import { useHomepageLayout, useSaveHomepageLayout } from '@/hooks/useHomepageLayout';
import {
  DEFAULT_HOMEPAGE_LAYOUT,
  SECTION_DEFINITIONS,
  type HomepageSectionKey,
} from '@/lib/homepage-sections';
import type { HomepageSection } from '@/types';

export function HomepageBuilderPage() {
  const { data: savedLayout, isLoading } = useHomepageLayout();
  const saveLayout = useSaveHomepageLayout();
  const { toast } = useToast();

  const baseLayout =
    savedLayout && savedLayout.length > 0 ? savedLayout : DEFAULT_HOMEPAGE_LAYOUT;
  const [rows, setRows] = useState<HomepageSection[]>(baseLayout);
  const [snapshot, setSnapshot] = useState<HomepageSection[]>(baseLayout);

  // Sync local state once the query resolves (rows may start from defaults).
  useEffect(() => {
    if (savedLayout && savedLayout.length > 0) {
      setRows(savedLayout);
      setSnapshot(savedLayout);
    }
  }, [savedLayout]);

  const dirty = JSON.stringify(rows) !== JSON.stringify(snapshot);

  const move = (from: number, to: number) => {
    if (to < 0 || to >= rows.length) return;
    const next = rows.map((row, i) => ({ ...row, sort_order: i }));
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setRows(next.map((row, i) => ({ ...row, sort_order: i })));
  };

  const toggle = (key: string) =>
    setRows((prev) =>
      prev.map((row) =>
        row.section_key === key ? { ...row, enabled: !row.enabled } : row,
      ),
    );

  const handleSave = async () => {
    try {
      await saveLayout.mutateAsync(rows);
      setSnapshot(rows);
      toast('Homepage layout saved — live on the website');
    } catch {
      toast('Save failed. Did you run supabase/migrations/0001_cms.sql?', 'error');
    }
  };

  const descriptionFor = (key: string) =>
    SECTION_DEFINITIONS.find((d) => d.key === key)?.description ?? key;

  const labelFor = (key: string) =>
    SECTION_DEFINITIONS.find((d) => d.key === key)?.label ?? key;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
      >
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-gold-600">Content</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
          Homepage Builder
        </h1>
        <p className="mt-2 text-stone-600">
          Choose which sections appear on the homepage and in what order.
        </p>
      </motion.div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="divide-y divide-stone-100 p-4">
            {rows.map((row, index) => (
              <motion.div
                key={row.section_key}
                layout
                className={`flex items-center gap-4 py-4 ${index === 0 ? 'pt-2' : ''}`}
              >
                <ReorderButtons index={index} total={rows.length} onMove={move} />
                <div className="min-w-0 flex-1">
                  <p
                    className={`font-semibold ${
                      row.enabled ? 'text-stone-900' : 'text-stone-400 line-through'
                    }`}
                  >
                    {labelFor(row.section_key)}
                    <span className="ml-2 rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-stone-500">
                      {row.section_key as HomepageSectionKey}
                    </span>
                  </p>
                  <p className="mt-0.5 truncate text-sm text-stone-500">
                    {descriptionFor(row.section_key)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggle(row.section_key)}
                  className={`flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-300 ${
                    row.enabled
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-stone-200 bg-stone-50 text-stone-400 hover:text-stone-600'
                  }`}
                >
                  {row.enabled ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  {row.enabled ? 'Visible' : 'Hidden'}
                </button>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between rounded-xl border border-stone-200 bg-stone-50 px-4 py-3">
        <p className="text-xs text-stone-500">
          {rows.filter((r) => r.enabled).length} of {rows.length} sections visible
        </p>
        <Button onClick={handleSave} disabled={!dirty || saveLayout.isPending} className="gold">
          {saveLayout.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {saveLayout.isPending ? 'Saving…' : 'Save layout'}
        </Button>
      </div>
    </div>
  );
}
