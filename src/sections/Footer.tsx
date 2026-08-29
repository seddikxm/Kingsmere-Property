import { Mail, Phone, MapPin } from 'lucide-react';
import { useBusinessSettings } from '@/hooks/useBusinessSettings';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ScrollReveal';

export function Footer() {
  const { data: settings } = useBusinessSettings();

  const businessName = settings?.business_name || 'Kingsmere Property';
  const email = settings?.business_email || 'hello@kingsmere.property';
  const phone = settings?.business_phone || '+1 (555) 123-4567';
  const address = settings?.business_address || '123 Estate Avenue, Suite 400, New York, NY 10001';

  return (
    <footer className="border-t border-stone-200 bg-white py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <StaggerContainer className="grid gap-12 lg:grid-cols-4" stagger={0.1}>
          <StaggerItem className="lg:col-span-2">
            <h3 className="text-2xl font-bold tracking-tight text-stone-900">{businessName}</h3>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-stone-600">
              Premium real estate guidance for buyers, sellers, and investors. Schedule a consultation
              and move forward with confidence.
            </p>
          </StaggerItem>
          <StaggerItem>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-stone-900">Contact</h4>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-3 text-sm text-stone-600">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-navy-700" />
                <a href={`mailto:${email}`} className="hover:text-navy-800 hover:underline">{email}</a>
              </li>
              <li className="flex items-start gap-3 text-sm text-stone-600">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-navy-700" />
                <a href={`tel:${phone}`} className="hover:text-navy-800 hover:underline">{phone}</a>
              </li>
              <li className="flex items-start gap-3 text-sm text-stone-600">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-navy-700" />
                <span>{address}</span>
              </li>
            </ul>
          </StaggerItem>
          <StaggerItem>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-stone-900">Quick links</h4>
            <ul className="mt-4 space-y-2">
              {[
                { label: 'Services', href: '#services' },
                { label: 'About', href: '#about' },
                { label: 'Book consultation', href: '#booking' },
                { label: 'Admin login', href: '/admin' },
              ].map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-stone-600 hover:text-navy-800 hover:underline">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </StaggerItem>
        </StaggerContainer>
        <ScrollReveal delay={0.2}>
          <div className="mt-12 border-t border-stone-100 pt-8 text-center text-sm text-stone-500">
            © {new Date().getFullYear()} {businessName}. All rights reserved.
          </div>
        </ScrollReveal>
      </div>
    </footer>
  );
}
