import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Building2, Calendar, Clock, Search, Store, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAppointments } from '@/hooks/useAppointments';
import { useServices } from '@/hooks/useServices';
import { useListings } from '@/hooks/useListing';
import { format, parseISO } from 'date-fns';

interface SearchResult {
  id: string;
  label: string;
  sublabel: string;
  group: string;
  icon: LucideIcon;
  to: string;
}

const RECENT_KEY = 'kingsmere-admin-recent-searches';

interface GlobalSearchProps {
  open: boolean;
  onClose: () => void;
}

export function GlobalSearch({ open, onClose }: GlobalSearchProps) {
  const navigate = useNavigate();
  const { data: appointments } = useAppointments();
  const { data: services } = useServices();
  const { data: listings } = useListings();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [recent, setRecent] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
    } catch {
      return [];
    }
  });
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const results = useMemo<SearchResult[]>(() => {
    const term = query.trim().toLowerCase();
    if (!term) return [];

    const matches: SearchResult[] = [];
    appointments?.forEach((a) => {
      const haystack = `${a.full_name} ${a.email} ${a.service?.name || ''}`.toLowerCase();
      if (haystack.includes(term)) {
        matches.push({
          id: `appt-${a.id}`,
          label: a.full_name,
          sublabel: `${a.service?.name || 'Appointment'} · ${format(parseISO(a.appointment_date), 'MMM d, yyyy')}`,
          group: 'Appointments',
          icon: Calendar,
          to: '/admin/appointments',
        });
      }
    });
    services?.forEach((s) => {
      if (s.name.toLowerCase().includes(term)) {
        matches.push({
          id: `svc-${s.id}`,
          label: s.name,
          sublabel: s.is_active ? 'Active service' : 'Inactive service',
          group: 'Services',
          icon: Store,
          to: '/admin/services',
        });
      }
    });
    listings?.forEach((l) => {
      if (l.title.toLowerCase().includes(term) || l.address.toLowerCase().includes(term)) {
        matches.push({
          id: `lst-${l.id}`,
          label: l.title,
          sublabel: l.address,
          group: 'Properties',
          icon: Building2,
          to: '/admin/listing',
        });
      }
    });
    return matches.slice(0, 12);
  }, [query, appointments, services, listings]);

  const select = (result: SearchResult) => {
    const term = query.trim();
    if (term) {
      const updated = [term, ...recent.filter((r) => r !== term)].slice(0, 5);
      setRecent(updated);
      localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
    }
    onClose();
    navigate(result.to);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[activeIndex]) {
      e.preventDefault();
      select(results[activeIndex]);
    }
  };

  let lastGroup = '';

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-24">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-stone-950/40 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
            className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-lift"
            role="dialog"
            aria-modal="true"
            aria-label="Global search"
          >
            <div className="flex items-center gap-3 border-b border-stone-100 px-5">
              <Search className="h-4 w-4 shrink-0 text-stone-400" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search appointments, services, properties..."
                className="h-14 w-full bg-transparent text-sm text-stone-900 outline-none placeholder:text-stone-400"
              />
              <button
                onClick={onClose}
                className="rounded-md border border-stone-200 px-1.5 py-0.5 text-[10px] font-medium text-stone-400 hover:text-stone-600"
              >
                ESC
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto p-2">
              {query.trim() === '' ? (
                recent.length > 0 ? (
                  <div>
                    <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-400">
                      Recent searches
                    </p>
                    {recent.map((term) => (
                      <button
                        key={term}
                        onClick={() => setQuery(term)}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-stone-600 transition-colors hover:bg-stone-50"
                      >
                        <Clock className="h-4 w-4 text-stone-300" />
                        {term}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="px-3 py-8 text-center text-sm text-stone-400">
                    Search clients, services, and properties across the dashboard.
                  </p>
                )
              ) : results.length === 0 ? (
                <p className="px-3 py-8 text-center text-sm text-stone-400">
                  No results for “{query}”.
                </p>
              ) : (
                results.map((result, idx) => {
                  const showGroup = result.group !== lastGroup;
                  lastGroup = result.group;
                  return (
                    <div key={result.id}>
                      {showGroup && (
                        <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-400">
                          {result.group}
                        </p>
                      )}
                      <button
                        onClick={() => select(result)}
                        onMouseEnter={() => setActiveIndex(idx)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                          idx === activeIndex ? 'bg-navy-50' : ''
                        }`}
                      >
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                            idx === activeIndex ? 'bg-navy-100 text-navy-700' : 'bg-stone-100 text-stone-500'
                          }`}
                        >
                          <result.icon className="h-4 w-4" />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-stone-900">{result.label}</span>
                          <span className="block truncate text-xs text-stone-500">{result.sublabel}</span>
                        </span>
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex items-center gap-4 border-t border-stone-100 px-5 py-2.5 text-[11px] text-stone-400">
              <span className="flex items-center gap-1.5">
                <X className="h-3 w-3" /> close
              </span>
              <span>↑↓ navigate</span>
              <span>↵ open</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
