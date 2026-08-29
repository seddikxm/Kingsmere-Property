import { useEffect, useRef, useState } from 'react';
import { ImagePlus, Save, Store, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useBusinessSettings, useBusinessSettingsMutation } from '@/hooks/useBusinessSettings';
import { useBusinessLogo, useUploadBusinessLogo, useRemoveBusinessLogo } from '@/hooks/useBusinessLogo';
import type { BusinessSettings } from '@/types';

const emptySettings: Omit<BusinessSettings, 'id' | 'created_at'> = {
  business_name: 'Kingsmere Property',
  business_email: 'hello@kingsmere.property',
  business_phone: '+1 (555) 123-4567',
  business_address: '123 Estate Avenue, Suite 400, New York, NY 10001',
  slot_interval_minutes: 30,
  booking_notice_hours: 24,
};

export function BusinessSettingsPage() {
  const { data: settings, isLoading } = useBusinessSettings();
  const update = useBusinessSettingsMutation();
  const { data: logo, isLoading: logoLoading } = useBusinessLogo();
  const uploadLogo = useUploadBusinessLogo();
  const removeLogo = useRemoveBusinessLogo();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<Omit<BusinessSettings, 'id' | 'created_at'>>(emptySettings);

  useEffect(() => {
    if (settings) {
      setForm({
        business_name: settings.business_name,
        business_email: settings.business_email,
        business_phone: settings.business_phone,
        business_address: settings.business_address,
        slot_interval_minutes: settings.slot_interval_minutes,
        booking_notice_hours: settings.booking_notice_hours,
      });
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await update.mutateAsync(form);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadLogo.mutateAsync(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveLogo = async () => {
    await removeLogo.mutateAsync();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-stone-900">Business settings</h1>
          <p className="mt-1 text-stone-600">Manage your real estate business information and booking rules.</p>
        </div>
        <Button onClick={handleSubmit} disabled={update.isPending}>
          <Save className="h-4 w-4" />
          {update.isPending ? 'Saving...' : 'Save settings'}
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-50 text-navy-700">
                <Store className="h-5 w-5" />
              </div>
              <CardTitle>Business details</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-8 rounded-2xl border border-stone-200 bg-stone-50 p-6">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-stone-500">Business logo</h3>
              <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
                {logoLoading ? (
                  <Skeleton className="h-24 w-24 rounded-2xl" />
                ) : logo ? (
                  <div className="relative">
                    <img
                      src={logo.logo_url}
                      alt="Business logo"
                      className="h-24 w-24 rounded-2xl border border-stone-200 object-contain bg-white p-2 shadow-soft"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      disabled={removeLogo.isPending}
                      className="absolute -right-2 -top-2 rounded-full bg-red-100 p-1.5 text-red-600 shadow-sm hover:bg-red-200 disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-white">
                    <Store className="h-8 w-8 text-stone-300" />
                  </div>
                )}
                <div className="flex flex-col gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/svg+xml"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadLogo.isPending}
                  >
                    <ImagePlus className="h-4 w-4" />
                    {uploadLogo.isPending ? 'Uploading...' : 'Upload logo'}
                  </Button>
                  <p className="text-xs text-stone-500">PNG, JPG, or SVG. Recommended: square, at least 200x200px.</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="business_name">Business name</Label>
                  <Input id="business_name" value={form.business_name} onChange={(e) => setForm({ ...form, business_name: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business_email">Business email</Label>
                  <Input id="business_email" type="email" value={form.business_email} onChange={(e) => setForm({ ...form, business_email: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business_phone">Business phone</Label>
                  <Input id="business_phone" type="tel" value={form.business_phone} onChange={(e) => setForm({ ...form, business_phone: e.target.value })} required />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="business_address">Business address</Label>
                  <Textarea id="business_address" value={form.business_address} onChange={(e) => setForm({ ...form, business_address: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slot_interval_minutes">Slot interval (minutes)</Label>
                  <Input id="slot_interval_minutes" type="number" min={5} step={5} value={form.slot_interval_minutes} onChange={(e) => setForm({ ...form, slot_interval_minutes: parseInt(e.target.value) || 0 })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="booking_notice_hours">Booking notice (hours)</Label>
                  <Input id="booking_notice_hours" type="number" min={0} step={1} value={form.booking_notice_hours} onChange={(e) => setForm({ ...form, booking_notice_hours: parseInt(e.target.value) || 0 })} required />
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={update.isPending}>
                  {update.isPending ? 'Saving...' : 'Save settings'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
