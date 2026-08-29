import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowRight, Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { IMAGES } from '@/lib/constants';

interface HeroProps {
  onBookClick: () => void;
}

function CountUp({ target, suffix = '', duration = 2000 }: { target: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || hasAnimated.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true;
            const start = performance.now();
            const animate = (now: number) => {
              const progress = Math.min((now - start) / duration, 1);
              const eased = 1 - Math.pow(1 - progress, 4);
              setCount(Math.floor(eased * target));
              if (progress < 1) requestAnimationFrame(animate);
            };
            requestAnimationFrame(animate);
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

const stats = [
  { value: 12, suffix: '+', label: 'Years of market experience' },
  { value: 500, suffix: '+', label: 'Clients guided home' },
  { value: 24, suffix: 'h', label: 'Average response time' },
];

const ease = [0.21, 0.47, 0.32, 0.98] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease },
  },
};

const statsVariants = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease, staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const statItemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease },
  },
};

export function Hero({ onBookClick }: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.6], [0.6, 0.85]);

  return (
    <section ref={sectionRef} className="relative min-h-screen overflow-hidden">
      <motion.div style={{ y: imageY, scale: imageScale }} className="absolute inset-0">
        <img
          src={IMAGES.hero}
          alt="Modern luxury home exterior"
          className="h-full w-full object-cover"
        />
      </motion.div>
      <motion.div style={{ opacity: overlayOpacity }} className="absolute inset-0 bg-gradient-to-r from-navy-950/90 via-navy-900/70 to-navy-900/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-navy-950/60 via-transparent to-transparent" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 pb-56 pt-40 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-3xl"
        >
          <motion.div variants={itemVariants} className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 backdrop-blur-sm">
            <MapPin className="h-4 w-4 text-gold-400" />
            <span className="text-sm font-medium text-white/90">Premium Real Estate Services</span>
          </motion.div>
          <motion.h1 variants={itemVariants} className="text-balance text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-6xl lg:text-7xl">
            Find your place. <br />
            <span className="text-gold-400">With confidence.</span>
          </motion.h1>
          <motion.p variants={itemVariants} className="mt-6 max-w-xl text-lg leading-relaxed text-white/80 sm:text-xl">
            Expert real estate guidance for buyers, sellers, and investors. Schedule a personal
            consultation and take the next step toward your property goals.
          </motion.p>
          <motion.div variants={itemVariants} className="mt-10 flex flex-wrap items-center gap-4">
            <Button size="lg" onClick={onBookClick} className="gold px-8">
              <Calendar className="h-5 w-5" />
              Schedule your consultation
            </Button>
            <a href="#services">
              <Button size="lg" variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white px-8">
                Explore services
                <ArrowRight className="h-5 w-5" />
              </Button>
            </a>
          </motion.div>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10">
        <div className="mx-auto max-w-7xl px-6 pb-10 lg:px-8">
          <motion.div
            variants={statsVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-4 rounded-3xl border border-white/10 bg-white/10 p-2 backdrop-blur-xl shadow-lift sm:grid-cols-3"
          >
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                variants={statItemVariants}
                className="group relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-white/15 to-white/5 px-6 py-6 text-center transition-all duration-500 hover:from-white/20 hover:to-white/10 hover:shadow-glow sm:text-left"
              >
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <p className="relative text-3xl font-bold text-white tabular-nums">
                  <CountUp target={stat.value} suffix={stat.suffix} />
                </p>
                <p className="relative mt-1 text-sm font-medium text-white/70">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
