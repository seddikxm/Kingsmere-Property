import { useState } from 'react';
import { motion } from 'motion/react';
import { Globe, Loader2, Save, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Field, ImageField } from '@/components/admin/ContentFields';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/toast';
import { useSeoPages, useSaveSeoPage } from '@/hooks/useSeoPages';
import type { SeoPage } from '@/types';

const PAGES = [
  { slug: 'home', label: 'Homepage', path: 'kingsmere.property/' },
  { slug: 'properties', label: 'Properties', path: 'kingsmere.property/properties' },
  { slug: 'listing', label: 'Property detail', path: 'kingsmere.property/listing' },
  { slug: 'contact', label: 'Contact & Booking', path: 'kingsmere.property/#booking' },
];

function Counter({ value, max }: { value: number; max: number }) {
  return (
    <span className={`text-[11px] tabular-nums ${value > max ? 'font-semibold text-red-600' : 'text-stone-400'}`}>
      {value}/{max}
    </span>
  );
}

function SeoEditor({ page, initial }: { page: (typeof PAGES)[number]; initial: Omit<SeoPage, 'updated_at'> }) {
  const [form, setForm] = useState(initial);
  const [snapshot, setSnapshot] = useState(initial);
  const save = useSaveSeoPage();
  const { toast } = useToast();
  const dirty = JSON.stringify(form) !== JSON.stringify(snapshot);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async () => {
    try {
      await save.mutateAsync(form);
      setSnapshot(form);
      toast(`SEO saved for ${page.label}`);
    } catch {
      toast('Save failed. Did you run supabase/migrations/0001_cms.sql?', 'error');
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      <Card>
        <CardContent className="space-y-5 p-6">
          <div className="flex items-center justify-between gap-3">
            <Field label="Meta title">
              <Input
                value={form.meta_title}
                onChange={(e) => set('meta_title', e.target.value)}
                placeholder={`e.g. Kingsmere Property — Premium Real Estate`}
              />
            </Field>
            <Counter value={form.meta_title.length} max={60} />
          </div>
          <div className="flex items-start justify-between gap-3">
            <Field label="Meta description" hint="Shown in search results under the title.">
              <Textarea
                rows={3}
                value={form.meta_description}
                onChange={(e) => set('meta_description', e.target.value)}
                placeholder="A compelling summary of the page in one or two sentences."
              />
            </Field>
            <Counter value={form.meta_description.length} max={160} />
          </div>
          <Field label="Keywords" hint="Comma separated — used by some search engines.">
            <Input
              value={form.keywords}
              onChange={(e) => set('keywords', e.target.value)}
              placeholder="luxury real estate, property consultancy, Newbury"
            />
          </Field>
          <ImageField label="Social share image (Open Graph)" value={form.og_image_url ?? ''} onChange={(v) => set('og_image_url', v || null)} />
        </CardContent>
      </Card>

      <div className="space-y-5">
        <Card>
          <CardContent className="p-6">
            <p className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-500">
              <Search className="h-3.5 w-3.5" />
              Search preview
            </p>
            <div className="rounded-xl border border-stone-200 bg-white p-4">
              <p className="flex items-center gap-2 text-xs text-stone-600">
                <Globe className="h-3.5 w-3.5 text-stone-400" />
                {page.path}
              </p>
              <p className="mt-1 truncate text-lg leading-snug text-[#1a0dab] hover:underline">
                {form.meta_title || 'Page title'}
              </p>
              <p className="mt-1 line-clamp-2 text-sm text-stone-600">
                {form.meta_description || 'Meta description preview appears here as you type…'}
              </p>
            </div>
            {form.og_image_url && (
              <img
                src={form.og_image_url}
                alt="Open Graph preview"
                className="mt-4 h-32 w-full rounded-lg object-cover"
              />
            )}
          </CardContent>
        </Card>

        <div className="flex items-center justify-between rounded-xl border border-stone-200 bg-stone-50 px-4 py-3">
          <span className="text-xs text-stone-500">
            {dirty ? 'Unsaved changes' : 'All changes saved'}
          </span>
          <Button onClick={handleSave} disabled={!dirty || save.isPending} className="gold">
            {save.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {save.isPending ? 'Saving…' : 'Save SEO'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function SeoManagerPage() {
  const { data: pages, isLoading } = useSeoPages();
  const [selected, setSelected] = useState('home');

  const current = PAGES.find((p) => p.slug === selected) ?? PAGES[0];
  const saved = pages?.find((p) => p.page_slug === selected);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
      >
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-gold-600">Content</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">SEO Manager</h1>
        <p className="mt-2 text-stone-600">
          Control how each page appears in search engines and when shared on social media.
        </p>
      </motion.div>

      <div className="flex flex-wrap items-center gap-1 rounded-full border border-stone-200 bg-white p-1 shadow-soft w-fit">
        {PAGES.map((p) => (
          <button
            key={p.slug}
            onClick={() => setSelected(p.slug)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-300 ${
              selected === p.slug ? 'bg-navy-800 text-white shadow-soft' : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <Skeleton className="h-96 w-full rounded-2xl" />
      ) : (
        <SeoEditor
          key={current.slug}
          page={current}
          initial={{
            page_slug: current.slug,
            meta_title: saved?.meta_title ?? '',
            meta_description: saved?.meta_description ?? '',
            keywords: saved?.keywords ?? '',
            og_image_url: saved?.og_image_url ?? null,
          }}
        />
      )}
    </div>
  );
}
