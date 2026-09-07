import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Bath, BedDouble, MapPin, Maximize } from 'lucide-react';
import { useListings } from '@/hooks/useListing';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ScrollReveal';
import { formatPriceLabel } from '@/lib/utils';
import type { Listing } from '@/types';

function PropertyCard({ listing, index }: { listing: Listing; index: number }) {
  const navigate = useNavigate();

  return (
    <StaggerItem>
      <article
        className="group relative cursor-pointer rounded-[2rem] border border-stone-200 bg-white shadow-soft transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-lift"
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
        <div className="relative aspect-[4/3] overflow-hidden rounded-t-[2rem]">
          <img
            src={listing.images[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200'}
            alt={`Exterior of ${listing.title}`}
            loading={index < 2 ? 'eager' : 'lazy'}
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

        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h3 className="font-serif text-2xl text-stone-900 transition-colors duration-300 group-hover:text-navy-800">
                {listing.title}
              </h3>
              <div className="mt-2 flex items-center gap-1.5 text-sm text-stone-500">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-navy-700" aria-hidden="true" />
                <span className="truncate">{listing.address}</span>
              </div>
            </div>
            <p className="flex-shrink-0 font-serif text-xl text-gold-600">{formatPriceLabel(listing.price)}</p>
          </div>

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
        </div>
      </article>
    </StaggerItem>
  );
}

function PropertySkeleton() {
  return <div className="h-[420px] animate-pulse rounded-[2rem] bg-stone-200" />;
}

export function FeaturedProperties() {
  const { data: listings, isLoading } = useListings();
  const featured = (listings || []).slice(0, 3);

  return (
    <section id="properties" className="relative bg-cream py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <ScrollReveal>
          <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <span className="text-sm font-semibold uppercase tracking-wider text-navy-700">Featured Properties</span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
                A curated selection of properties
              </h2>
              <p className="mt-4 text-lg text-stone-600">
                Explore hand-picked country homes, townhouses, and estates currently available.
              </p>
            </div>
            <Link
              to="/properties"
              className="text-sm font-medium text-navy-700 transition-colors hover:text-navy-900 hover:underline focus-visible:ring-2 focus-visible:ring-navy-700"
            >
              View all properties →
            </Link>
          </div>
        </ScrollReveal>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <PropertySkeleton key={i} />
            ))}
          </div>
        ) : featured.length === 0 ? (
          <ScrollReveal>
            <div className="rounded-[2rem] border border-dashed border-stone-300 bg-white p-12 text-center">
              <h3 className="text-2xl font-bold text-stone-900">No properties available</h3>
              <p className="mx-auto mt-2 max-w-md text-stone-600">
                Check back soon for new listings or browse the full collection.
              </p>
              <Link
                to="/properties"
                className="mt-6 inline-block text-sm font-medium text-navy-700 transition-colors hover:text-navy-900 hover:underline"
              >
                View all properties →
              </Link>
            </div>
          </ScrollReveal>
        ) : (
          <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" stagger={0.1}>
            {featured.map((listing: Listing, idx: number) => (
              <PropertyCard key={listing.id} listing={listing} index={idx} />
            ))}
          </StaggerContainer>
        )}
      </div>
    </section>
  );
}
