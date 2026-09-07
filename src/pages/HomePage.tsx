import { useRef, useState } from 'react';
import { Navbar } from '@/sections/Navbar';
import { Hero } from '@/sections/Hero';
import { Services } from '@/sections/Services';
import { FeaturedProperties } from '@/sections/FeaturedProperties';
import { About } from '@/sections/About';
import { Booking } from '@/sections/Booking';
import { Footer } from '@/sections/Footer';
import { Testimonials } from '@/sections/Testimonials';
import { Seo } from '@/components/Seo';
import { useHomepageLayout } from '@/hooks/useHomepageLayout';
import { DEFAULT_HOMEPAGE_LAYOUT, isHomepageSectionKey } from '@/lib/homepage-sections';
import type { Service } from '@/types';

export function HomePage() {
  const bookingRef = useRef<HTMLDivElement>(null);
  const [preselectedService, setPreselectedService] = useState<Service | null>(null);
  const { data: layout } = useHomepageLayout();

  const scrollToBooking = (service?: Service) => {
    if (service) setPreselectedService(service);
    bookingRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const rows =
    layout && layout.length > 0
      ? [...layout].sort((a, b) => a.sort_order - b.sort_order)
      : DEFAULT_HOMEPAGE_LAYOUT;

  const renderSection = (sectionKey: string) => {
    switch (sectionKey) {
      case 'hero':
        return <Hero onBookClick={() => scrollToBooking()} />;
      case 'services':
        return <Services onSelectService={(service) => scrollToBooking(service)} />;
      case 'featured':
        return <FeaturedProperties />;
      case 'about':
        return <About />;
      case 'testimonials':
        return <Testimonials />;
      case 'booking':
        return (
          <div ref={bookingRef}>
            <Booking preselectedService={preselectedService} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-cream">
      <Seo
        page="home"
        defaults={{
          title: 'Kingsmere Property — Premium Real Estate Consultations',
          description:
            'Expert real estate guidance for buyers, sellers, and investors. Schedule a personal consultation with Kingsmere Property.',
        }}
      />
      <Navbar onBookClick={() => scrollToBooking()} />
      <main>
        {rows
          .filter((row) => row.enabled && isHomepageSectionKey(row.section_key))
          .map((row) => (
            <div key={row.section_key}>{renderSection(row.section_key)}</div>
          ))}
      </main>
      <Footer />
    </div>
  );
}
