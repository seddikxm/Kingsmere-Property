import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Bath, BedDouble, List, Map as MapIcon, MapPin, RotateCcw, Search } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { useListings } from '@/hooks/useListing';
import { useGeocoding } from '@/hooks/useGeocoding';
import { PropertyMap } from '@/components/admin/PropertyMap';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import type { Listing } from '@/types';

function parsePrice(price: string): number {
  const digits = price.replace(/[^0-9.]/g, '');
  return digits ? parseFloat(digits) : 0;
}

const PRICE_BANDS = [
  { value: 'any', label: 'Any price', test: () => true },
  { value: 'under-500k', label: 'Under £500k', test: (p: number) => p > 0 && p < 500000 },
  { value: '500k-1m', label: '£500k – £1M', test: (p: number) => p >= 500000 && p < 1000000 },
  { value: '1m-2m', label: '£1M – £2M', test: (p: number) => p >= 1000000 && p < 2000000 },
  { value: 'over-2m', label: 'Over £2M', test: (p: number) => p >= 2000000 },
];

const BED_OPTIONS = [
  { value: 'any', label: 'Any beds' },
  { value: '2', label: '2+ beds' },
  { value: '3', label: '3+ beds' },
  { value: '4', label: '4+ beds' },
  { value: '5', label: '5+ beds' },
];

function ListingCard({ listing, index }: { listing: Listing; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.4), ease: [0.32, 0.72, 0, 1] }}
    >
      <Card className="group overflow-hidden">
        <div className="relative h-44 overflow-hidden">
          {listing.images[0] ? (
            <img
              src={listing.images[0]}
              alt={listing.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-navy-100">
              <MapPin className="h-8 w-8 text-navy-400" />
            </div>
          )}
          <Badge className="absolute left-3 top-3">{listing.status}</Badge>
        </div>
        <CardContent className="p-4">
          <p className="text-lg font-bold tracking-tight text-navy-800">{listing.price}</p>
          <p className="mt-0.5 font-semibold text-stone-900">{listing.title}</p>
          <p className="mt-1 flex items-start gap-1 text-xs text-stone-500">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-600" />
            {listing.address}
          </p>
          <div className="mt-3 flex items-center gap-4 border-t border-stone-100 pt-3 text-xs text-stone-600">
            <span className="flex items-center gap-1.5">
              <BedDouble className="h-3.5 w-3.5 text-gold-600" />
              {listing.beds} beds
            </span>
            <span className="flex items-center gap-1.5">
              <Bath className="h-3.5 w-3.5 text-gold-600" />
              {listing.baths} baths
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function PropertyMapPage() {
  const { data: listings, isLoading } = useListings();
  const [view, setView] = useState<'map' | 'list'>('map');
  const [status, setStatus] = useState('all');
  const [priceBand, setPriceBand] = useState('any');
  const [minBeds, setMinBeds] = useState('any');
  const [search, setSearch] = useState('');

  const addresses = useMemo(() => (listings ?? []).map((l) => l.address), [listings]);
  const { coords, pending } = useGeocoding(addresses);

  const statuses = useMemo(
    () => (listings ? [...new Set(listings.map((l) => l.status))] : []),
    [listings],
  );

  const filtered = useMemo(() => {
    if (!listings) return [];
    const band = PRICE_BANDS.find((b) => b.value === priceBand) ?? PRICE_BANDS[0];
    const term = search.trim().toLowerCase();
    return listings.filter((l) => {
      if (status !== 'all' && l.status !== status) return false;
      if (!band.test(parsePrice(l.price))) return false;
      if (minBeds !== 'any' && l.beds < Number(minBeds)) return false;
      if (term && !`${l.title} ${l.address}`.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [listings, status, priceBand, minBeds, search]);

  const mappedCount = filtered.filter((l) => coords[l.address]).length;

  const resetFilters = () => {
    setStatus('all');
    setPriceBand('any');
    setMinBeds('any');
    setSearch('');
  };

  const hasFilters = status !== 'all' || priceBand !== 'any' || minBeds !== 'any' || search.trim() !== '';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
        >
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-gold-600">Insights</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
            Property Map
          </h1>
          <p className="mt-2 text-stone-600">Explore every listing on the map.</p>
        </motion.div>
        <div className="flex items-center gap-1 self-start rounded-full border border-stone-200 bg-white p-1 shadow-soft">
          <button
            onClick={() => setView('list')}
            className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-300 ${
              view === 'list' ? 'bg-navy-800 text-white shadow-soft' : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <List className="h-4 w-4" />
            List
          </button>
          <button
            onClick={() => setView('map')}
            className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-300 ${
              view === 'map' ? 'bg-navy-800 text-white shadow-soft' : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <MapIcon className="h-4 w-4" />
            Map
          </button>
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <Input
              placeholder="Search by title or address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
          <Select value={priceBand} onChange={(e) => setPriceBand(e.target.value)}>
            {PRICE_BANDS.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </Select>
          <Select value={minBeds} onChange={(e) => setMinBeds(e.target.value)}>
            {BED_OPTIONS.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </Select>
          {hasFilters && (
            <Button variant="outline" onClick={resetFilters}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-navy-800 px-3 py-1 text-xs font-medium text-white">
          <MapPin className="h-3.5 w-3.5 text-gold-400" />
          {view === 'map' ? `${mappedCount} of ${filtered.length} shown on map` : `${filtered.length} listings`}
        </span>
        {pending > 0 && (
          <span className="inline-flex items-center gap-2 rounded-full bg-gold-100 px-3 py-1 text-xs font-medium text-gold-800">
            <span className="h-2 w-2 animate-pulse rounded-full bg-gold-500" />
            Mapping addresses… {pending} remaining
          </span>
        )}
      </div>

      {isLoading ? (
        view === 'map' ? (
          <Skeleton className="h-[560px] w-full rounded-2xl lg:h-[calc(100vh-300px)]" />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-72 w-full rounded-2xl" />
            ))}
          </div>
        )
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-stone-100">
              <Search className="h-6 w-6 text-stone-400" />
            </div>
            <p className="mt-4 font-semibold text-stone-900">No listings match your filters</p>
            <p className="mt-1 text-sm text-stone-500">Try broadening your search criteria.</p>
            {hasFilters && (
              <Button variant="outline" className="mt-5" onClick={resetFilters}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : view === 'map' ? (
        <div className="overflow-hidden rounded-2xl border border-stone-200 shadow-soft">
          <PropertyMap
            listings={filtered}
            coords={coords}
            className="h-[560px] min-h-[480px] lg:h-[calc(100vh-300px)]"
          />
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((listing, i) => (
            <ListingCard key={listing.id} listing={listing} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
