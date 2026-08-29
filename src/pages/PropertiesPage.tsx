import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import { useBusinessSettings } from '@/hooks/useBusinessSettings';
import { useBusinessLogo } from '@/hooks/useBusinessLogo';
import { useListings } from '@/hooks/useListing';
import type { Listing } from '@/types';

const revealEase = 'cubic-bezier(0.32, 0.72, 0, 1)';

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

function Reveal({
  children,
  className = '',
  delay = 0,
  as: Component = 'div',
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: keyof React.JSX.IntrinsicElements;
}) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  const Comp = Component as any;
  return (
    <Comp
      ref={ref}
      style={{ transitionDelay: `${delay}ms`, transitionTimingFunction: revealEase }}
      className={`transition-all duration-700 ${visible ? 'translate-y-0 opacity-100 blur-0' : 'translate-y-14 opacity-0 blur-sm'} ${className}`}
    >
      {children}
    </Comp>
  );
}

function parsePrice(price: string) {
  const num = parseFloat(price.replace(/[^0-9.]/g, ''));
  return isNaN(num) ? 0 : num;
}

function formatPriceLabel(price: string) {
  const num = parsePrice(price);
  if (num >= 1000000) return `£${(num / 1000000).toFixed(2).replace(/\.00$/, '')}m`;
  if (num >= 1000) return `£${(num / 1000).toFixed(0)}k`;
  return price || 'Price on application';
}

const statuses = ['For Sale', 'Under Offer', 'Sold', 'Rent'];

