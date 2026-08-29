import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useBusinessSettings } from '@/hooks/useBusinessSettings';
import { useBusinessLogo } from '@/hooks/useBusinessLogo';
import { useListing, useListings } from '@/hooks/useListing';

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

function parsePrice(price: string) {
  const num = parseFloat(price.replace(/[^0-9.]/g, ''));
  return isNaN(num) ? 0 : num;
}

function AnimatedSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
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
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'} ${className}`}
    >
      {children}
    </div>
  );
}

export function ListingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const listingId = searchParams.get('id');
  const { data: settings } = useBusinessSettings();
  const { data: logo } = useBusinessLogo();
  const { data: listing, isLoading } = useListing(listingId);
  const [selectedImage, setSelectedImage] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const businessName = settings?.business_name || 'Kingsmere Property';
  const { data: allListings } = useListings();
  const related = (allListings || [])
    .filter((l) => l.id !== listing?.id)
    .slice(0, 3);

  const [homePrice, setHomePrice] = useState(() => parsePrice(listing?.price || '0'));
  const [deposit, setDeposit] = useState(() => Math.round(parsePrice(listing?.price || '0') * 0.2));
  const [rate, setRate] = useState(4.5);
  const [term, setTerm] = useState(25);

  useEffect(() => {
    if (listing?.price) {
      const price = parsePrice(listing.price);
      setHomePrice(price);
      setDeposit(Math.round(price * 0.2));
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

  useEffect(() => {
    if (listing && listing.images.length > 0) {
      setSelectedImage(0);
    }
  }, [listing]);

  const nextImage = () => {
    if (!listing) return;
    setSelectedImage((prev) => (prev + 1) % listing.images.length);
  };

  const prevImage = () => {
    if (!listing) return;
    setSelectedImage((prev) => (prev - 1 + listing.images.length) % listing.images.length);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <p className="text-stone-500">Loading listing...</p>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-6">
        <p className="text-stone-600">No listing available.</p>
        <button onClick={() => navigate('/')} className="mt-4 text-navy-700 hover:underline">
          Back to home
        </button>
      </div>
    );
  }

  const images = listing.images.length > 0 ? listing.images : ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=2400'];

  return (
    <div className="min-h-screen bg-cream">
      {/* Top bar */}
      <div className="sticky top-0 z-40 border-b border-stone-200 bg-white/90 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm font-medium text-stone-600 transition-colors hover:text-navy-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </button>
          <div className="flex items-center gap-3">
            {logo?.logo_url ? (
              <img src={logo.logo_url} alt={businessName} className="h-8 w-8 rounded-lg object-contain" />
            ) : (
              <Home className="h-5 w-5 text-navy-800" />
            )}
            <span className="hidden text-sm font-semibold text-stone-900 sm:inline">{businessName}</span>
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="relative h-[70vh] min-h-[520px] overflow-hidden">
        <img
          src={images[selectedImage]}
          alt={listing.title}
          className="h-full w-full object-cover transition-transform duration-1000 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-navy-900/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-950/50 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-6 pb-10 lg:pb-16">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-white/90 backdrop-blur-sm">
                  {listing.status}
                </div>
                <h1 className="font-serif text-5xl font-medium italic text-white sm:text-6xl lg:text-7xl">
                  {listing.title}
                </h1>
                {listing.subtitle && <p className="mt-2 text-lg text-white/80">{listing.subtitle}</p>}
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={prevImage}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-sm transition-all hover:bg-white/20"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-sm transition-all hover:bg-white/20"
                >
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute right-6 bottom-6 hidden rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-md lg:block">
          <p className="text-xs uppercase tracking-wider text-white/60">Guide price</p>
          <p className="font-serif text-3xl text-white">{listing.price}</p>
        </div>
      </section>

      {/* Thumbnail strip */}
      <div className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex gap-3 overflow-x-auto pb-1">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`relative h-20 w-28 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                  selectedImage === idx ? 'border-navy-700' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`View ${idx + 1}`} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-6 py-16 lg:py-24">
        <div className="grid gap-16 lg:grid-cols-12">
          {/* Left column */}
          <div className="lg:col-span-8">
            {/* Key stats */}
            <AnimatedSection>
              <div className="mb-12 grid grid-cols-2 gap-4 border-b border-stone-200 pb-12 sm:grid-cols-4">
                {[
                  { icon: BedDouble, value: listing.beds, label: 'Bedrooms' },
                  { icon: Bath, value: listing.baths, label: 'Bathrooms' },
                  { icon: Maximize, value: listing.sqft, label: 'Sq Ft' },
                  { icon: Trees, value: `${listing.acres} ac`, label: 'Land' },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-stone-200 bg-white p-5 text-center transition-all duration-300 hover:shadow-soft"
                  >
                    <stat.icon className="mx-auto mb-2 h-6 w-6 text-navy-700" />
                    <p className="font-serif text-2xl text-stone-900">{stat.value}</p>
                    <p className="text-xs uppercase tracking-wider text-stone-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </AnimatedSection>

            {/* Description */}
            <AnimatedSection>
              <div className="mb-12">
                <h2 className="mb-6 font-serif text-3xl text-stone-900">About this property</h2>
                <div className="space-y-5 text-lg leading-relaxed text-stone-600">
                  {listing.description.split('\n\n').map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </AnimatedSection>

            {/* Features */}
            <AnimatedSection>
              <div className="mb-12 rounded-3xl bg-navy-900 p-8 text-white lg:p-10">
                <h3 className="mb-6 font-serif text-2xl">Key features</h3>
                <ul className="grid gap-4 sm:grid-cols-2">
                  {listing.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-gold-400" />
                      <span className="text-white/90">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedSection>

            {/* Amenities */}
            <AnimatedSection>
              <div className="mb-12">
                <h2 className="mb-8 font-serif text-3xl text-stone-900">Amenities</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {listing.amenities.map((amenity) => {
                    const Icon = iconMap[amenity.icon] || Home;
                    return (
                      <div
                        key={amenity.label}
                        className="group flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-4 transition-all duration-300 hover:border-navy-200 hover:shadow-soft"
                      >
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-stone-100 text-navy-700 transition-colors group-hover:bg-navy-50">
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="font-medium text-stone-900">{amenity.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </AnimatedSection>

            {/* Gallery */}
            <AnimatedSection>
              <div>
                <h2 className="mb-8 font-serif text-3xl text-stone-900">Gallery</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => { setSelectedImage(idx); setLightbox(true); }}
                      className={`group relative aspect-[4/3] overflow-hidden rounded-2xl ${idx === 0 ? 'sm:col-span-2 sm:aspect-[21/9]' : ''}`}
                    >
                      <img src={img} alt={`Interior ${idx + 1}`} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />
                    </button>
                  ))}
                </div>
              </div>
            </AnimatedSection>
          </div>

          {/* Right column */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              {/* Price card */}
              <AnimatedSection>
                <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-soft">
                  <p className="text-xs uppercase tracking-wider text-stone-500">Guide price</p>
                  <p className="mt-1 font-serif text-4xl text-stone-900">{listing.price}</p>
                  <div className="mt-4 flex items-start gap-2 text-sm text-stone-600">
                    <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-navy-700" />
                    <span>{listing.address}</span>
                  </div>
                  <div className="mt-6 flex flex-col gap-3">
                    <Button onClick={() => navigate('/#booking')} size="lg" className="gold w-full">
                      <Calendar className="h-4 w-4" />
                      Book a viewing
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => window.print()}>
                      Download brochure
                    </Button>
                  </div>
                </div>
              </AnimatedSection>

              {/* Agent card */}
              <AnimatedSection>
                <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-soft">
                  <p className="text-xs uppercase tracking-wider text-stone-500">Property agent</p>
                  <div className="mt-4 flex items-center gap-4">
                    {listing.agent_image && (
                      <img
                        src={listing.agent_image}
                        alt={listing.agent_name}
                        className="h-16 w-16 rounded-full object-cover"
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
                      className="flex items-center gap-3 rounded-xl bg-stone-50 p-3 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-100"
                    >
                      <Phone className="h-4 w-4 text-navy-700" />
                      {listing.agent_phone}
                    </a>
                    <a
                      href={`mailto:${listing.agent_email}`}
                      className="flex items-center gap-3 rounded-xl bg-stone-50 p-3 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-100"
                    >
                      <Mail className="h-4 w-4 text-navy-700" />
                      {listing.agent_email}
                    </a>
                  </div>
                </div>
              </AnimatedSection>

              {/* Location note */}
              <AnimatedSection>
                <div className="rounded-3xl border border-stone-200 bg-stone-50 p-6">
                  <h3 className="mb-2 font-serif text-lg text-stone-900">Location</h3>
                  <p className="text-sm leading-relaxed text-stone-600">
                    {listing.address}. Situated in a sought-after area with excellent local amenities and transport links.
                  </p>
                </div>
              </AnimatedSection>

              {/* Mortgage calculator */}
              <AnimatedSection>
                <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-soft">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-50 text-navy-700">
                      <Calculator className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-serif text-lg text-stone-900">Mortgage estimate</p>
                      <p className="text-xs text-stone-500">Indicative monthly repayment</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="price" className="text-xs uppercase tracking-wider text-stone-500">Property price (£)</Label>
                      <Input
                        id="price"
                        type="number"
                        value={homePrice}
                        onChange={(e) => setHomePrice(parseFloat(e.target.value) || 0)}
                        className="mt-1"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="deposit" className="text-xs uppercase tracking-wider text-stone-500">Deposit (£)</Label>
                        <Input
                          id="deposit"
                          type="number"
                          value={deposit}
                          onChange={(e) => setDeposit(parseFloat(e.target.value) || 0)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="rate" className="text-xs uppercase tracking-wider text-stone-500">Rate (%)</Label>
                        <Input
                          id="rate"
                          type="number"
                          step="0.1"
                          value={rate}
                          onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="term" className="text-xs uppercase tracking-wider text-stone-500">Term (years)</Label>
                      <Input
                        id="term"
                        type="number"
                        value={term}
                        onChange={(e) => setTerm(parseInt(e.target.value) || 0)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div className="mt-5 rounded-2xl bg-navy-900 p-5 text-white">
                    <p className="text-xs uppercase tracking-wider text-white/60">Estimated monthly payment</p>
                    <p className="mt-1 font-serif text-3xl">£{monthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                    <p className="mt-2 text-xs leading-relaxed text-white/70">
                      Based on a £{loan.toLocaleString()} loan over {term} years at {rate}% interest. This is for guidance only; speak to a mortgage adviser for a tailored quote.
                    </p>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </main>

      {/* Floor plan */}
      <section className="border-t border-stone-200 bg-white py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <AnimatedSection>
            <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-navy-700">Layout</span>
                <h2 className="mt-2 font-serif text-3xl text-stone-900 sm:text-4xl">Floor plan</h2>
              </div>
              <p className="max-w-md text-sm text-stone-600">Approximate floor plan for illustration. Schedule a viewing to experience the layout in person.</p>
            </div>
          </AnimatedSection>
          <AnimatedSection>
            <div className="relative overflow-hidden rounded-3xl border border-stone-200 bg-stone-50 p-2 shadow-soft">
              <img
                src="https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&q=80&w=2400"
                alt="Floor plan"
                className="w-full rounded-2xl object-cover"
              />
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Virtual tour */}
      <section className="relative overflow-hidden bg-navy-950 py-24 lg:py-32">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=2400"
            alt="Interior"
            className="h-full w-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950/90 via-navy-900/80 to-navy-900/60" />
        </div>
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <AnimatedSection>
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-sm">
              <Play className="h-6 w-6 fill-white" />
            </div>
            <h2 className="font-serif text-4xl text-white sm:text-5xl">Take the virtual tour</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-white/80">
              Walk through the property room by room before arranging your private viewing.
            </p>
            <Button className="mt-8 gold px-8" size="lg">
              <Play className="h-4 w-4" />
              Play virtual tour
            </Button>
          </AnimatedSection>
        </div>
      </section>

      {/* Neighbourhood */}
      <section className="bg-cream py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <AnimatedSection>
            <div className="mb-12 max-w-2xl">
              <span className="text-xs font-semibold uppercase tracking-wider text-navy-700">Neighbourhood</span>
              <h2 className="mt-2 font-serif text-3xl text-stone-900 sm:text-4xl">A well-connected country setting</h2>
              <p className="mt-4 text-stone-600">
                The property sits on the edge of Newbury, with the town centre, mainline station, and countryside walks all within easy reach.
              </p>
            </div>
          </AnimatedSection>
          <AnimatedSection>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: Compass, title: 'Town centre', desc: '5 minutes by car' },
                { icon: Train, title: 'Newbury station', desc: 'London Paddington in 1 hour' },
                { icon: School, title: 'Schools', desc: 'Independent & state options nearby' },
                { icon: Coffee, title: 'High Street', desc: 'Shops, cafés & restaurants' },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-3xl border border-stone-200 bg-white p-6 transition-all duration-300 hover:shadow-soft"
                >
                  <item.icon className="h-8 w-8 text-navy-700" />
                  <h3 className="mt-4 font-serif text-lg text-stone-900">{item.title}</h3>
                  <p className="mt-2 text-sm text-stone-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* You may also like */}
      {related.length > 0 && (
        <section className="border-t border-stone-200 bg-white py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-6">
            <AnimatedSection>
              <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-navy-700">Similar homes</span>
                  <h2 className="mt-2 font-serif text-3xl text-stone-900 sm:text-4xl">You may also like</h2>
                </div>
                <button
                  onClick={() => navigate('/properties')}
                  className="text-sm font-medium text-navy-700 transition-colors hover:text-navy-900 hover:underline"
                >
                  View all properties →
                </button>
              </div>
            </AnimatedSection>
            <AnimatedSection>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((l, idx) => (
                  <button
                    key={l.id}
                    onClick={() => navigate(`/listing?id=${l.id}`)}
                    className="group rounded-3xl border border-stone-200 bg-white p-3 text-left shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                      <img
                        src={l.images[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800'}
                        alt={l.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-stone-900 backdrop-blur-sm">
                        {l.status}
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="font-serif text-xl text-stone-900 group-hover:text-navy-700 transition-colors">{l.title}</p>
                      <p className="mt-1 text-sm text-stone-500">{l.address}</p>
                      <p className="mt-3 font-serif text-xl text-gold-600">{l.price}</p>
                    </div>
                  </button>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      <section className="bg-navy-900 py-20 lg:py-28">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <AnimatedSection>
            <h2 className="font-serif text-4xl text-white sm:text-5xl">Arrange your private viewing</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-white/80">
              See {listing.title} for yourself. Our property consultants are available for in-person and virtual appointments.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button onClick={() => navigate('/#booking')} size="lg" className="gold px-8">
                <Calendar className="h-4 w-4" />
                Book a viewing
              </Button>
              <a href={`tel:${listing.agent_phone}`}>
                <Button size="lg" variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white px-8">
                  <Phone className="h-4 w-4" />
                  Call {listing.agent_name}
                </Button>
              </a>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/95 p-4"
          onClick={() => setLightbox(false)}
        >
          <button
            onClick={(e) => { e.stopPropagation(); prevImage(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <img
            src={images[selectedImage]}
            alt={listing.title}
            className="max-h-[90vh] max-w-[90vw] rounded-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={(e) => { e.stopPropagation(); nextImage(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            <ArrowRight className="h-6 w-6" />
          </button>
          <button
            onClick={() => setLightbox(false)}
            className="absolute right-4 top-4 text-sm font-medium text-white/70 hover:text-white"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
