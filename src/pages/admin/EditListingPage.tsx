import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Building2, GripVertical, Plus, Save, Trash2, X, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useListing, useUpdateListing } from '@/hooks/useListing';
import type { Listing, ListingAmenity } from '@/types';

const amenityIcons = [
  'BedDouble', 'Bath', 'Maximize', 'Car', 'Trees', 'Waves', 'Flame', 'ChefHat',
  'Shirt', 'Tv', 'Wifi', 'Dumbbell', 'Home', 'MapPin', 'Phone', 'Mail', 'Calendar',
];

const emptyListing: Omit<Listing, 'id' | 'created_at' | 'updated_at'> = {
  title: '',
  subtitle: '',
  price: '',
  status: 'For Sale',
  address: '',
  beds: 0,
  baths: 0,
  sqft: '',
  acres: '',
  cars: 0,
  description: '',
  images: [],
  amenities: [],
  features: [],
  agent_name: '',
  agent_role: '',
  agent_phone: '',
  agent_email: '',
  agent_image: '',
};

export function EditListingPage() {
  const [searchParams] = useSearchParams();
  const listingId = searchParams.get('id');
  const { data: listing, isLoading } = useListing(listingId);
  const update = useUpdateListing();
  const navigate = useNavigate();
  const [form, setForm] = useState<Omit<Listing, 'id' | 'created_at' | 'updated_at'>>(emptyListing);
  const [newImage, setNewImage] = useState('');
  const [newFeature, setNewFeature] = useState('');
  const [newAmenity, setNewAmenity] = useState<ListingAmenity>({ label: '', icon: 'BedDouble' });

  useEffect(() => {
    if (listing) {
      setForm({
        title: listing.title,
        subtitle: (listing.subtitle || '') as string,
        price: listing.price,
        status: listing.status,
        address: listing.address,
        beds: listing.beds,
        baths: listing.baths,
        sqft: listing.sqft,
        acres: listing.acres,
        cars: listing.cars,
        description: listing.description,
        images: listing.images || [],
        amenities: listing.amenities || [],
        features: listing.features || [],
        agent_name: listing.agent_name,
        agent_role: listing.agent_role,
        agent_phone: listing.agent_phone,
        agent_email: listing.agent_email,
        agent_image: (listing.agent_image || '') as string,
      });
    }
  }, [listing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listing) return;
    await update.mutateAsync({ id: listing.id, ...form });
  };

  const addImage = () => {
    if (!newImage.trim()) return;
    setForm({ ...form, images: [...form.images, newImage.trim()] });
    setNewImage('');
  };

  const removeImage = (index: number) => {
    setForm({ ...form, images: form.images.filter((_, i) => i !== index) });
  };

  const moveImage = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= form.images.length) return;
    const images = [...form.images];
    [images[index], images[newIndex]] = [images[newIndex], images[index]];
    setForm({ ...form, images });
  };

  const addFeature = () => {
    if (!newFeature.trim()) return;
    setForm({ ...form, features: [...form.features, newFeature.trim()] });
    setNewFeature('');
  };

  const removeFeature = (index: number) => {
    setForm({ ...form, features: form.features.filter((_, i) => i !== index) });
  };

  const addAmenity = () => {
    if (!newAmenity.label.trim()) return;
    setForm({ ...form, amenities: [...form.amenities, { ...newAmenity }] });
    setNewAmenity({ label: '', icon: 'BedDouble' });
  };

  const removeAmenity = (index: number) => {
    setForm({ ...form, amenities: form.amenities.filter((_, i) => i !== index) });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="space-y-4">
          {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button
            onClick={() => navigate('/admin/listing')}
            className="mb-2 flex items-center gap-1.5 text-sm font-medium text-stone-500 transition-colors hover:text-navy-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to properties
          </button>
          <h1 className="text-3xl font-bold tracking-tight text-stone-900">Property listing</h1>
          <p className="mt-1 text-stone-600">Manage the featured property shown on the public listing page.</p>
        </div>
        <Button onClick={handleSubmit} disabled={update.isPending || !listing}>
          <Save className="h-4 w-4" />
          {update.isPending ? 'Saving...' : 'Save listing'}
        </Button>
      </div>

      {!listing ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-10 text-center text-stone-500">
          No listing found. Run the latest migration to seed the default listing.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-50 text-navy-700">
                  <Building2 className="h-5 w-5" />
                </div>
                <CardTitle>Property details</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="subtitle">Subtitle</Label>
                  <Input id="subtitle" value={form.subtitle || ''} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <Input id="price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Input id="status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} required />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="beds">Bedrooms</Label>
                  <Input id="beds" type="number" value={form.beds} onChange={(e) => setForm({ ...form, beds: parseInt(e.target.value) || 0 })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="baths">Bathrooms</Label>
                  <Input id="baths" type="number" value={form.baths} onChange={(e) => setForm({ ...form, baths: parseInt(e.target.value) || 0 })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sqft">Sq Ft</Label>
                  <Input id="sqft" value={form.sqft} onChange={(e) => setForm({ ...form, sqft: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="acres">Acres</Label>
                  <Input id="acres" value={form.acres} onChange={(e) => setForm({ ...form, acres: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cars">Garage spaces</Label>
                  <Input id="cars" type="number" value={form.cars} onChange={(e) => setForm({ ...form, cars: parseInt(e.target.value) || 0 })} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="min-h-[180px]" required />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Image URL"
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addImage(); } }}
                />
                <Button type="button" onClick={addImage}>
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>
              <div className="space-y-2">
                {form.images.map((img, idx) => (
                  <div key={idx} className="flex items-center gap-3 rounded-xl border border-stone-200 bg-stone-50 p-3">
                    <img src={img} alt="" className="h-12 w-16 rounded-lg object-cover" />
                    <p className="flex-1 truncate text-sm text-stone-600">{img}</p>
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => moveImage(idx, -1)} disabled={idx === 0} className="rounded p-1 text-stone-400 hover:bg-stone-200 disabled:opacity-30">
                        <GripVertical className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => removeImage(idx)} className="rounded p-1 text-red-500 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Feature (e.g. Gated private entrance)"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addFeature(); } }}
                />
                <Button type="button" onClick={addFeature}>
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>
              <ul className="space-y-2">
                {form.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center justify-between rounded-xl border border-stone-200 bg-white px-4 py-3">
                    <span className="text-sm text-stone-900">{feature}</span>
                    <button type="button" onClick={() => removeFeature(idx)} className="text-stone-400 hover:text-red-500">
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Amenities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Amenity label"
                  value={newAmenity.label}
                  onChange={(e) => setNewAmenity({ ...newAmenity, label: e.target.value })}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addAmenity(); } }}
                />
                <select
                  value={newAmenity.icon}
                  onChange={(e) => setNewAmenity({ ...newAmenity, icon: e.target.value })}
                  className="rounded-lg border border-stone-300 bg-white px-3 text-sm text-stone-900"
                >
                  {amenityIcons.map((icon) => (
                    <option key={icon} value={icon}>{icon}</option>
                  ))}
                </select>
                <Button type="button" onClick={addAmenity}>
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>
              <ul className="space-y-2">
                {form.amenities.map((amenity, idx) => (
                  <li key={idx} className="flex items-center justify-between rounded-xl border border-stone-200 bg-white px-4 py-3">
                    <span className="text-sm text-stone-900">{amenity.label} ({amenity.icon})</span>
                    <button type="button" onClick={() => removeAmenity(idx)} className="text-stone-400 hover:text-red-500">
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Agent</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="agent_name">Name</Label>
                  <Input id="agent_name" value={form.agent_name} onChange={(e) => setForm({ ...form, agent_name: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="agent_role">Role</Label>
                  <Input id="agent_role" value={form.agent_role} onChange={(e) => setForm({ ...form, agent_role: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="agent_phone">Phone</Label>
                  <Input id="agent_phone" type="tel" value={form.agent_phone} onChange={(e) => setForm({ ...form, agent_phone: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="agent_email">Email</Label>
                  <Input id="agent_email" type="email" value={form.agent_email} onChange={(e) => setForm({ ...form, agent_email: e.target.value })} required />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="agent_image">Agent photo URL</Label>
                  <Input id="agent_image" value={form.agent_image || ''} onChange={(e) => setForm({ ...form, agent_image: e.target.value })} />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={update.isPending} size="lg">
              <Save className="h-4 w-4" />
              {update.isPending ? 'Saving...' : 'Save listing'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
