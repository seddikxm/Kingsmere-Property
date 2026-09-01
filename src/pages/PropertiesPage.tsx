import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Bath,
  BedDouble,
  Filter,
  Home,
  MapPin,
  Maximize,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useBusinessSettings } from '@/hooks/useBusinessSettings';
import { useBusinessLogo } from '@/hooks/useBusinessLogo';
import { useListings } from '@/hooks/useListing';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ScrollReveal';
import { parsePrice, formatPriceLabel } from '@/lib/utils';
import type { Listing } from '@/types';

const revealEase = [0.32, 0.72, 0, 1] as const;

const statuses = ['For Sale', 'Under Offer', 'Sold', 'Rent'];

function StatPill({ icon: Icon, value, label }: { icon: React.ComponentType<{ className?: string }>; value: string | number; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-sm text-white/90 backdrop-blur-sm">
      <Icon className="h-3.5 w-3.5 text-gold-400" aria-hidden="true" />
      <span className="font-medium text-white">{value}</span>
      <span className="text-white/70">{label}</span>
    </span>
  );
}

function PropertyCard({ listing, index, variant = 'standard' }: { listing: Listing; index: number; variant?: 'standard' | 'lead' }) {
  const navigate = useNavigate();
  const isLead = variant === 'lead';

  return (
    <StaggerItem>
      <article
        className={`group relative cursor-pointer overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-soft transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-lift ${
          isLead ? 'grid lg:grid-cols-2' : ''
        }`}
        onClick={() => navigate(`/listing?id=${listing.id}`)}
        tabIndex={0}
        role="link"
        aria-label={`View ${listing.title}, ${listing.status}, ${formatPriceLabel(listing.price)}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            navigate(`/listing?id=${listing.id}`);
          }
        }}
      >
        {/* Image */}
        <div className={`relative overflow-hidden ${isLead ? 'aspect-[4/3] lg:aspect-auto' : 'aspect-[4/3]'}`}>
          <img
            src={listing.images[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200'}
            alt={`Exterior of ${listing.title}`}
            loading={index < 3 ? 'eager' : 'lazy'}
            className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          <div className="absolute left-5 top-5">
            <span className="rounded-full bg-white/95 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-stone-900 backdrop-blur-sm">
              {listing.status}
            </span>
          </div>
          <div className="absolute right-5 top-5 flex translate-x-4 opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100">
            <span
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-stone-900 shadow-soft backdrop-blur-sm"
              aria-hidden="true"
            >
              <ArrowRight className="h-4 w-4 -rotate-45" />
            </span>
          </div>
        </div>

        {/* Content */}
        <div className={`flex flex-col justify-center ${isLead ? 'p-8 lg:p-12' : 'p-6'}`}>
          {isLead && (
            <span className="mb-4 w-fit rounded-full border border-gold-400/30 bg-gold-50 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-gold-700">
              Editor&apos;s pick
            </span>
          )}
          <h3 className={`font-serif text-stone-900 transition-colors duration-300 group-hover:text-navy-800 ${isLead ? 'text-3xl sm:text-4xl lg:text-4xl' : 'text-2xl'}`}>
            {listing.title}
          </h3>
          <div className="mt-3 flex items-center gap-1.5 text-sm text-stone-500">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-navy-700" aria-hidden="true" />
            <span className="truncate">{listing.address}</span>
          </div>
          <p className={`mt-4 font-serif text-gold-600 ${isLead ? 'text-3xl' : 'text-xl'}`}>{formatPriceLabel(listing.price)}</p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 rounded-xl bg-stone-50 px-3 py-2 text-sm text-stone-600">
              <BedDouble className="h-4 w-4 text-navy-700" aria-hidden="true" />
              {listing.beds} beds
            </span>
            <span className="flex items-center gap-1.5 rounded-xl bg-stone-50 px-3 py-2 text-sm text-stone-600">
              <Bath className="h-4 w-4 text-navy-700" aria-hidden="true" />
              {listing.baths} baths
            </span>
            {listing.sqft && (
              <span className="flex items-center gap-1.5 rounded-xl bg-stone-50 px-3 py-2 text-sm text-stone-600">
                <Maximize className="h-4 w-4 text-navy-700" aria-hidden="true" />
                {listing.sqft} sq ft
              </span>
            )}
          </div>

          {isLead && (
            <Button
              className="gold mt-8 w-fit rounded-full px-8"
              size="lg"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/listing?id=${listing.id}`);
              }}
            >
              View property
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          )}
        </div>
      </article>
    </StaggerItem>
  );
}

