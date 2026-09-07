import { useEffect } from 'react';
import { useSeoPage } from '@/hooks/useSeoPages';

type SeoProps = {
  page: string;
  defaults: { title: string; description: string };
};

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/**
 * Applies per-page SEO (title, description, Open Graph) from the CMS,
 * falling back to the given defaults when no row exists for the page.
 */
export function Seo({ page, defaults }: SeoProps) {
  const seo = useSeoPage(page);

  useEffect(() => {
    const title = seo?.meta_title || defaults.title;
    const description = seo?.meta_description || defaults.description;

    document.title = title;
    upsertMeta('name', 'description', description);
    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:type', 'website');
    if (seo?.og_image_url) {
      upsertMeta('property', 'og:image', seo.og_image_url);
    }
  }, [seo, defaults.title, defaults.description]);

  return null;
}
