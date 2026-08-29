import { useState } from 'react';
import { Navigate, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  Building2,
  Calendar,
  Clock,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Shield,
  Store,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useBusinessSettings } from '@/hooks/useBusinessSettings';
import { useBusinessLogo } from '@/hooks/useBusinessLogo';
import { Skeleton } from '@/components/ui/skeleton';

export function AdminLayout() {
  const { isAdmin, isUnauthorized, loading, signOut, user } = useAuth();
  const { data: settings } = useBusinessSettings();
  const { data: logo } = useBusinessLogo();
  const [mobileOpen, setMobileOpen] = useState(false);
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

  const navItems = [
    { label: 'Overview', icon: LayoutDashboard, href: '/admin' },
    { label: 'Appointments', icon: Calendar, href: '/admin/appointments' },
    { label: 'Services', icon: Store, href: '/admin/services' },
    { label: 'Listing', icon: Building2, href: '/admin/listing' },
    { label: 'Business Hours', icon: Clock, href: '/admin/hours' },
    { label: 'Blocked Dates', icon: Calendar, href: '/admin/blocked' },
    { label: 'Settings', icon: Settings, href: '/admin/settings' },
  ];

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-5 py-6">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={businessName}
            className="h-10 w-10 rounded-xl border border-stone-200 bg-white object-contain p-1.5 shadow-soft"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-800 text-white shadow-soft">
            <Store className="h-5 w-5" />
          </div>
        )}
        <div>
          <p className="text-sm font-bold text-stone-900">{businessName}</p>
          <p className="text-xs text-stone-500">Admin dashboard</p>
        </div>
      </div>
      <Separator />
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.label}
              to={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-navy-50 text-navy-800'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              <item.icon className={`h-4 w-4 ${isActive ? 'text-navy-700' : 'text-stone-400'}`} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
      <Separator />
      <div className="p-4">
        <div className="mb-3 rounded-xl bg-stone-50 p-3">
          <p className="text-xs text-stone-500">Signed in as</p>
          <p className="truncate text-sm font-medium text-stone-900">{user.email}</p>
        </div>
        <Button variant="outline" className="w-full" onClick={() => signOut()}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-cream">
      <aside className="hidden w-64 shrink-0 border-r border-stone-200 bg-white lg:flex lg:flex-col">
        {SidebarContent}
      </aside>

      <Sheet open={mobileOpen} onClose={() => setMobileOpen(false)} title="Menu">
        {SidebarContent}
      </Sheet>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-stone-200 bg-white px-6 py-4 lg:hidden">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={businessName}
                className="h-9 w-9 rounded-xl border border-stone-200 bg-white object-contain p-1.5"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy-800 text-white">
                <Store className="h-4 w-4" />
              </div>
            )}
            <span className="font-semibold text-stone-900">{businessName} Admin</span>
          </div>
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 text-stone-600 hover:bg-stone-100"
          >
            <Menu className="h-6 w-6" />
          </button>
        </header>
        <main className="flex-1 p-6 lg:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