function PropertySkeleton() {
  return <div className="h-[420px] animate-pulse rounded-[2rem] bg-stone-200" />;
}

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <ScrollReveal>
      <div className="rounded-[2rem] border border-dashed border-stone-300 bg-white p-12 text-center sm:p-16">
        <div
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-navy-50 text-navy-700"
          aria-hidden="true"
        >
          <Filter className="h-6 w-6" />
        </div>
        <h3 className="mt-6 font-serif text-2xl text-stone-900">No properties match your search</h3>
        <p className="mx-auto mt-2 max-w-md text-stone-600">
          Try adjusting your filters or search terms to see more results.
        </p>
        <Button onClick={onClear} className="mt-6 rounded-full px-6">
          Clear all filters
        </Button>
      </div>
    </ScrollReveal>
  );
}

function FeaturedPropertyCard({ listing }: { listing: Listing }) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.5, ease: revealEase }}
      className="hidden w-full max-w-sm rounded-[2rem] border border-white/20 bg-white/10 p-3 backdrop-blur-xl lg:block"
    >
      <div
        className="group cursor-pointer overflow-hidden rounded-[1.5rem] bg-white shadow-lift transition-all duration-500 hover:-translate-y-1 hover:shadow-soft"
        onClick={() => navigate(`/listing?id=${listing.id}`)}
        tabIndex={0}
        role="link"
        aria-label={`Featured property: ${listing.title}, ${listing.status}, ${formatPriceLabel(listing.price)}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            navigate(`/listing?id=${listing.id}`);
          }
        }}
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={listing.images[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800'}
            alt={`Exterior of ${listing.title}`}
            className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
          />
          <div className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-stone-900 backdrop-blur-sm">
            {listing.status}
          </div>
        </div>
        <div className="p-5">
          <p className="font-serif text-lg text-stone-900 group-hover:text-navy-800">{listing.title}</p>
          <p className="mt-1 text-sm text-stone-500">{listing.address}</p>
          <div className="mt-4 flex items-center justify-between">
            <p className="font-serif text-xl text-gold-600">{formatPriceLabel(listing.price)}</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-100 text-stone-900 transition-colors group-hover:bg-navy-50 group-hover:text-navy-700">
              <ArrowRight className="h-4 w-4 -rotate-45" aria-hidden="true" />
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function PropertiesPage() {
  const navigate = useNavigate();
  const { data: settings } = useBusinessSettings();
  const { data: logo } = useBusinessLogo();
  const { data: listings, isLoading } = useListings();
  const prefersReducedMotion = useReducedMotion();

  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minBeds, setMinBeds] = useState('');
  const [minBaths, setMinBaths] = useState('');
  const [status, setStatus] = useState('all');

  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.6], [0.75, 0.92]);

  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const businessName = settings?.business_name || 'Kingsmere Property';

  const filtered = (listings || []).filter((listing: Listing) => {
    const price = parsePrice(listing.price);
    const matchesSearch =
      listing.title.toLowerCase().includes(search.toLowerCase()) ||
      listing.address.toLowerCase().includes(search.toLowerCase());
    const matchesMinPrice = minPrice ? price >= parseFloat(minPrice) * 1000000 : true;
    const matchesMaxPrice = maxPrice ? price <= parseFloat(maxPrice) * 1000000 : true;
    const matchesBeds = minBeds ? listing.beds >= parseInt(minBeds) : true;
    const matchesBaths = minBaths ? listing.baths >= parseInt(minBaths) : true;
    const matchesStatus = status === 'all' || listing.status.toLowerCase() === status.toLowerCase();
    return matchesSearch && matchesMinPrice && matchesMaxPrice && matchesBeds && matchesBaths && matchesStatus;
  });

  const clearFilters = () => {
    setSearch('');
    setMinPrice('');
    setMaxPrice('');
    setMinBeds('');
    setMinBaths('');
    setStatus('all');
  };

  const activeFiltersCount = [minPrice, maxPrice, minBeds, minBaths].filter(Boolean).length + (status !== 'all' ? 1 : 0);

  const leadListing = filtered[0];
  const remainingListings = filtered.slice(1);

  return (
    <div className="min-h-screen bg-cream">
      {/* Top bar */}
      <div
        className={`fixed top-0 left-0 right-0 z-40 px-6 transition-all duration-300 ${
          scrolled
            ? 'border-b border-stone-200/80 bg-white/90 py-3 shadow-soft backdrop-blur-md'
            : 'border-b border-white/10 bg-transparent py-4'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className={`group flex h-11 items-center gap-2 rounded-full pr-3 text-sm font-medium transition-colors focus-visible:ring-2 ${
              scrolled
                ? 'text-stone-600 hover:text-navy-800 focus-visible:ring-navy-700'
                : 'text-white/80 hover:text-white focus-visible:ring-white/50'
            }`}
            aria-label="Back to home"
          >
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
                scrolled
                  ? 'border-stone-200 bg-stone-100 group-hover:bg-stone-200'
                  : 'border-white/10 bg-white/5 group-hover:bg-white/10'
              }`}
              aria-hidden="true"
            >
              <ArrowLeft className={`h-4 w-4 ${scrolled ? 'text-stone-900' : 'text-white'}`} />
            </span>
            <span className="hidden sm:inline">Back to home</span>
          </button>
          <button
            onClick={() => navigate('/')}
            className={`group flex items-center gap-3 rounded-full pr-3 transition-colors focus-visible:ring-2 ${
              scrolled
                ? 'focus-visible:ring-navy-700'
                : 'focus-visible:ring-white/50'
            }`}
            aria-label="Go to home page"
          >
            {logo?.logo_url ? (
              <img
                src={logo.logo_url}
                alt={businessName}
                className={`h-9 w-9 rounded-xl border object-contain p-1.5 ${
                  scrolled ? 'border-stone-200 bg-white' : 'border-white/10 bg-white'
                }`}
              />
            ) : (
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                  scrolled ? 'bg-stone-100 text-stone-900' : 'bg-white/10 text-white'
                }`}
              >
                <Home className="h-4 w-4" aria-hidden="true" />
              </div>
            )}
            <span className={`hidden text-sm font-semibold sm:inline ${scrolled ? 'text-stone-900' : 'text-white'}`}>
              {businessName}
            </span>
          </button>
        </div>
      </div>

      {/* Hero */}
      <section ref={heroRef} className="relative min-h-screen overflow-hidden pt-20">
        {!prefersReducedMotion ? (
          <>
            <motion.div style={{ y: imageY, scale: imageScale }} className="absolute inset-0">
              <img
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=2400"
                alt="A collection of curated country homes"
                className="h-full w-full object-cover"
              />
            </motion.div>
            <motion.div
              style={{ opacity: overlayOpacity }}
              className="absolute inset-0 bg-gradient-to-r from-navy-950/90 via-navy-900/70 to-navy-900/50"
            />
          </>
        ) : (
          <>
            <div className="absolute inset-0">
              <img
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=2400"
                alt="A collection of curated country homes"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-navy-950/90 via-navy-900/70 to-navy-900/50" />
          </>
        )}

        <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 pb-48 pt-32 lg:pb-40 lg:pt-40">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            {/* Left: headline */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.12, delayChildren: 0.1 },
                },
              }}
              className="lg:col-span-7"
            >
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: revealEase } },
                }}
              >
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/90 backdrop-blur-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold-400" aria-hidden="true" />
                  The Collection
                </span>
              </motion.div>
              <motion.h1
                variants={{
                  hidden: { opacity: 0, y: 24 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: revealEase } },
                }}
                className="mt-6 font-serif text-5xl leading-[0.95] text-white sm:text-6xl lg:text-7xl"
              >
                Homes worth <br />
                <span className="italic text-gold-400">waiting for.</span>
              </motion.h1>
              <motion.p
                variants={{
                  hidden: { opacity: 0, y: 24 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.9, delay: 0.1, ease: revealEase } },
                }}
                className="mt-6 max-w-xl text-lg leading-relaxed text-white/80"
              >
                From country estates to townhouses, browse our carefully selected properties for sale, under offer, and sold.
              </motion.p>
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 24 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.9, delay: 0.2, ease: revealEase } },
                }}
                className="mt-8 flex flex-wrap gap-3"
              >
                {leadListing && (
                  <>
                    <StatPill icon={BedDouble} value={leadListing.beds} label="beds" />
                    <StatPill icon={Bath} value={leadListing.baths} label="baths" />
                    <StatPill icon={Maximize} value={leadListing.sqft} label="sq ft" />
                  </>
                )}
              </motion.div>
            </motion.div>

            {/* Right: featured card */}
            <div className="flex justify-center lg:col-span-5 lg:justify-end">
              {leadListing && <FeaturedPropertyCard listing={leadListing} />}
            </div>
          </div>
        </div>

        {/* Filter strip */}
        <div className="absolute bottom-0 left-0 right-0 z-20 border-t border-white/10 bg-navy-950/80 px-6 py-4 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" aria-hidden="true" />
              <Input
                placeholder="Search by title, location or keyword..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-12 rounded-xl border-white/10 bg-white/10 pl-12 text-base text-white placeholder:text-white/40 focus:bg-white/15 focus-visible:ring-white/30"
                aria-label="Search properties"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3 overflow-x-auto pb-1 sm:pb-0">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="h-12 flex-shrink-0 rounded-xl border border-white/10 bg-white/10 px-4 text-sm text-white focus:border-white/20 focus:outline-none"
                  aria-label="Filter by status"
                >
                  <option value="all" className="text-stone-900">All statuses</option>
                  {statuses.map((s) => (
                    <option key={s} value={s.toLowerCase()} className="text-stone-900">
                      {s}
                    </option>
                  ))}
                </select>

                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  aria-expanded={showFilters}
                  aria-controls="filter-panel"
                  className="h-12 flex-shrink-0 rounded-xl border-white/10 bg-white/10 px-5 text-white hover:bg-white/15 hover:text-white"
                >
                  <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-gold-500 text-[10px] font-semibold text-white">
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>

                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    onClick={clearFilters}
                    className="h-12 flex-shrink-0 text-white/70 hover:bg-white/10 hover:text-white"
                  >
                    <X className="mr-1 h-4 w-4" aria-hidden="true" />
                    Clear
                  </Button>
                )}
              </div>

              <p className="hidden whitespace-nowrap text-sm text-white/60 lg:block">
                {isLoading ? 'Loading…' : `${filtered.length} ${filtered.length === 1 ? 'property' : 'properties'}`}
              </p>
            </div>
          </div>

          {/* Expanded filter panel */}
          {showFilters && (
            <motion.div
              id="filter-panel"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mx-auto mt-4 grid max-w-7xl gap-4 border-t border-white/10 pt-4 sm:grid-cols-2 lg:grid-cols-4"
            >
              <div>
                <Label htmlFor="min-price" className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-white/60">
                  Min price (£m)
                </Label>
                <Input
                  id="min-price"
                  type="number"
                  step="0.1"
                  min="0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="0.5"
                  className="h-11 rounded-xl border-white/10 bg-white/10 text-white placeholder:text-white/40 focus:bg-white/15"
                  aria-label="Minimum price in millions"
                />
              </div>
              <div>
                <Label htmlFor="max-price" className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-white/60">
                  Max price (£m)
                </Label>
                <Input
                  id="max-price"
                  type="number"
                  step="0.1"
                  min="0"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="5"
                  className="h-11 rounded-xl border-white/10 bg-white/10 text-white placeholder:text-white/40 focus:bg-white/15"
                  aria-label="Maximum price in millions"
                />
              </div>
              <div>
                <Label htmlFor="min-beds" className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-white/60">
                  Min beds
                </Label>
                <Input
                  id="min-beds"
                  type="number"
                  min="0"
                  value={minBeds}
                  onChange={(e) => setMinBeds(e.target.value)}
                  placeholder="2"
                  className="h-11 rounded-xl border-white/10 bg-white/10 text-white placeholder:text-white/40 focus:bg-white/15"
                />
              </div>
              <div>
                <Label htmlFor="min-baths" className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-white/60">
                  Min baths
                </Label>
                <Input
                  id="min-baths"
                  type="number"
                  min="0"
                  value={minBaths}
                  onChange={(e) => setMinBaths(e.target.value)}
                  placeholder="1"
                  className="h-11 rounded-xl border-white/10 bg-white/10 text-white placeholder:text-white/40 focus:bg-white/15"
                />
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Results */}
      <main className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
        {/* Section header */}
        <ScrollReveal>
          <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-navy-700">Collection</span>
              <h2 className="mt-2 font-serif text-3xl text-stone-900 sm:text-4xl">Featured properties</h2>
            </div>
            <p className="text-sm text-stone-500">
              {isLoading ? 'Loading properties…' : `${filtered.length} ${filtered.length === 1 ? 'result' : 'results'} found`}
            </p>
          </div>
        </ScrollReveal>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2">
            {[...Array(5)].map((_, i) => (
              <PropertySkeleton key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState onClear={clearFilters} />
        ) : (
          <div className="space-y-6">
            {/* Lead property */}
            {leadListing && <PropertyCard listing={leadListing} index={0} variant="lead" />}

            {/* Remaining properties — asymmetric 2-column grid */}
            {remainingListings.length > 0 && (
              <StaggerContainer className="grid gap-6 sm:grid-cols-2" stagger={0.1}>
                {remainingListings.map((listing: Listing, idx: number) => (
                  <PropertyCard key={listing.id} listing={listing} index={idx + 1} />
                ))}
              </StaggerContainer>
            )}
          </div>
        )}
      </main>

      {/* Bottom CTA */}
      <section className="relative overflow-hidden bg-navy-950 py-24 lg:py-32">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=2400"
            alt=""
            className="h-full w-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950/90 via-navy-900/80 to-navy-900/60" />
        </div>
        <div className="grain-overlay absolute inset-0 opacity-40" />
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <ScrollReveal>
            <h2 className="font-serif text-4xl text-white sm:text-5xl">Can&apos;t find what you&apos;re looking for?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-white/80">
              Our property consultants can help you discover off-market opportunities and guide you through every step of the buying process.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button onClick={() => navigate('/#booking')} size="lg" className="gold rounded-full px-8">
                Book a consultation
              </Button>
              <Link to="/">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full border-white/30 bg-white/10 px-8 text-white hover:bg-white/20 hover:text-white"
                >
                  Return home
                </Button>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
