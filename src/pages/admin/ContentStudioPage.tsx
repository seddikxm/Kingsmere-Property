import { useState } from 'react';
import { motion } from 'motion/react';
import { Check, Loader2, Plus, Save, Star, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/toast';
import { Field, ImageField, NumberInput, ReorderButtons } from '@/components/admin/ContentFields';
import { useSiteContent, useSiteContentMutation } from '@/hooks/useSiteContent';
import {
  DEFAULT_ABOUT_CONTENT,
  DEFAULT_FOOTER_CONTENT,
  DEFAULT_HERO_CONTENT,
  DEFAULT_TESTIMONIALS_CONTENT,
  mergeContent,
  type AboutContent,
  type FooterContent,
  type HeroContent,
  type TestimonialsContent,
} from '@/lib/site-content';

type TabKey = 'hero' | 'about' | 'testimonials' | 'footer';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'hero', label: 'Hero' },
  { key: 'about', label: 'About' },
  { key: 'testimonials', label: 'Testimonials' },
  { key: 'footer', label: 'Footer' },
];

function SaveBar({
  dirty,
  saving,
  onSave,
}: {
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-stone-200 bg-stone-50 px-4 py-3">
      <span className={`flex items-center gap-2 text-xs font-medium ${dirty ? 'text-gold-700' : 'text-stone-400'}`}>
        {dirty ? (
          <>
            <span className="h-2 w-2 rounded-full bg-gold-500" />
            Unsaved changes
          </>
        ) : (
          <>
            <Check className="h-3.5 w-3.5" />
            All changes saved
          </>
        )}
      </span>
      <Button onClick={onSave} disabled={!dirty || saving} className="gold">
        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
        {saving ? 'Saving…' : 'Save section'}
      </Button>
    </div>
  );
}

function useSectionSaver(key: string) {
  const mutation = useSiteContentMutation();
  const { toast } = useToast();

  const save = async (value: Record<string, unknown>, onSaved: () => void) => {
    try {
      await mutation.mutateAsync({ key, value });
      toast('Section saved — live on the website');
      onSaved();
    } catch {
      toast('Save failed. Did you run supabase/migrations/0001_cms.sql?', 'error');
    }
  };

  return { save, saving: mutation.isPending };
}

/* ------------------------------ Hero ------------------------------ */

