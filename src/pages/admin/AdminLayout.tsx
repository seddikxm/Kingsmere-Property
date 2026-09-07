import { useState } from 'react';
import { Navigate, NavLink, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  BarChart3,
  Building2,
  Calendar,
  CalendarX,
  ChevronLeft,
  Clock,
  Images,
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  MapPin,
  Menu,
  PenSquare,
  Search,
  Settings,
  Shield,
  Store,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ToastProvider } from '@/components/ui/toast';
import { TopNav } from '@/components/admin/TopNav';
import { useAuth } from '@/hooks/useAuth';
import { useBusinessSettings } from '@/hooks/useBusinessSettings';
import { useBusinessLogo } from '@/hooks/useBusinessLogo';
import { Skeleton } from '@/components/ui/skeleton';

const navGroups = [
  {
    title: 'Main',
    items: [
      { label: 'Overview', icon: LayoutDashboard, href: '/admin' },
      { label: 'Appointments', icon: Calendar, href: '/admin/appointments' },
      { label: 'Services', icon: Store, href: '/admin/services' },
      { label: 'Listing', icon: Building2, href: '/admin/listing' },
    ],
  },
  {
    title: 'Content',
    items: [
      { label: 'Content Studio', icon: PenSquare, href: '/admin/content' },
      { label: 'Homepage Builder', icon: LayoutGrid, href: '/admin/content/layout' },
      { label: 'Media Manager', icon: Images, href: '/admin/media' },
      { label: 'SEO Manager', icon: Search, href: '/admin/seo' },
    ],
  },
  {
    title: 'Insights',
    items: [
      { label: 'Analytics', icon: BarChart3, href: '/admin/analytics' },
      { label: 'Property Map', icon: MapPin, href: '/admin/map' },
    ],
  },
  {
    title: 'System',
    items: [
      { label: 'Business Hours', icon: Clock, href: '/admin/hours' },
      { label: 'Blocked Dates', icon: CalendarX, href: '/admin/blocked' },
      { label: 'Settings', icon: Settings, href: '/admin/settings' },
    ],
  },
];

export function AdminLayout() {
  const { isAdmin, isUnauthorized, loading, signOut, user } = useAuth();
  const { data: settings } = useBusinessSettings();
  const { data: logo } = useBusinessLogo();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const businessName = settings?.business_name || 'Kingsmere';
  const logoUrl = logo?.logo_url;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <p className="text-sm text-stone-500">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (isUnauthorized) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-6">
        <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-lift">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
            <Shield className="h-7 w-7 text-red-700" />
          </div>
          <h1 className="mt-5 text-xl font-bold text-stone-900">Access restricted</h1>
          <p className="mt-2 text-sm text-stone-600">
            You are signed in, but you are not authorized as an admin.
          </p>
          <Button onClick={() => signOut()} className="mt-6 w-full" variant="outline">
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  const Brand = ({ compact = false }: { compact?: boolean }) => (
    <div className={`flex items-center gap-3 ${compact ? 'px-3 py-6' : 'px-5 py-6'}`}>
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={businessName}
          className="h-10 w-10 shrink-0 rounded-xl bg-white/95 object-contain p-1.5 shadow-soft"
        />
      ) : (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-500/15 text-gold-400 ring-1 ring-gold-400/30">
          <Store className="h-5 w-5" />
        </div>
      )}
      {!compact && (
        <div className="min-w-0">
          <p className="truncate text-sm font-bold tracking-wide text-white">{businessName}</p>
          <p className="text-[11px] uppercase tracking-[0.2em] text-gold-400/80">Admin Suite</p>
        </div>
      )}
    </div>
  );

  const Nav = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
      {navGroups.map((group) => (
        <div key={group.title}>
          {!collapsed && (
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/30">
              {group.title}
            </p>
          )}
          <div className="space-y-1">
            {group.items.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <NavLink
                  key={item.label}
                  to={item.href}
                  onClick={onNavigate}
                  title={collapsed ? item.label : undefined}
                  className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-300 ${
                    collapsed ? 'justify-center' : ''
                  } ${
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-white/50 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="sidebar-indicator"
                      className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-gold-400"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                  <item.icon
                    className={`h-4 w-4 shrink-0 transition-colors ${
                      isActive ? 'text-gold-400' : 'text-white/40 group-hover:text-white/70'
                    }`}
                  />
                  {!collapsed && item.label}
                </NavLink>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  const SidebarFooter = ({ compact = false }: { compact?: boolean }) => (
    <div className={compact ? 'px-3 pb-4' : 'px-4 pb-4'}>
      <Separator className="mb-4 bg-white/10" />
      {compact ? (
        <button
          onClick={() => signOut()}
          title="Sign out"
          className="flex w-full items-center justify-center rounded-lg p-2.5 text-white/40 transition-colors hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
        </button>
      ) : (
        <>
          <div className="mb-3 rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Signed in as</p>
            <p className="mt-0.5 truncate text-sm font-medium text-white/90">{user.email}</p>
          </div>
          <Button
            variant="outline"
            className="w-full border-white/15 bg-transparent text-white/70 hover:bg-white/5 hover:text-white"
            onClick={() => signOut()}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </>
      )}
    </div>
  );

  const SidebarContent = ({ compact = false }: { compact?: boolean }) => (
    <div className="flex h-full flex-col bg-navy-950">
      <Brand compact={compact} />
      <Separator className="bg-white/10" />
      <Nav onNavigate={() => setMobileOpen(false)} />
      <SidebarFooter compact={compact} />
    </div>
  );

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-cream">
      <aside
        className={`hidden shrink-0 border-r border-navy-900 transition-[width] duration-300 lg:block ${
          collapsed ? 'w-[76px]' : 'w-64'
        }`}
      >
        <div className="sticky top-0 h-screen">
          <SidebarContent compact={collapsed} />
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="absolute -right-3 top-8 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-500 shadow-soft transition-colors hover:text-navy-800"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft className={`h-3.5 w-3.5 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-stone-950/50 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 380, damping: 36 }}
              className="relative h-full w-72"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute -right-11 top-4 rounded-full bg-white/10 p-2 text-white backdrop-blur-sm"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
              <SidebarContent />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex flex-1 flex-col">
        <TopNav />
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-stone-200/80 bg-cream/80 px-6 py-4 backdrop-blur-md lg:hidden">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={businessName}
                className="h-9 w-9 rounded-xl border border-stone-200 bg-white object-contain p-1.5"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy-950 text-gold-400">
                <Store className="h-4 w-4" />
              </div>
            )}
            <span className="font-semibold text-stone-900">{businessName} Admin</span>
          </div>
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 text-stone-600 hover:bg-stone-100"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </header>
        <main className="flex-1 p-6 lg:p-10">
          <Outlet />
        </main>
      </div>
      </div>
    </ToastProvider>
  );
}
