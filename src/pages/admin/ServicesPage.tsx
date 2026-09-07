import { useRef, useState } from 'react';
import { Pencil, Plus, Store, ImagePlus, Link2, Upload, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import { useServices, useServiceMutation, useUploadServiceImage } from '@/hooks/useServices';
import { formatCurrency, getErrorMessage } from '@/lib/utils';
import type { Service } from '@/types';

type ServiceForm = {
  name: string;
  description: string;
  duration_minutes: number;
  price: number;
  is_active: boolean;
  image_url: string;
};

const emptyService: ServiceForm = {
  name: '',
  description: '',
  duration_minutes: 60,
  price: 0,
  is_active: true,
  image_url: '',
};

export function ServicesPage() {
  const { data: services, isLoading } = useServices();
  const { create, update } = useServiceMutation();
  const { toast } = useToast();
  const [editing, setEditing] = useState<Service | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<ServiceForm>(emptyService);
  const [saveError, setSaveError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadImage = useUploadServiceImage();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const url = await uploadImage.mutateAsync(file);
      setForm((prev) => ({ ...prev, image_url: url }));
      toast('Image uploaded');
    } catch {
      toast('Image upload failed', 'error');
    }
  };

  const openNew = () => {
    setEditing(null);
    setForm(emptyService);
    setSaveError(null);
    setIsOpen(true);
  };

  const openEdit = (service: Service) => {
    setEditing(service);
    setSaveError(null);
    setForm({
      name: service.name,
      description: service.description || '',
      duration_minutes: service.duration_minutes,
      price: service.price,
      is_active: service.is_active,
      image_url: service.image_url || '',
    });
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setEditing(null);
    setForm(emptyService);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    try {
      if (editing) {
        await update.mutateAsync({ id: editing.id, ...form });
      } else {
        await create.mutateAsync(form);
      }
      close();
      toast(editing ? 'Service updated' : 'Service created');
    } catch (err) {
      setSaveError(getErrorMessage(err));
      toast('Failed to save service', 'error');
    }
  };

  const toggleActive = async (service: Service) => {
    await update.mutateAsync({ id: service.id, is_active: !service.is_active });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-stone-900">Services</h1>
          <p className="mt-1 text-stone-600">Manage real estate consultations and appointment types.</p>
        </div>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4" />
          Add service
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {services?.map((service) => (
            <Card key={service.id} className={!service.is_active ? 'opacity-70' : ''}>
              <CardContent className="p-6">
                {service.image_url ? (
                  <div className="mb-4 h-32 w-full overflow-hidden rounded-xl">
                    <img src={service.image_url} alt={service.name} className="h-full w-full object-cover" />
                  </div>
                ) : null}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-50 text-navy-700">
                      <Store className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-stone-900">{service.name}</h3>
                      <p className="text-xs text-stone-500">{service.duration_minutes} minutes</p>
                    </div>
                  </div>
                  <Badge variant={service.is_active ? 'confirmed' : 'secondary'}>
                    {service.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <p className="mt-4 line-clamp-2 text-sm text-stone-600">{service.description}</p>
                <p className="mt-4 text-sm font-medium text-stone-900">
                  {service.price > 0 ? formatCurrency(service.price) : 'Complimentary'}
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <Button variant="outline" size="sm" onClick={() => openEdit(service)}>
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleActive(service)}
                  >
                    {service.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isOpen} onClose={close} title={editing ? 'Edit service' : 'New service'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="image_url">Service image</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <Input
                  id="image_url"
                  placeholder="Paste an image URL"
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  className="pl-9"
                />
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadImage.isPending}
              >
                <Upload className="h-4 w-4" />
                {uploadImage.isPending ? 'Uploading...' : 'Upload'}
              </Button>
              {form.image_url ? (
                <Button type="button" variant="outline" onClick={() => setForm({ ...form, image_url: '' })}>
                  <X className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
            {uploadImage.isError ? (
              <p className="text-sm text-red-600">Upload failed. Check your connection and try again.</p>
            ) : null}
            {form.image_url ? (
              <div className="h-40 w-full overflow-hidden rounded-xl border border-stone-200">
                <img src={form.image_url} alt="Preview" className="h-full w-full object-cover" />
              </div>
            ) : (
              <div className="flex h-24 w-full flex-col items-center justify-center rounded-xl border border-dashed border-stone-300 bg-stone-50 text-stone-400">
                <ImagePlus className="h-6 w-6" />
                <span className="mt-1 text-xs">Paste an image link or upload from your device</span>
              </div>
            )}
            <p className="text-xs text-stone-500">PNG, JPG, or WEBP. Uploaded images are stored in your Supabase storage.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input id="duration" type="number" min={15} step={5} value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: parseInt(e.target.value) || 0 })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price (USD)</Label>
              <Input id="price" type="number" min={0} step={1} value={form.price} onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) || 0 })} required />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="is_active"
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="h-4 w-4 rounded border-stone-300 text-navy-700 focus:ring-navy-700"
            />
            <Label htmlFor="is_active">Active on public website</Label>
          </div>
          {saveError ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{saveError}</p>
          ) : null}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={close}>Cancel</Button>
            <Button type="submit" disabled={create.isPending || update.isPending}>
              {create.isPending || update.isPending ? 'Saving...' : 'Save service'}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