function HeroEditor({ initial }: { initial: HeroContent }) {
  const [form, setForm] = useState(initial);
  const [savedSnapshot, setSavedSnapshot] = useState(initial);
  const { save, saving } = useSectionSaver('hero');
  const dirty = JSON.stringify(form) !== JSON.stringify(savedSnapshot);

  const set = <K extends keyof HeroContent>(key: K, value: HeroContent[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const updateStat = (index: number, patch: Partial<HeroContent['stats'][number]>) =>
    set('stats', form.stats.map((s, i) => (i === index ? { ...s, ...patch } : s)));

  return (
    <div className="space-y-5">
      <Card>
        <CardContent className="space-y-5 p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Badge text">
              <Input value={form.badge} onChange={(e) => set('badge', e.target.value)} />
            </Field>
            <Field label="Primary button label">
              <Input value={form.primaryCta} onChange={(e) => set('primaryCta', e.target.value)} />
            </Field>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Title — first line">
              <Input value={form.titleTop} onChange={(e) => set('titleTop', e.target.value)} />
            </Field>
            <Field label="Title — accent line (gold)">
              <Input value={form.titleAccent} onChange={(e) => set('titleAccent', e.target.value)} />
            </Field>
          </div>
          <Field label="Subtitle">
            <Textarea rows={3} value={form.subtitle} onChange={(e) => set('subtitle', e.target.value)} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Secondary button label">
              <Input value={form.secondaryCta} onChange={(e) => set('secondaryCta', e.target.value)} />
            </Field>
            <ImageField label="Background image" value={form.image} onChange={(v) => set('image', v)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Stats bar</p>
          {form.stats.map((stat, i) => (
            <div key={i} className="grid items-end gap-3 rounded-xl border border-stone-200 p-4 sm:grid-cols-[120px_100px_1fr]">
              <Field label="Value">
                <NumberInput value={stat.value} min={0} onChange={(v) => updateStat(i, { value: Number.isNaN(v) ? 0 : v })} />
              </Field>
              <Field label="Suffix">
                <Input value={stat.suffix} onChange={(e) => updateStat(i, { suffix: e.target.value })} />
              </Field>
              <Field label="Label">
                <Input value={stat.label} onChange={(e) => updateStat(i, { label: e.target.value })} />
              </Field>
            </div>
          ))}
        </CardContent>
      </Card>

      <SaveBar dirty={dirty} saving={saving} onSave={() => save(form, () => setSavedSnapshot(form))} />
    </div>
  );
}

/* ------------------------------ About ------------------------------ */

function AboutEditor({ initial }: { initial: AboutContent }) {
  const [form, setForm] = useState(initial);
  const [savedSnapshot, setSavedSnapshot] = useState(initial);
  const { save, saving } = useSectionSaver('about');
  const dirty = JSON.stringify(form) !== JSON.stringify(savedSnapshot);

  const set = <K extends keyof AboutContent>(key: K, value: AboutContent[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const updateStrength = (index: number, patch: Partial<AboutContent['strengths'][number]>) =>
    set('strengths', form.strengths.map((s, i) => (i === index ? { ...s, ...patch } : s)));

  return (
    <div className="space-y-5">
      <Card>
        <CardContent className="space-y-5 p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Eyebrow">
              <Input value={form.eyebrow} onChange={(e) => set('eyebrow', e.target.value)} />
            </Field>
            <Field label="Heading">
              <Input value={form.heading} onChange={(e) => set('heading', e.target.value)} />
            </Field>
          </div>
          <Field label="Paragraph">
            <Textarea rows={4} value={form.paragraph} onChange={(e) => set('paragraph', e.target.value)} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <ImageField label="Section image" value={form.image} onChange={(v) => set('image', v)} />
            <div className="space-y-5">
              <Field label="Floating stat — value">
                <Input value={form.statValue} onChange={(e) => set('statValue', e.target.value)} />
              </Field>
              <Field label="Floating stat — caption">
                <Textarea rows={2} value={form.statLabel} onChange={(e) => set('statLabel', e.target.value)} />
              </Field>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            Strength cards (icons are fixed by position)
          </p>
          {form.strengths.map((strength, i) => (
            <div key={i} className="grid gap-3 rounded-xl border border-stone-200 p-4 sm:grid-cols-2">
              <Field label="Title">
                <Input value={strength.title} onChange={(e) => updateStrength(i, { title: e.target.value })} />
              </Field>
              <Field label="Description">
                <Input value={strength.description} onChange={(e) => updateStrength(i, { description: e.target.value })} />
              </Field>
            </div>
          ))}
        </CardContent>
      </Card>

      <SaveBar dirty={dirty} saving={saving} onSave={() => save(form, () => setSavedSnapshot(form))} />
    </div>
  );
}

/* --------------------------- Testimonials --------------------------- */

function TestimonialsEditor({ initial }: { initial: TestimonialsContent }) {
  const [form, setForm] = useState(initial);
  const [savedSnapshot, setSavedSnapshot] = useState(initial);
  const { save, saving } = useSectionSaver('testimonials');
  const dirty = JSON.stringify(form) !== JSON.stringify(savedSnapshot);

  const set = <K extends keyof TestimonialsContent>(key: K, value: TestimonialsContent[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const updateItem = (index: number, patch: Partial<TestimonialsContent['items'][number]>) =>
    set('items', form.items.map((item, i) => (i === index ? { ...item, ...patch } : item)));

  const moveItem = (from: number, to: number) => {
    if (to < 0 || to >= form.items.length) return;
    const items = [...form.items];
    const [moved] = items.splice(from, 1);
    items.splice(to, 0, moved);
    set('items', items);
  };

  return (
    <div className="space-y-5">
      <Card>
        <CardContent className="grid gap-5 p-6 sm:grid-cols-3">
          <Field label="Eyebrow">
            <Input value={form.eyebrow} onChange={(e) => set('eyebrow', e.target.value)} />
          </Field>
          <Field label="Heading">
            <Input value={form.heading} onChange={(e) => set('heading', e.target.value)} />
          </Field>
          <Field label="Subheading">
            <Input value={form.subheading} onChange={(e) => set('subheading', e.target.value)} />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Testimonials</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                set('items', [
                  ...form.items,
                  {
                    id: `testimonial-${Date.now()}`,
                    name: '',
                    profession: '',
                    rating: 5,
                    description: '',
                    avatarUrl: '',
                  },
                ])
              }
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Add testimonial
            </Button>
          </div>
          {form.items.map((item, i) => (
            <div key={item.id} className="flex gap-3 rounded-xl border border-stone-200 p-4">
              <ReorderButtons index={i} total={form.items.length} onMove={moveItem} />
              <div className="grid flex-1 gap-4 sm:grid-cols-2">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Name">
                      <Input value={item.name} onChange={(e) => updateItem(i, { name: e.target.value })} />
                    </Field>
                    <Field label="Role">
                      <Input value={item.profession} onChange={(e) => updateItem(i, { profession: e.target.value })} />
                    </Field>
                  </div>
                  <Field label={`Rating: ${item.rating} / 5`}>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => updateItem(i, { rating: n })}
                          className="rounded p-0.5 transition-colors"
                          title={`${n} stars`}
                        >
                          <Star
                            className={`h-5 w-5 ${n <= item.rating ? 'fill-gold-500 text-gold-500' : 'text-stone-300'}`}
                          />
                        </button>
                      ))}
                    </div>
                  </Field>
                  <ImageField label="Avatar" value={item.avatarUrl} onChange={(v) => updateItem(i, { avatarUrl: v })} />
                </div>
                <div className="flex flex-col gap-4">
                  <Field label="Quote">
                    <Textarea
                      rows={6}
                      value={item.description}
                      onChange={(e) => updateItem(i, { description: e.target.value })}
                    />
                  </Field>
                  <button
                    type="button"
                    onClick={() => set('items', form.items.filter((_, idx) => idx !== i))}
                    className="inline-flex items-center gap-1.5 self-start text-xs font-medium text-red-600 transition-colors hover:text-red-700"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove testimonial
                  </button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <SaveBar dirty={dirty} saving={saving} onSave={() => save(form, () => setSavedSnapshot(form))} />
    </div>
  );
}

/* ------------------------------ Footer ------------------------------ */

function FooterEditor({ initial }: { initial: FooterContent }) {
  const [form, setForm] = useState(initial);
  const [savedSnapshot, setSavedSnapshot] = useState(initial);
  const { save, saving } = useSectionSaver('footer');
  const dirty = JSON.stringify(form) !== JSON.stringify(savedSnapshot);

  const set = <K extends keyof FooterContent>(key: K, value: FooterContent[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const updateLink = (index: number, patch: Partial<FooterContent['quickLinks'][number]>) =>
    set('quickLinks', form.quickLinks.map((l, i) => (i === index ? { ...l, ...patch } : l)));

  return (
    <div className="space-y-5">
      <Card>
        <CardContent className="space-y-5 p-6">
          <Field label="Tagline">
            <Textarea rows={3} value={form.tagline} onChange={(e) => set('tagline', e.target.value)} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="CTA button label">
              <Input value={form.ctaLabel} onChange={(e) => set('ctaLabel', e.target.value)} />
            </Field>
            <ImageField
              label="Footer background image"
              value={form.backgroundImage}
              onChange={(v) => set('backgroundImage', v)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            Quick links (email, phone & office come from Settings)
          </p>
          {form.quickLinks.map((link, i) => (
            <div key={i} className="grid gap-3 rounded-xl border border-stone-200 p-4 sm:grid-cols-2">
              <Field label="Label">
                <Input value={link.label} onChange={(e) => updateLink(i, { label: e.target.value })} />
              </Field>
              <Field label="Link (URL or #anchor)">
                <Input value={link.href} onChange={(e) => updateLink(i, { href: e.target.value })} />
              </Field>
            </div>
          ))}
        </CardContent>
      </Card>

      <SaveBar dirty={dirty} saving={saving} onSave={() => save(form, () => setSavedSnapshot(form))} />
    </div>
  );
}

/* ------------------------------- Page ------------------------------- */

export function ContentStudioPage() {
  const { data: content, isLoading } = useSiteContent();
  const [tab, setTab] = useState<TabKey>('hero');

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
      >
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-gold-600">Content</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">Content Studio</h1>
        <p className="mt-2 text-stone-600">
          Edit the copy and imagery of every homepage section. Changes go live the moment you save.
        </p>
      </motion.div>

      <div className="flex flex-wrap items-center gap-1 rounded-full border border-stone-200 bg-white p-1 shadow-soft w-fit">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-300 ${
              tab === t.key ? 'bg-navy-800 text-white shadow-soft' : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-12 w-full rounded-2xl" />
        </div>
      ) : (
        <>
          {tab === 'hero' && (
            <HeroEditor
              key={`hero-${!!content}`}
              initial={mergeContent(DEFAULT_HERO_CONTENT, content?.hero)}
            />
          )}
          {tab === 'about' && (
            <AboutEditor
              key={`about-${!!content}`}
              initial={mergeContent(DEFAULT_ABOUT_CONTENT, content?.about)}
            />
          )}
          {tab === 'testimonials' && (
            <TestimonialsEditor
              key={`testimonials-${!!content}`}
              initial={mergeContent(DEFAULT_TESTIMONIALS_CONTENT, content?.testimonials)}
            />
          )}
          {tab === 'footer' && (
            <FooterEditor
              key={`footer-${!!content}`}
              initial={mergeContent(DEFAULT_FOOTER_CONTENT, content?.footer)}
            />
          )}
        </>
      )}
    </div>
  );
}
