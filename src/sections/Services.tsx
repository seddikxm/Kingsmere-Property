import { motion } from 'motion/react';
import { Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useServices } from '@/hooks/useServices';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ScrollReveal';
import { formatCurrency } from '@/lib/utils';
import type { Service } from '@/types';

interface ServicesProps {
  onSelectService: (service: Service) => void;
}

export function Services({ onSelectService }: ServicesProps) {
  const { data: services, isLoading } = useServices(true);

  const serviceImages: Record<string, string> = {
    'Buyer Consultation': 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=800',
    'Seller Consultation': 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800',
    'Property Viewing Appointment': 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800',
    'Home Valuation Consultation': 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&q=80&w=800',
    'Investment Property Consultation': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800',
    'Virtual Real Estate Consultation': 'https://images.unsplash.com/photo-1553877522-0e7743b5e82b?auto=format&fit=crop&q=80&w=800',
  };

  return (
    <section id="services" className="relative bg-cream py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-16 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <ScrollReveal className="max-w-2xl">
            <span className="text-sm font-semibold uppercase tracking-wider text-navy-700">Kingsmere Property Services</span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
              Consultations designed around your property goals
            </h2>
            <p className="mt-4 text-lg text-stone-600">
              Every appointment is private, professional, and tailored to where you are in your real estate journey.
            </p>
          </ScrollReveal>
        </div>

        {isLoading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-[360px] w-full rounded-2xl" />
            ))}
          </div>
        )}

        {!isLoading && (
          <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" stagger={0.1}>
            {services?.map((service) => (
              <StaggerItem key={service.id}>
                <motion.div whileHover={{ y: -8 }} transition={{ duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}>
                  <Card className="group overflow-hidden border-stone-200/80">
                    <div className="relative h-52 overflow-hidden">
                      <img
                        src={service.image_url || serviceImages[service.name] || serviceImages['Buyer Consultation']}
                        alt={service.name}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-navy-950/50 to-transparent" />
                    </div>
                    <CardHeader>
                      <CardContent className="p-0 pt-4">
                        <div className="mb-3 flex items-center gap-2 text-sm text-stone-500">
                          <Clock className="h-4 w-4" />
                          <span>{service.duration_minutes} minutes</span>
                          {service.price > 0 && (
                            <>
                              <span>•</span>
                              <span>{formatCurrency(service.price)}</span>
                            </>
                          )}
                        </div>
                        <h3 className="text-xl font-semibold text-stone-900">{service.name}</h3>
                        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-stone-600">
                          {service.description}
                        </p>
                        <Button onClick={() => onSelectService(service)} className="mt-5 w-full" variant="outline">
                          Book this consultation
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </CardContent>
                    </CardHeader>
                  </Card>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </div>
    </section>
  );
}
