import { motion } from 'motion/react';
import { CheckCircle2, Home, TrendingUp, Users } from 'lucide-react';
import { IMAGES } from '@/lib/constants';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ScrollReveal';

export function About() {
  const strengths = [
    {
      icon: Home,
      title: 'Local Property Expertise',
      description: 'Deep knowledge of neighborhoods, pricing trends, and available inventory.',
    },
    {
      icon: Users,
      title: 'Buyer & Seller Guidance',
      description: 'Personalized strategy whether you are purchasing your first home or listing a property.',
    },
    {
      icon: TrendingUp,
      title: 'Market Context',
      description: 'Clear, data-driven insights to help you make confident real estate decisions.',
    },
    {
      icon: CheckCircle2,
      title: 'Transparent Communication',
      description: 'Regular updates, honest feedback, and a process that puts your priorities first.',
    },
  ];

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
                  src={IMAGES.about}
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
                <p className="text-3xl font-bold text-navy-800">98%</p>
                <p className="text-sm text-stone-600">Of clients say they would recommend our real estate guidance to a friend.</p>
              </motion.div>
            </div>
          </ScrollReveal>

          <div>
            <ScrollReveal>
              <span className="text-sm font-semibold uppercase tracking-wider text-navy-700">About Kingsmere</span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
                A real estate partnership built on trust, clarity, and results
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-stone-600">
                We help buyers find the right property, sellers attract serious offers, and investors evaluate
                opportunities with confidence. Every consultation is focused on your timeline, your budget, and your goals.
              </p>
            </ScrollReveal>

            <StaggerContainer className="mt-10 grid gap-6 sm:grid-cols-2" stagger={0.1} delay={0.2}>
              {strengths.map((item) => (
                <StaggerItem key={item.title}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
                    className="rounded-2xl border border-stone-100 bg-cream p-5 transition-shadow hover:shadow-soft"
                  >
                    <item.icon className="h-7 w-7 text-navy-700" />
                    <h3 className="mt-3 text-base font-semibold text-stone-900">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-stone-600">{item.description}</p>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
