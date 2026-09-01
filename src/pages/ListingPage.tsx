import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  BedDouble,
  Bath,
  Maximize,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Home,
  Car,
  Trees,
  Waves,
  Flame,
  ChefHat,
  Shirt,
  Tv,
  Wifi,
  Dumbbell,
  CheckCircle2,
  Play,
  Compass,
  School,
  Coffee,
  Train,
  Calculator,
  X,
  Share2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useListing, useListings } from '@/hooks/useListing';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ScrollReveal';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  BedDouble,
  Bath,
  Maximize,
  Car,
  Trees,
  Waves,
  Flame,
  ChefHat,
  Shirt,
  Tv,
  Wifi,
  Dumbbell,
  Home,
  MapPin,
  Phone,
  Mail,
  Calendar,
};

const revealEase = [0.32, 0.72, 0, 1] as const;

function parsePrice(price: string) {
  const num = parseFloat(price.replace(/[^0-9.]/g, ''));
  return isNaN(num) ? 0 : num;
}

function formatCurrency(value: number) {
  return value.toLocaleString('en-GB', { maximumFractionDigits: 0 });
}

function CountUp({ target, duration = 2000 }: { target: number; duration?: number }) {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const el = ref.current;
    if (!el) return;

    let rafId: number | undefined;
    let hasAnimated = false;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            hasAnimated = true;
            const start = performance.now();
            const animate = (now: number) => {
              const progress = Math.min((now - start) / duration, 1);
              const eased = 1 - Math.pow(1 - progress, 4);
              setCount(Math.floor(eased * target));
              if (progress < 1) rafId = requestAnimationFrame(animate);
            };
            rafId = requestAnimationFrame(animate);
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [target, duration]);

  if (prefersReducedMotion) {
    return <span>{target}</span>;
  }

  return <span ref={ref}>{count}</span>;
}

function AnimatedNumber({ value }: { value: string | number }) {
  const num = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.]/g, ''));
  const isNumeric = !isNaN(num) && num > 0;

  return (
    <span className="font-serif text-3xl tracking-tight text-stone-900">
      {isNumeric ? <CountUp target={Math.round(num)} /> : value}
    </span>
  );
}

function ImageCounter({ current, total }: { current: number; total: number }) {
  return (
    <div className="rounded-full bg-black/40 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
      {current + 1} / {total}
    </div>
  );
}

