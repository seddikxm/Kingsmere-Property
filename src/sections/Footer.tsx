import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { ArrowUp, ArrowRight, Mail, MapPin, Phone } from 'lucide-react';
import { useBusinessSettings } from '@/hooks/useBusinessSettings';
import { useSiteContent } from '@/hooks/useSiteContent';
import { DEFAULT_FOOTER_CONTENT, mergeContent } from '@/lib/site-content';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ScrollReveal';
import { IMAGES } from '@/lib/constants';

export function Footer() {
  const { data: settings } = useBusinessSettings();
  const { data: content } = useSiteContent();
  const footer = mergeContent(DEFAULT_FOOTER_CONTENT, content?.footer);
  const footerRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: footerRef,
    offset: ['start end', 'end end'],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ['-8%', '0%']);

  const businessName = settings?.business_name || 'Kingsmere Property';
  const email = settings?.business_email || 'hello@kingsmere.property';
  const phone = settings?.business_phone || '+1 (555) 123-4567';
  const address = settings?.business_address || '123 Estate Avenue, Suite 400, New York, NY 10001';
  const backgroundImage = footer.backgroundImage || IMAGES.footer;
  const quickLinks = footer.quickLinks;

  const contactItems = [
    { icon: Mail, label: 'Email', content: email, href: `mailto:${email}` },
    { icon: Phone, label: 'Phone', content: phone, href: `tel:${phone}` },
    {
      icon: MapPin,
      label: 'Office',
      content: address,
      href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
      external: true,
    },
  ];

  return (
    <footer ref={footerRef} className="relative flex min-h-svh flex-col justify-end overflow-hidden bg-navy-950">
      {prefersReducedMotion ? (
        <div className="absolute inset-0">
          <img
            src={backgroundImage}
            alt="Luxury estate at dusk"
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <motion.div style={{ y: imageY }} className="absolute inset-0">
          <img
            src={backgroundImage}
            alt="Luxury estate at dusk"
            className="h-full w-full object-cover"
          />
        </motion.div>
      )}
      <div className="absolute inset-0 bg-navy-950/85" />
      <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/40 to-navy-950/70" />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-6 py-24 lg:px-8">
        <StaggerContainer className="grid items-end gap-16 lg:grid-cols-12" stagger={0.12}>
          <StaggerItem className="lg:col-span-7">
            <h2 className="text-shadow font-serif text-6xl leading-[1.05] tracking-tight text-white sm:text-7xl lg:text-8xl">
              {businessName}
              <span className="text-gold-400">.</span>
            </h2>
            <p className="mt-8 max-w-md text-base leading-relaxed text-white/60">
              {footer.tagline}
            </p>
            <a
              href="#booking"
              className="group mt-10 inline-flex items-center gap-3 rounded-full border border-white/25 px-7 py-3.5 text-sm font-medium text-white transition-all duration-500 premium-ease hover:border-gold-400/70 hover:text-gold-300"
            >
              {footer.ctaLabel}
              <ArrowRight className="h-4 w-4 transition-transform duration-500 premium-ease group-hover:translate-x-1" />
            </a>
          </StaggerItem>

          <StaggerItem className="lg:col-span-5">
            <div className="divide-y divide-white/10 border-y border-white/10">
              {contactItems.map(({ icon: Icon, label, content, href, external }) => (
                <a
                  key={label}
                  href={href}
                  {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="group -mx-2 flex items-center gap-4 rounded-lg px-2 py-5 transition-colors duration-300 hover:bg-white/5"
                >
                  <Icon className="h-4 w-4 shrink-0 text-gold-400/80 transition-colors duration-300 group-hover:text-gold-300" />
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.2em] text-white/40">{label}</p>
                    <p className="mt-0.5 text-sm text-white/80 transition-colors duration-300 group-hover:text-gold-300">
                      {content}
                    </p>
                  </div>
                </a>
              ))}
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-white/50 transition-colors duration-300 hover:text-white"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </StaggerItem>
        </StaggerContainer>

        <ScrollReveal delay={0.2}>
          <div className="mt-24 flex flex-col items-center justify-between gap-6 border-t border-white/10 pt-8 sm:flex-row">
            <p className="text-xs text-white/40">
              © {new Date().getFullYear()} {businessName}. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                aria-label="Back to top"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/60 transition-all duration-500 premium-ease hover:border-white/40 hover:text-white"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </footer>
  );
}
