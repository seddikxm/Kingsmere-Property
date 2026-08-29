import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useBusinessSettings } from '@/hooks/useBusinessSettings';
import { useBusinessLogo } from '@/hooks/useBusinessLogo';
import { IMAGES } from '@/lib/constants';

interface NavbarProps {
  onBookClick: () => void;
}

export function Navbar({ onBookClick }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: settings } = useBusinessSettings();
  const { data: logo } = useBusinessLogo();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  type NavLink = { label: string; href: string; to?: never } | { label: string; href?: never; to: string };

  const navLinks: NavLink[] = [
    { label: 'Services', href: '#services' },
    { label: 'Properties', to: '/properties' },
    { label: 'Listing', to: '/listing' },
    { label: 'About', href: '#about' },
    { label: 'Book', href: '#booking' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled ? 'bg-white/90 backdrop-blur-md shadow-soft py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-8">
        <a href="#" className="flex items-center gap-3">
          <div className={`relative h-10 w-10 overflow-hidden rounded-full border shadow-soft ${scrolled ? 'border-stone-200' : 'border-white/30'}`}>
            <img
              src={logo?.logo_url || IMAGES.exterior}
              alt={settings?.business_name || 'Kingsmere Property'}
              className="h-full w-full object-cover"
            />
          </div>
          <span className={`text-lg font-semibold tracking-tight transition-colors ${scrolled ? 'text-stone-900' : 'text-white'}`}>
            {settings?.business_name || 'Kingsmere Property'}
          </span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) =>
            link.to ? (
              <Link
                key={link.label}
                to={link.to}
                className={`text-sm font-medium transition-colors hover:opacity-80 ${
                  scrolled ? 'text-stone-600 hover:text-navy-800' : 'text-white/90 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.label}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:opacity-80 ${
                  scrolled ? 'text-stone-600 hover:text-navy-800' : 'text-white/90 hover:text-white'
                }`}
              >
                {link.label}
              </a>
            )
          )}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button
            onClick={onBookClick}
            className={scrolled ? '' : 'bg-white text-navy-900 hover:bg-stone-100'}
          >
            Book Consultation
          </Button>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className={`rounded-lg p-2 md:hidden ${scrolled ? 'text-stone-900 hover:bg-stone-100' : 'text-white hover:bg-white/10'}`}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="absolute left-0 right-0 top-full border-b border-stone-100 bg-white p-6 shadow-lift md:hidden">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) =>
              link.to ? (
                <Link
                  key={link.label}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className="text-base font-medium text-stone-700 hover:text-navy-800"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-base font-medium text-stone-700 hover:text-navy-800"
                >
                  {link.label}
                </a>
              )
            )}
            <Button onClick={() => { setMobileOpen(false); onBookClick(); }} className="mt-2 w-full">
              Book Consultation
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
