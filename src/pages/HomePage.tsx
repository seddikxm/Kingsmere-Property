import { useRef, useState } from 'react';
import { Navbar } from '@/sections/Navbar';
import { Hero } from '@/sections/Hero';
import { Services } from '@/sections/Services';
import { About } from '@/sections/About';
import { Booking } from '@/sections/Booking';
import { Footer } from '@/sections/Footer';
import { Testimonials } from '@/sections/Testimonials';
import type { Service } from '@/types';

export function HomePage() {
  const bookingRef = useRef<HTMLDivElement>(null);
  const [preselectedService, setPreselectedService] = useState<Service | null>(null);

  const scrollToBooking = (service?: Service) => {
    if (service) setPreselectedService(service);
    bookingRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-cream">
      <Navbar onBookClick={() => scrollToBooking()} />
      <main>
        <Hero onBookClick={() => scrollToBooking()} />
        <Services onSelectService={(service) => scrollToBooking(service)} />
        <About />
        <Testimonials />
        <div ref={bookingRef}>
          <Booking preselectedService={preselectedService} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
