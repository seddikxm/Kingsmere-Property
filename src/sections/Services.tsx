import { useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import StackingCards, { StackingCardItem } from '@/components/ui/stacking-cards';
import { useServices } from '@/hooks/useServices';
import { ScrollReveal } from '@/components/ScrollReveal';
import { formatCurrency } from '@/lib/utils';
import type { Service } from '@/types';

interface ServicesProps {
  onSelectService: (service: Service) => void;
}

const SERVICE_IMAGES: Record<string, string> = {
  'Buyer Consultation': 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=800',
  'Seller Consultation': 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800',
  'Property Viewing Appointment': 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800',
  'Home Valuation Consultation': 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&q=80&w=800',
  'Investment Property Consultation': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800',
  'Virtual Real Estate Consultation': 'https://images.unsplash.com/photo-1553877522-0e7743b5e82b?auto=format&fit=crop&q=80&w=800',
};

const CARD_BACKGROUNDS = [
  'bg-navy-800',
  'bg-gold-600',
  'bg-stone-800',
  'bg-navy-900',
  'bg-gold-500',
  'bg-stone-900',
];

export function Services({ onSelectService }: ServicesProps) {
  const { data: services, isLoading } = useServices(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const displayedServices = services?.filter((s) => s.is_active) ?? [];

  return (
    <section id="services" className="relative bg-cream py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <ScrollReveal className="max-w-2xl">
            <span className="text-sm font-semibold uppercase tracking-wider text-navy-700">Real Estate Services</span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
              Consultations designed around your property goals
            </h2>
            <p className="mt-4 text-lg text-stone-600">
              Scroll through our services and book a private, professional appointment tailored to your journey.
            </p>
          </ScrollReveal>
        </div>

        {isLoading && (
          <div className="h-[700px] rounded-3xl border border-stone-200 bg-white p-6">
            <Skeleton className="h-full w-full rounded-2xl" />
          </div>
        )}

        {!isLoading && displayedServices.length > 0 && (
          <div
            ref={containerRef}
            className="h-[700px] overflow-auto rounded-3xl border border-stone-200 bg-white shadow-soft"
          >
            <StackingCards
              totalCards={displayedServices.length}
              scrollOptions={{ container: containerRef }}
              className="relative"
            >
              <div className="relative z-10 flex h-[100px] w-full items-center justify-center text-lg font-semibold uppercase tracking-wider text-navy-700 md:text-xl">
                Scroll to explore ↓
              </div>

              {displayedServices.map((service, index) => {
                const bgColor = CARD_BACKGROUNDS[index % CARD_BACKGROUNDS.length];
                const imageUrl = SERVICE_IMAGES[service.name] || SERVICE_IMAGES['Buyer Consultation'];

                return (
                  <StackingCardItem
                    key={service.id}
                    index={index}
                    className="h-[620px]"
                  >
                    <div
                      className={`${bgColor} mx-auto flex h-[85%] w-11/12 flex-col overflow-hidden rounded-3xl text-white shadow-lift sm:flex-row`}
                    >
                      <div className="flex flex-1 flex-col justify-center p-8 sm:p-10">
                        <span className="mb-4 w-fit rounded-full bg-white/15 px-3 py-1 text-xs font-medium uppercase tracking-wider backdrop-blur-sm">
                          {service.duration_minutes} minutes
                        </span>
                        <h3 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                          {service.name}
                        </h3>
                        <p className="mt-4 max-w-md text-sm leading-relaxed text-white/85 sm:text-base">
                          {service.description}
                        </p>
                        <div className="mt-8 flex flex-wrap items-center gap-4">
                          {service.price > 0 ? (
                            <span className="text-2xl font-semibold tracking-tight">
                              {formatCurrency(service.price)}
                            </span>
                          ) : (
                            <span className="text-lg font-medium text-white/80">Complimentary</span>
                          )}
                          <Button
                            onClick={() => onSelectService(service)}
                            className="bg-white text-stone-900 hover:bg-stone-100"
                          >
                            Book now
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="relative h-64 w-full sm:h-auto sm:w-1/2">
                        <img
                          src={imageUrl}
                          alt={service.name}
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent sm:bg-gradient-to-l" />
                      </div>
                    </div>
                  </StackingCardItem>
                );
              })}

              <div className="flex h-40 w-full items-center justify-center">
                <p className="text-center text-sm text-stone-500">
                  Ready to begin? Choose a service above and book your appointment.
                </p>
              </div>
            </StackingCards>
          </div>
        )}

        {!isLoading && displayedServices.length === 0 && (
          <div className="flex h-[400px] items-center justify-center rounded-3xl border border-stone-200 bg-white">
            <p className="text-stone-500">No services available at the moment.</p>
          </div>
        )}
      </div>
    </section>
  );
}