function PropertyCard({ listing }: { listing: Listing }) {
  const navigate = useNavigate();

  return (
    <div
      className="group cursor-pointer"
      onClick={() => navigate(`/listing?id=${listing.id}`)}
    >
      <div className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-soft transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-2 hover:shadow-lift">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={listing.images[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200'}
            alt={listing.title}
            className="h-full w-full object-cover transition-transform duration-1000 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/30 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          <div className="absolute left-5 top-5">
            <span className="rounded-full bg-white/95 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-stone-900 backdrop-blur-sm">
              {listing.status}
            </span>
          </div>
          <div className="absolute right-5 top-5 flex translate-x-4 opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-stone-900 shadow-soft backdrop-blur-sm">
              <ArrowRight className="h-4 w-4 -rotate-45" />
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-serif text-2xl text-stone-900 transition-colors duration-300 group-hover:text-navy-800">
                {listing.title}
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-sm text-stone-500">
                <MapPin className="h-3.5 w-3.5 text-navy-700" />
                <span>{listing.address}</span>
              </div>
            </div>
            <p className="flex-shrink-0 font-serif text-xl text-gold-600">
              {formatPriceLabel(listing.price)}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 rounded-xl bg-stone-50 px-3 py-2 text-sm text-stone-600">
              <BedDouble className="h-4 w-4 text-navy-700" />
              {listing.beds} beds
            </span>
            <span className="flex items-center gap-1.5 rounded-xl bg-stone-50 px-3 py-2 text-sm text-stone-600">
              <Bath className="h-4 w-4 text-navy-700" />
              {listing.baths} baths
            </span>
            {listing.sqft && (
              <span className="flex items-center gap-1.5 rounded-xl bg-stone-50 px-3 py-2 text-sm text-stone-600">
                <Maximize className="h-4 w-4 text-navy-700" />
                {listing.sqft}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function PropertiesPage() {
  const navigate = useNavigate();
  const { data: settings } = useBusinessSettings();
  const { data: logo } = useBusinessLogo();
  const { data: listings, isLoading } = useListings();
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minBeds, setMinBeds] = useState('');
  const [minBaths, setMinBaths] = useState('');
  const [status, setStatus] = useState('all');
  const { ref: heroRef, visible: heroVisible } = useReveal<HTMLDivElement>();

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

  return (
    <div className="min-h-screen bg-cream">
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-40 border-b border-stone-200/80 bg-white/90 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="group flex items-center gap-2 text-sm font-medium text-stone-600 transition-colors hover:text-navy-800"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 transition-colors group-hover:bg-stone-200">
              <ArrowLeft className="h-4 w-4" />
            </span>
            <span className="hidden sm:inline">Back to home</span>
          </button>
          <div className="flex items-center gap-3">
            {logo?.logo_url ? (
              <img src={logo.logo_url} alt={businessName} className="h-9 w-9 rounded-xl border border-stone-200 bg-white object-contain p-1.5" />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy-900 text-white">
                <Home className="h-4 w-4" />
              </div>
            )}
            <span className="hidden text-sm font-semibold text-stone-900 sm:inline">{businessName}</span>
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="relative min-h-[70vh] overflow-hidden pt-20 lg:min-h-[75vh]">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=2400"
            alt="Properties"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-navy-950/80 via-navy-900/60 to-navy-950/40" />
        </div>

        <div className="relative z-10 mx-auto flex min-h-[70vh] max-w-7xl flex-col justify-center px-6 pb-24 pt-32 lg:min-h-[75vh] lg:pb-32 lg:pt-40">
          <div
            ref={heroRef}
            style={{ transitionTimingFunction: revealEase }}
            className={`transition-all duration-1000 ${heroVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'}`}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/90 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />
              Properties
            </span>
            <h1 className="mt-6 max-w-3xl font-serif text-5xl text-white sm:text-6xl lg:text-7xl">
              A curated collection of homes
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/80">
              From country estates to townhouses, browse our carefully selected properties for sale, under offer, and sold.
            </p>
          </div>
        </div>
      </section>

      {/* Floating search & filter bar */}
      <section className="relative z-20 -mt-16 px-6 lg:-mt-20">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <div className="overflow-hidden rounded-[2rem] border border-white/50 bg-white/95 p-2 shadow-lift backdrop-blur-xl">
              <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                  <Input
                    placeholder="Search by title, location or keyword..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-13 rounded-2xl border-stone-200 bg-stone-50 pl-12 text-base placeholder:text-stone-400 focus:bg-white"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="h-13 rounded-2xl border-stone-200 px-5 text-stone-700 hover:bg-stone-50 hover:text-stone-900"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-navy-900 text-[10px] font-semibold text-white">
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>
              </div>

              {showFilters && (
                <div className="border-t border-stone-100 p-4 sm:p-6">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <div>
                      <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-stone-500">Min price</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-stone-400">£m</span>
                        <Input
                          type="number"
                          step="0.1"
                          value={minPrice}
                          onChange={(e) => setMinPrice(e.target.value)}
                          placeholder="0.5"
                          className="rounded-xl border-stone-200 pl-10"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-stone-500">Max price</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-stone-400">£m</span>
                        <Input
                          type="number"
                          step="0.1"
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value)}
                          placeholder="5"
                          className="rounded-xl border-stone-200 pl-10"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-stone-500">Min beds</label>
                      <Input
                        type="number"
                        value={minBeds}
                        onChange={(e) => setMinBeds(e.target.value)}
                        placeholder="2"
                        className="rounded-xl border-stone-200"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-stone-500">Min baths</label>
                      <Input
                        type="number"
                        value={minBaths}
                        onChange={(e) => setMinBaths(e.target.value)}
                        placeholder="1"
                        className="rounded-xl border-stone-200"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-stone-500">Status</label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="h-10 w-full rounded-xl border border-stone-200 bg-white px-3 text-sm text-stone-900 focus:border-stone-400 focus:outline-none"
                      >
                        <option value="all">All statuses</option>
                        {statuses.map((s) => (
                          <option key={s} value={s.toLowerCase()}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-4">
                    <p className="text-sm text-stone-500">
                      Showing <span className="font-semibold text-stone-900">{filtered.length}</span> {filtered.length === 1 ? 'property' : 'properties'}
                    </p>
                    <Button variant="ghost" onClick={clearFilters} className="text-stone-500 hover:text-stone-900">
                      <X className="mr-1 h-4 w-4" />
                      Clear filters
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Results */}
      <main className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
        {/* Section header */}
        <Reveal>
          <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-navy-700">Collection</span>
              <h2 className="mt-2 font-serif text-3xl text-stone-900 sm:text-4xl">Featured properties</h2>
            </div>
            <p className="text-sm text-stone-500">
              {isLoading ? 'Loading properties...' : `${filtered.length} ${filtered.length === 1 ? 'result' : 'results'} found`}
            </p>
          </div>
        </Reveal>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-[420px] animate-pulse rounded-[2rem] bg-stone-200"
                style={{ animationDelay: `${i * 80}ms` }}
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Reveal>
            <div className="rounded-[2rem] border border-dashed border-stone-300 bg-white p-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-navy-50 text-navy-700">
                <Filter className="h-6 w-6" />
              </div>
              <h3 className="mt-6 font-serif text-2xl text-stone-900">No properties match your search</h3>
              <p className="mt-2 max-w-md mx-auto text-stone-600">Try adjusting your filters or search terms to see more results.</p>
              <Button onClick={clearFilters} className="mt-6 rounded-full px-6">
                Clear all filters
              </Button>
            </div>
          </Reveal>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((listing: Listing, idx: number) => (
              <Reveal key={listing.id} delay={idx * 100}>
                <PropertyCard listing={listing} />
              </Reveal>
            ))}
          </div>
        )}
      </main>

      {/* Bottom CTA */}
      <section className="relative overflow-hidden bg-navy-950 py-24 lg:py-32">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=2400"
            alt="Interior"
            className="h-full w-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950/90 via-navy-900/80 to-navy-900/60" />
        </div>
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <Reveal>
            <h2 className="font-serif text-4xl text-white sm:text-5xl">Can&apos;t find what you&apos;re looking for?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-white/80">
              Our property consultants can help you discover off-market opportunities and guide you through every step of the buying process.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button onClick={() => navigate('/#booking')} size="lg" className="gold rounded-full px-8">
                Book a consultation
              </Button>
              <Link to="/">
                <Button size="lg" variant="outline" className="rounded-full border-white/30 bg-white/10 px-8 text-white hover:bg-white/20 hover:text-white">
                  Return home
                </Button>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
