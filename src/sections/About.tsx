import { motion } from 'motion/react';
import { CheckCircle2, Home, TrendingUp, Users, type LucideIcon } from 'lucide-react';
import { IMAGES } from '@/lib/constants';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ScrollReveal';
import { useSiteContent } from '@/hooks/useSiteContent';
import { DEFAULT_ABOUT_CONTENT, mergeContent } from '@/lib/site-content';

// Icons are fixed by card position — the CMS edits titles and descriptions only.
const STRENGTH_ICONS: LucideIcon[] = [Home, Users, TrendingUp, CheckCircle2];

export function About() {
  const { data: content } = useSiteContent();
  const about = mergeContent(DEFAULT_ABOUT_CONTENT, content?.about);

  return (
    <section id="about" className="relative overflow-hidden bg-white py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <ScrollReveal x={-40}>
            <div className="relative">
              <div className="relative overflow-hidden rounded-3xl shadow-lift">
                <motion.img
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
                  src={about.image || IMAGES.about}
                  alt="Real estate agent meeting with clients"
                  className="aspect-[4/3] w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/30 via-transparent to-transparent" />
              </div>
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
                className="absolute -bottom-8 -right-8 hidden max-w-xs rounded-2xl border border-stone-100 bg-white p-6 shadow-lift lg:block"
              >
                <p className="text-3xl font-bold text-navy-800">{about.statValue}</p>
                <p className="text-sm text-stone-600">{about.statLabel}</p>
              </motion.div>
            </div>
          </ScrollReveal>

          <div>
            <ScrollReveal>
              <span className="text-sm font-semibold uppercase tracking-wider text-navy-700">{about.eyebrow}</span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
                {about.heading}
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-stone-600">
                {about.paragraph}
              </p>
            </ScrollReveal>

            <StaggerContainer className="mt-10 grid gap-6 sm:grid-cols-2" stagger={0.1} delay={0.2}>
              {about.strengths.map((item, index) => {
                const Icon = STRENGTH_ICONS[index % STRENGTH_ICONS.length];
                return (
                <StaggerItem key={item.title}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
                    className="rounded-2xl border border-stone-100 bg-cream p-5 transition-shadow hover:shadow-soft"
                  >
                    <Icon className="h-7 w-7 text-navy-700" />
                    <h3 className="mt-3 text-base font-semibold text-stone-900">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-stone-600">{item.description}</p>
                  </motion.div>
                </StaggerItem>
                );
              })}
            </StaggerContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