export function ListingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const listingId = searchParams.get('id');
  const { data: listing, isLoading } = useListing(listingId);
  const { data: allListings } = useListings();
  const prefersReducedMotion = useReducedMotion();

  const [selectedImage, setSelectedImage] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const related = (allListings || [])
    .filter((l) => l.id !== listing?.id)
    .slice(0, 3);

  const [homePrice, setHomePrice] = useState(() => parsePrice(listing?.price || '0'));
  const [deposit, setDeposit] = useState(() => Math.round(parsePrice(listing?.price || '0') * 0.2));
  const [rate, setRate] = useState(4.5);
  const [term, setTerm] = useState(25);

  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroImageY = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);
  const heroImageScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

  useEffect(() => {
    const handleNavScroll = () => setNavScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleNavScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleNavScroll);
  }, []);

  useEffect(() => {
    if (listing?.price) {
      const price = parsePrice(listing.price);
      setHomePrice(price);
      setDeposit(Math.round(price * 0.2));
    }
  }, [listing]);

  useEffect(() => {
    if (listing && listing.images.length > 0) {
      setSelectedImage(0);
    }
  }, [listing]);

  const loan = Math.max(0, homePrice - deposit);
  const monthlyRate = rate / 100 / 12;
  const numberOfPayments = term * 12;
  const monthlyPayment =
    rate > 0
      ? loan * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
      : loan / numberOfPayments;

  const nextImage = useCallback(() => {
    if (!listing) return;
    setSelectedImage((prev) => (prev + 1) % listing.images.length);
  }, [listing]);

  const prevImage = useCallback(() => {
    if (!listing) return;
    setSelectedImage((prev) => (prev - 1 + listing.images.length) % listing.images.length);
  }, [listing]);

  useEffect(() => {
    if (!lightbox) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(false);
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightbox, nextImage, prevImage]);

  useEffect(() => {
    if (lightbox) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [lightbox]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <div className="flex items-center gap-3 text-stone-500">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-stone-300 border-t-navy-700" aria-hidden="true" />
          Loading listing…
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-6">
        <p className="text-stone-600">No listing available.</p>
        <button onClick={() => navigate('/')} className="mt-4 text-navy-700 hover:underline focus-visible:ring-2 focus-visible:ring-navy-700">
          Back to home
        </button>
      </div>
    );
  }

  const images = listing.images.length > 0
    ? listing.images
    : ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=2400'];

  return (
    <div className="min-h-screen bg-cream">
      {/* Top bar */}
      <div
        className={`fixed top-0 left-0 right-0 z-40 px-6 transition-all duration-300 ${
          navScrolled
            ? 'border-b border-stone-200/80 bg-white/95 py-3 shadow-soft backdrop-blur-xl'
            : 'border-b border-white/10 bg-transparent py-4'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <button
              onClick={() => navigate(-1)}
              className={`group flex h-11 flex-shrink-0 items-center gap-2 rounded-full pr-3 text-sm font-medium transition-colors focus-visible:ring-2 ${
                navScrolled
                  ? 'text-stone-600 hover:text-navy-800 focus-visible:ring-navy-700'
                  : 'text-white/80 hover:text-white focus-visible:ring-white/50'
              }`}
              aria-label="Back to previous page"
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
                  navScrolled
                    ? 'border-stone-200 bg-stone-100 group-hover:bg-stone-200'
                    : 'border-white/10 bg-white/5 group-hover:bg-white/10'
                }`}
                aria-hidden="true"
              >
                <ArrowLeft className={`h-4 w-4 ${navScrolled ? 'text-stone-900' : 'text-white'}`} />
              </span>
              <span className="hidden sm:inline">Back</span>
            </button>

            <div className={`min-w-0 transition-opacity duration-300 ${navScrolled ? 'opacity-100' : 'opacity-0'}`}>
              <p className="truncate font-serif text-base font-medium text-stone-900 sm:text-lg">{listing.title}</p>
              <p className="truncate text-xs text-stone-500">{listing.address}</p>
            </div>
          </div>

          <div className={`flex flex-shrink-0 items-center gap-3 transition-opacity duration-300 ${navScrolled ? 'opacity-100' : 'opacity-0'}`}>
            <span className="hidden font-serif text-lg text-stone-900 lg:inline">{listing.price}</span>
            <Button
              onClick={() => navigate('/#booking')}
              size="sm"
              className="gold transition-all active:scale-[0.98]"
            >
              <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Book viewing</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Hero */}
      <section ref={heroRef} className="relative h-svh min-h-[600px] overflow-hidden pt-[65px]">
        {images.map((img, idx) => (
          <motion.div
            key={idx}
            initial={false}
            animate={{
              opacity: idx === selectedImage ? 1 : 0,
              scale: idx === selectedImage ? 1 : 1.05,
            }}
            transition={{ duration: 0.9, ease: revealEase }}
            className="absolute inset-0"
          >
            {!prefersReducedMotion && idx === selectedImage ? (
              <motion.div style={{ y: heroImageY, scale: heroImageScale }} className="h-full w-full">
                <img
                  src={img}
                  alt={`${listing.title} — view ${idx + 1}`}
                  className="h-full w-full object-cover"
                />
              </motion.div>
            ) : (
              <img
                src={img}
                alt={`${listing.title} — view ${idx + 1}`}
                className="h-full w-full object-cover"
              />
            )}
          </motion.div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-900/30 to-navy-950/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-950/70 via-transparent to-transparent" />
        <div className="grain-overlay absolute inset-0 opacity-50" />

        <div className="absolute bottom-0 left-0 right-0 p-6 pb-12 lg:pb-20">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-8">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-white/95 backdrop-blur-sm">
                  {listing.status}
                </div>
                <h1 className="font-serif text-5xl font-medium italic leading-[0.95] tracking-tight text-white text-shadow sm:text-6xl lg:text-7xl xl:text-8xl">
                  {listing.title}
                </h1>
                {listing.subtitle && (
                  <p className="mt-3 max-w-xl text-lg leading-relaxed text-white/80">{listing.subtitle}</p>
                )}
                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
                  <div className="flex items-center gap-2 text-white/70">
                    <MapPin className="h-4 w-4 flex-shrink-0 text-gold-400" aria-hidden="true" />
                    <span className="text-sm">{listing.address}</span>
                  </div>
                  {/* Mobile / tablet guide price */}
                  <div className="lg:hidden">
                    <p className="text-xs uppercase tracking-[0.15em] text-white/60">Guide price</p>
                    <p className="font-serif text-2xl tracking-tight text-gold-400">{listing.price}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-start gap-6 lg:col-span-4 lg:items-end">
                {/* Desktop guide price card */}
                <div className="hidden rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-md lg:block">
                  <p className="text-xs uppercase tracking-[0.15em] text-white/60">Guide price</p>
                  <p className="font-serif text-4xl tracking-tight text-white">{listing.price}</p>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={prevImage}
                    aria-label="Previous image"
                    className="flex h-14 w-14 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-sm transition-all hover:scale-105 hover:bg-white/20 active:scale-95 focus-visible:ring-2 focus-visible:ring-white/50"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    aria-label="Next image"
                    className="flex h-14 w-14 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-sm transition-all hover:scale-105 hover:bg-white/20 active:scale-95 focus-visible:ring-2 focus-visible:ring-white/50"
                  >
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Thumbnail strip */}
      <div className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex gap-3 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  aria-label={`View image ${idx + 1}`}
                  aria-current={idx === selectedImage ? 'true' : undefined}
                  className={`relative h-20 w-28 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-navy-700 ${
                    selectedImage === idx ? 'border-gold-500 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${listing.title} thumbnail ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
            <ImageCounter current={selectedImage} total={images.length} />
          </div>
        </div>
      </div>

      {/* Quick info strip */}
      <div className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-stone-600">
              <span className="flex items-center gap-2">
                <BedDouble className="h-4 w-4 text-navy-700" aria-hidden="true" />
                <span className="font-medium text-stone-900">{listing.beds}</span> beds
              </span>
              <span className="flex items-center gap-2">
                <Bath className="h-4 w-4 text-navy-700" aria-hidden="true" />
                <span className="font-medium text-stone-900">{listing.baths}</span> baths
              </span>
              <span className="flex items-center gap-2">
                <Maximize className="h-4 w-4 text-navy-700" aria-hidden="true" />
                <span className="font-medium text-stone-900">{listing.sqft}</span> sq ft
              </span>
              <span className="flex items-center gap-2">
                <Trees className="h-4 w-4 text-navy-700" aria-hidden="true" />
                <span className="font-medium text-stone-900">{listing.acres}</span> acres
              </span>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                setShareCopied(true);
                setTimeout(() => setShareCopied(false), 2000);
              }}
              className="flex h-11 items-center gap-2 rounded-full px-4 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 hover:text-navy-700 focus-visible:ring-2 focus-visible:ring-navy-700"
              aria-label="Copy page link"
            >
              <Share2 className="h-4 w-4" aria-hidden="true" />
              {shareCopied ? 'Link copied' : 'Share'}
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
        <div className="grid gap-16 lg:grid-cols-12">
          {/* Left column */}
          <div className="lg:col-span-8">
            {/* Key stats */}
            <ScrollReveal>
              <div className="mb-16 grid grid-cols-2 gap-4 border-b border-stone-200 pb-16 sm:grid-cols-4">
                {[
                  { icon: BedDouble, value: listing.beds, label: 'Bedrooms' },
                  { icon: Bath, value: listing.baths, label: 'Bathrooms' },
                  { icon: Maximize, value: listing.sqft, label: 'Sq Ft' },
                  { icon: Trees, value: `${listing.acres} ac`, label: 'Land' },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-stone-200/80 bg-white p-6 text-center shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
                  >
                    <stat.icon className="mx-auto mb-3 h-6 w-6 text-navy-700" aria-hidden="true" />
                    <AnimatedNumber value={stat.value} />
                    <p className="mt-1 text-xs font-medium uppercase tracking-[0.15em] text-stone-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </ScrollReveal>

            {/* Description */}
            <ScrollReveal>
              <div className="mb-16 max-w-3xl">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-navy-700">Overview</span>
                <h2 className="mt-3 font-serif text-3xl text-stone-900 sm:text-4xl">About this property</h2>
                <div className="mt-8 space-y-5 text-base leading-[1.8] text-stone-600">
                  {listing.description.split('\n\n').map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* Features */}
            <ScrollReveal>
              <div className="grain-overlay mb-16 overflow-hidden rounded-3xl bg-navy-950 p-8 text-white shadow-2xl lg:p-12">
                <div className="relative z-10">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">Highlights</span>
                  <h3 className="mt-3 font-serif text-3xl text-white">Key features</h3>
                  <ul className="mt-8 grid gap-4 sm:grid-cols-2">
                    {listing.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-gold-400" aria-hidden="true" />
                        <span className="text-white/85">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </ScrollReveal>

            {/* Amenities */}
            <ScrollReveal>
              <div className="mb-16">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-navy-700">Comfort & convenience</span>
                <h2 className="mt-3 font-serif text-3xl text-stone-900 sm:text-4xl">Amenities</h2>
                <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {listing.amenities.map((amenity) => {
                    const Icon = iconMap[amenity.icon] || Home;
                    return (
                      <div
                        key={amenity.label}
                        className="group flex items-center gap-4 rounded-2xl border border-stone-200/80 bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-navy-200 hover:shadow-soft active:scale-[0.98]"
                      >
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-stone-100 text-navy-700 transition-colors group-hover:bg-navy-50">
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <span className="font-medium text-stone-900">{amenity.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </ScrollReveal>

            {/* Gallery */}
            <ScrollReveal>
              <div className="mb-4">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-navy-700">Interior</span>
                <h2 className="mt-3 font-serif text-3xl text-stone-900 sm:text-4xl">Gallery</h2>
              </div>
            </ScrollReveal>
            <StaggerContainer className="grid grid-cols-2 gap-3 sm:gap-4" stagger={0.08}>
              {images.map((img, idx) => (
                <StaggerItem key={idx} className={idx === 0 ? 'col-span-2' : undefined}>
                  <button
                    onClick={() => { setSelectedImage(idx); setLightbox(true); }}
                    aria-label={`Open image ${idx + 1} in lightbox`}
                    className={`group relative block w-full overflow-hidden rounded-2xl focus-visible:ring-2 focus-visible:ring-navy-700 ${idx === 0 ? 'aspect-[21/9]' : 'aspect-[4/3]'}`}
                  >
                    <img
                      src={img}
                      alt={`${listing.title} interior ${idx + 1}`}
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />
                  </button>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>

          {/* Right column */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              {/* Price card */}
              <ScrollReveal>
                <div className="rounded-3xl border border-white/20 bg-white/95 p-6 shadow-lift backdrop-blur-xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-stone-500">Guide price</p>
                  <p className="mt-2 font-serif text-4xl tracking-tight text-stone-900">{listing.price}</p>
                  <div className="mt-4 flex items-start gap-2 text-sm text-stone-600">
                    <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-navy-700" aria-hidden="true" />
                    <span>{listing.address}</span>
                  </div>
                  <div className="mt-6 flex flex-col gap-3">
                    <Button onClick={() => navigate('/#booking')} size="lg" className="gold w-full transition-all hover:shadow-glow active:scale-[0.98]">
                      <Calendar className="h-4 w-4" aria-hidden="true" />
                      Book a viewing
                    </Button>
                    <Button variant="outline" className="w-full transition-all active:scale-[0.98]" onClick={() => window.print()}>
                      Download brochure
                    </Button>
                  </div>
                </div>
              </ScrollReveal>

              {/* Agent card */}
              <ScrollReveal>
                <div className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-soft">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-stone-500">Property agent</p>
                  <div className="mt-5 flex items-center gap-4">
                    {listing.agent_image && (
                      <img
                        src={listing.agent_image}
                        alt={listing.agent_name}
                        className="h-16 w-16 rounded-2xl object-cover"
                      />
                    )}
                    <div>
                      <p className="font-serif text-lg text-stone-900">{listing.agent_name}</p>
                      <p className="text-sm text-stone-500">{listing.agent_role}</p>
                    </div>
                  </div>
                  <div className="mt-6 space-y-3">
                    <a
                      href={`tel:${listing.agent_phone}`}
                      className="flex items-center gap-3 rounded-xl bg-stone-50 p-3 text-sm font-medium text-stone-700 transition-all hover:bg-stone-100 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-navy-700"
                    >
                      <Phone className="h-4 w-4 text-navy-700" aria-hidden="true" />
                      {listing.agent_phone}
                    </a>
                    <a
                      href={`mailto:${listing.agent_email}`}
                      className="flex items-center gap-3 rounded-xl bg-stone-50 p-3 text-sm font-medium text-stone-700 transition-all hover:bg-stone-100 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-navy-700"
                    >
                      <Mail className="h-4 w-4 text-navy-700" aria-hidden="true" />
                      {listing.agent_email}
                    </a>
                  </div>
                </div>
              </ScrollReveal>

              {/* Location note */}
              <ScrollReveal>
                <div className="rounded-3xl border border-stone-200/80 bg-stone-50 p-6">
                  <h3 className="font-serif text-lg text-stone-900">Location</h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone-600">
                    {listing.address}. Situated in a sought-after area with excellent local amenities and transport links.
                  </p>
                </div>
              </ScrollReveal>

              {/* Mortgage calculator */}
              <ScrollReveal>
                <div className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-soft">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-50 text-navy-700">
                      <Calculator className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="font-serif text-lg text-stone-900">Mortgage estimate</p>
                      <p className="text-xs text-stone-500">Indicative monthly repayment</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="price" className="text-xs font-semibold uppercase tracking-[0.15em] text-stone-500">
                        Property price (£)
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        value={homePrice}
                        onChange={(e) => setHomePrice(parseFloat(e.target.value) || 0)}
                        className="mt-1 rounded-xl"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="deposit" className="text-xs font-semibold uppercase tracking-[0.15em] text-stone-500">
                          Deposit (£)
                        </Label>
                        <Input
                          id="deposit"
                          type="number"
                          value={deposit}
                          onChange={(e) => setDeposit(parseFloat(e.target.value) || 0)}
                          className="mt-1 rounded-xl"
                        />
                      </div>
                      <div>
                        <Label htmlFor="rate" className="text-xs font-semibold uppercase tracking-[0.15em] text-stone-500">
                          Rate (%)
                        </Label>
                        <Input
                          id="rate"
                          type="number"
                          step="0.1"
                          value={rate}
                          onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
                          className="mt-1 rounded-xl"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="term" className="text-xs font-semibold uppercase tracking-[0.15em] text-stone-500">
                        Term (years)
                      </Label>
                      <Input
                        id="term"
                        type="number"
                        value={term}
                        onChange={(e) => setTerm(parseInt(e.target.value) || 0)}
                        className="mt-1 rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="mt-5 rounded-2xl bg-navy-950 p-5 text-white">
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/60">Estimated monthly payment</p>
                    <p className="mt-1 font-serif text-3xl tracking-tight">£{formatCurrency(monthlyPayment)}</p>
                    <p className="mt-2 text-xs leading-relaxed text-white/70">
                      Based on a £{formatCurrency(loan)} loan over {term} years at {rate}% interest. This is for guidance only; speak to a mortgage adviser for a tailored quote.
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </main>

      {/* Floor plan */}
      <section className="border-t border-stone-200 bg-white py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <ScrollReveal>
            <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-navy-700">Layout</span>
                <h2 className="mt-3 font-serif text-3xl text-stone-900 sm:text-4xl">Floor plan</h2>
              </div>
              <p className="max-w-md text-sm leading-relaxed text-stone-600">
                Approximate floor plan for illustration. Schedule a viewing to experience the layout in person.
              </p>
            </div>
          </ScrollReveal>
          <ScrollReveal>
            <div className="overflow-hidden rounded-3xl border border-stone-200/80 bg-stone-50 p-2 shadow-soft">
              <img
                src="https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&q=80&w=2400"
                alt={`Illustrative floor plan for ${listing.title}`}
                className="w-full rounded-2xl object-cover"
              />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Virtual tour */}
      <section className="relative overflow-hidden bg-navy-950 py-28 lg:py-36">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=2400"
            alt=""
            className="h-full w-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950/90 via-navy-900/80 to-navy-900/60" />
        </div>
        <div className="grain-overlay absolute inset-0 opacity-40" />
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <ScrollReveal>
            <button
              aria-label="Play virtual tour preview"
              className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-sm transition-transform hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-white/50"
            >
              <Play className="h-7 w-7 fill-white" />
            </button>
            <h2 className="font-serif text-4xl tracking-tight text-white sm:text-5xl">Take the virtual tour</h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/80">
              Walk through the property room by room before arranging your private viewing.
            </p>
            <Button className="mt-10 gold px-8 transition-all hover:shadow-glow active:scale-[0.98]" size="lg">
              <Play className="h-4 w-4" aria-hidden="true" />
              Play virtual tour
            </Button>
          </ScrollReveal>
        </div>
      </section>

      {/* Neighbourhood */}
      <section className="bg-cream py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <ScrollReveal>
            <div className="mb-14 max-w-2xl">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-navy-700">Neighbourhood</span>
              <h2 className="mt-3 font-serif text-3xl text-stone-900 sm:text-4xl">A well-connected country setting</h2>
              <p className="mt-5 text-base leading-relaxed text-stone-600">
                The property sits on the edge of Newbury, with the town centre, mainline station, and countryside walks all within easy reach.
              </p>
            </div>
          </ScrollReveal>
          <StaggerContainer className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4" stagger={0.1}>
            {[
              { icon: Compass, title: 'Town centre', desc: '5 minutes by car' },
              { icon: Train, title: 'Newbury station', desc: 'London Paddington in 1 hour' },
              { icon: School, title: 'Schools', desc: 'Independent & state options nearby' },
              { icon: Coffee, title: 'High Street', desc: 'Shops, cafés & restaurants' },
            ].map((item) => (
              <StaggerItem key={item.title}>
                <div className="h-full rounded-3xl border border-stone-200/80 bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
                  <item.icon className="h-8 w-8 text-navy-700" aria-hidden="true" />
                  <h3 className="mt-5 font-serif text-lg text-stone-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone-600">{item.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* You may also like */}
      {related.length > 0 && (
        <section className="border-t border-stone-200 bg-white py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-6">
            <ScrollReveal>
              <div className="mb-14 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-navy-700">Similar homes</span>
                  <h2 className="mt-3 font-serif text-3xl text-stone-900 sm:text-4xl">You may also like</h2>
                </div>
                <button
                  onClick={() => navigate('/properties')}
                  className="text-sm font-medium text-navy-700 transition-colors hover:text-navy-900 hover:underline focus-visible:ring-2 focus-visible:ring-navy-700"
                >
                  View all properties →
                </button>
              </div>
            </ScrollReveal>
            <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" stagger={0.1}>
              {related.map((l) => (
                <StaggerItem key={l.id}>
                  <button
                    onClick={() => navigate(`/listing?id=${l.id}`)}
                    className="group w-full rounded-3xl border border-stone-200/80 bg-white p-3 text-left shadow-soft transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-lift focus-visible:ring-2 focus-visible:ring-navy-700"
                    aria-label={`View ${l.title}, ${l.status}`}
                  >
                    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                      <img
                        src={l.images[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800'}
                        alt={l.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                      />
                      <div className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-stone-900 backdrop-blur-sm">
                        {l.status}
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="font-serif text-xl text-stone-900 transition-colors duration-300 group-hover:text-navy-700">
                        {l.title}
                      </p>
                      <p className="mt-1 text-sm text-stone-500">{l.address}</p>
                      <p className="mt-3 font-serif text-xl text-gold-600">{l.price}</p>
                    </div>
                  </button>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      <section className="bg-navy-950 py-28 lg:py-36">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <ScrollReveal>
            <h2 className="font-serif text-4xl tracking-tight text-white sm:text-5xl">Arrange your private viewing</h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/80">
              See {listing.title} for yourself. Our property consultants are available for in-person and virtual appointments.
            </p>
            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button onClick={() => navigate('/#booking')} size="lg" className="gold px-8 transition-all hover:shadow-glow active:scale-[0.98]">
                <Calendar className="h-4 w-4" aria-hidden="true" />
                Book a viewing
              </Button>
              <a href={`tel:${listing.agent_phone}`}>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 bg-white/10 px-8 text-white transition-all hover:bg-white/20 hover:text-white active:scale-[0.98]"
                >
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  Call {listing.agent_name}
                </Button>
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/98 p-4 backdrop-blur-sm"
          onClick={() => setLightbox(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Image gallery"
        >
          <button
            onClick={(e) => { e.stopPropagation(); setLightbox(false); }}
            aria-label="Close gallery"
            className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white/80 transition-all hover:bg-white/20 hover:text-white focus-visible:ring-2 focus-visible:ring-white/50"
          >
            <X className="h-5 w-5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); prevImage(); }}
            aria-label="Previous image"
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition-all hover:scale-105 hover:bg-white/20 active:scale-95 focus-visible:ring-2 focus-visible:ring-white/50"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <img
            src={images[selectedImage]}
            alt={`${listing.title} — enlarged view ${selectedImage + 1}`}
            className="max-h-[90vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={(e) => { e.stopPropagation(); nextImage(); }}
            aria-label="Next image"
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition-all hover:scale-105 hover:bg-white/20 active:scale-95 focus-visible:ring-2 focus-visible:ring-white/50"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-4 py-1.5 text-sm text-white backdrop-blur-sm">
            {selectedImage + 1} / {images.length}
          </div>
        </div>
      )}
    </div>
  );
}
