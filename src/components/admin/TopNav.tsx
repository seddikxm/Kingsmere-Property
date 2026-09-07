import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  Bell,
  CheckCheck,
  ChevronRight,
  LogOut,
  Search,
  Settings,
  User,
} from 'lucide-react';
import { GlobalSearch } from '@/components/admin/GlobalSearch';
import { useAppointments } from '@/hooks/useAppointments';
import { useAuth } from '@/hooks/useAuth';
import { isToday, parseISO } from 'date-fns';

const pageTitles: Record<string, string> = {
  '/admin': 'Overview',
  '/admin/appointments': 'Appointments',
  '/admin/services': 'Services',
  '/admin/listing': 'Listing',
  '/admin/hours': 'Business Hours',
  '/admin/blocked': 'Blocked Dates',
  '/admin/analytics': 'Analytics',
  '/admin/settings': 'Settings',
};

export function TopNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { data: appointments } = useAppointments();
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const pageTitle = pageTitles[location.pathname] || 'Admin';

  const notifications = useMemo(() => {
    if (!appointments) return [];
    const items: { id: string; text: string; detail: string; href: string }[] = [];
    appointments
      .filter((a) => a.status === 'pending')
      .slice(0, 3)
      .forEach((a) =>
        items.push({
          id: `pending-${a.id}`,
          text: 'New appointment request',
          detail: `${a.full_name} · ${a.service?.name || 'Consultation'}`,
          href: '/admin/appointments',
        })
      );
    appointments
      .filter((a) => isToday(parseISO(a.appointment_date)) && a.status !== 'cancelled')
      .slice(0, 3)
      .forEach((a) =>
        items.push({
          id: `today-${a.id}`,
          text: 'Appointment today',
          detail: `${a.full_name} · ${a.start_time}`,
          href: '/admin/appointments',
        })
      );
    return items.slice(0, 6);
  }, [appointments]);

  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length;

  const closeAll = () => {
    setNotifOpen(false);
    setUserMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-30 hidden items-center justify-between border-b border-stone-200/80 bg-cream/80 px-8 py-4 backdrop-blur-md lg:flex">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-stone-400">Admin</span>
          <ChevronRight className="h-3.5 w-3.5 text-stone-300" />
          <span className="font-semibold text-stone-900">{pageTitle}</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setSearchOpen(true)}
            className="flex h-10 w-64 items-center gap-3 rounded-full border border-stone-200 bg-white px-4 text-sm text-stone-400 shadow-soft transition-all duration-300 hover:border-stone-300 hover:shadow-lift"
          >
            <Search className="h-4 w-4" />
            <span className="flex-1 text-left">Search...</span>
            <kbd className="rounded-md border border-stone-200 bg-stone-50 px-1.5 py-0.5 text-[10px] font-semibold text-stone-400">
              ⌘K
            </kbd>
          </button>

          <div className="relative">
            <button
              onClick={() => {
                setNotifOpen((o) => !o);
                setUserMenuOpen(false);
              }}
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-500 shadow-soft transition-colors hover:text-navy-800"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold-500 px-1 text-[9px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>
            <AnimatePresence>
              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={closeAll} aria-hidden="true" />
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 z-20 mt-2 w-80 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-lift"
                  >
                    <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3">
                      <p className="text-sm font-semibold text-stone-900">Notifications</p>
                      <button
                        onClick={() => setReadIds(new Set(notifications.map((n) => n.id)))}
                        className="flex items-center gap-1 text-xs font-medium text-navy-700 hover:text-navy-900"
                      >
                        <CheckCheck className="h-3.5 w-3.5" />
                        Mark all read
                      </button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="px-4 py-8 text-center text-sm text-stone-400">
                          You are all caught up.
                        </p>
                      ) : (
                        notifications.map((n) => (
                          <Link
                            key={n.id}
                            to={n.href}
                            onClick={closeAll}
                            className="flex items-start gap-3 border-b border-stone-50 px-4 py-3 transition-colors hover:bg-stone-50"
                          >
                            <span
                              className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                                readIds.has(n.id) ? 'bg-stone-200' : 'bg-gold-500'
                              }`}
                            />
                            <span>
                              <span className="block text-sm font-medium text-stone-900">{n.text}</span>
                              <span className="block text-xs text-stone-500">{n.detail}</span>
                            </span>
                          </Link>
                        ))
                      )}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <div className="relative">
            <button
              onClick={() => {
                setUserMenuOpen((o) => !o);
                setNotifOpen(false);
              }}
              className="flex items-center gap-2.5 rounded-full border border-stone-200 bg-white py-1.5 pl-1.5 pr-3 shadow-soft transition-shadow hover:shadow-lift"
              aria-label="User menu"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-navy-800 text-xs font-bold text-gold-400">
                {user?.email?.charAt(0).toUpperCase() || 'A'}
              </span>
              <span className="max-w-32 truncate text-sm font-medium text-stone-700">
                {user?.email?.split('@')[0]}
              </span>
            </button>
            <AnimatePresence>
              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={closeAll} aria-hidden="true" />
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 z-20 mt-2 w-64 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-lift"
                  >
                    <div className="border-b border-stone-100 px-4 py-3">
                      <p className="truncate text-sm font-semibold text-stone-900">{user?.email}</p>
                      <p className="text-xs text-gold-600">Administrator</p>
                    </div>
                    <div className="p-1.5">
                      <button
                        onClick={() => {
                          closeAll();
                          navigate('/admin/settings');
                        }}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-stone-700 transition-colors hover:bg-stone-50"
                      >
                        <Settings className="h-4 w-4 text-stone-400" />
                        Settings
                      </button>
                      <button
                        onClick={() => {
                          closeAll();
                          navigate('/admin/settings');
                        }}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-stone-700 transition-colors hover:bg-stone-50"
                      >
                        <User className="h-4 w-4 text-stone-400" />
                        My profile
                      </button>
                    </div>
                    <div className="border-t border-stone-100 p-1.5">
                      <button
                        onClick={() => signOut()}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
