import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  Plus,
  BedDouble,
  Bath,
  MapPin,
  CalendarDays,
  Pencil,
  X,
  Save,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useListings, useCreateListing, useUpdateListing } from '@/hooks/useListing';
import type { Listing } from '@/types';

function formatPrice(price: string) {
  return price;
}

export function ListingsIndexPage() {
  const navigate = useNavigate();
  const { data: listings, isLoading } = useListings();
  const createListing = useCreateListing();
  const updateListing = useUpdateListing();
  const [showAdd, setShowAdd] = useState(false);
  const [quickPrice, setQuickPrice] = useState('');
  const [quickStatus, setQuickStatus] = useState('For Sale');
  const [quickTitle, setQuickTitle] = useState('');
  const [quickAddress, setQuickAddress] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim() || !quickAddress.trim()) return;
    await createListing.mutateAsync({
      title: quickTitle,
      subtitle: '',
      price: quickPrice || 'Guide price on application',
      status: quickStatus,
      address: quickAddress,
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
    });
    setShowAdd(false);
    setQuickTitle('');
    setQuickAddress('');
    setQuickPrice('');
    setQuickStatus('For Sale');
  };

  const cycleStatus = async (listing: Listing) => {
    const options = ['For Sale', 'Under Offer', 'Sold', 'Rent'];
    const idx = options.findIndex((s) => s.toLowerCase() === listing.status.toLowerCase());
    const next = options[(idx + 1) % options.length];
    await updateListing.mutateAsync({ id: listing.id, status: next });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-stone-900">Properties</h1>
          <p className="mt-1 text-stone-600">Manage all property listings shown on the public website.</p>
        </div>
        <Button onClick={() => setShowAdd(true)}>
          <Plus className="h-4 w-4" />
          Add property
        </Button>
      </div>

      {showAdd && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Add new property</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2 lg:col-span-2">
                <Label htmlFor="new-title">Title</Label>
                <Input
                  id="new-title"
                  value={quickTitle}
                  onChange={(e) => setQuickTitle(e.target.value)}
                  placeholder="The Coach House"
                  required
                />
              </div>
              <div className="space-y-2 lg:col-span-2">
                <Label htmlFor="new-address">Address</Label>
                <Input
                  id="new-address"
                  value={quickAddress}
                  onChange={(e) => setQuickAddress(e.target.value)}
                  placeholder="Kingsmere, Newbury, Berkshire"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-price">Price</Label>
                <Input
                  id="new-price"
                  value={quickPrice}
                  onChange={(e) => setQuickPrice(e.target.value)}
                  placeholder="£1,250,000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-status">Status</Label>
                <select
                  id="new-status"
                  value={quickStatus}
                  onChange={(e) => setQuickStatus(e.target.value)}
                  className="h-10 w-full rounded-lg border border-stone-300 bg-white px-3 text-sm text-stone-900"
                >
                  <option>For Sale</option>
                  <option>Under Offer</option>
                  <option>Sold</option>
                  <option>Rent</option>
                </select>
              </div>
              <div className="flex items-end gap-2 lg:col-span-4">
                <Button type="submit" disabled={createListing.isPending}>
                  <Save className="h-4 w-4" />
                  {createListing.isPending ? 'Creating...' : 'Create property'}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setShowAdd(false)}>
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      ) : !listings || listings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-navy-50 text-navy-700">
            <Building2 className="h-6 w-6" />
          </div>
          <h2 className="mt-5 text-lg font-semibold text-stone-900">No properties yet</h2>
          <p className="mt-2 text-sm text-stone-600">Add a property to feature it on the public website.</p>
          <Button onClick={() => setShowAdd(true)} className="mt-6">
            <Plus className="h-4 w-4" />
            Add property
          </Button>
        </div>
      ) : (
        <div className="grid gap-5">
          {listings.map((listing) => (
            <Card
              key={listing.id}
              className="overflow-hidden transition-shadow duration-300 hover:shadow-soft"
            >
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row">
                  <div className="relative h-48 w-full flex-shrink-0 sm:h-auto sm:w-56">
                    <img
                      src={listing.images[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=600'}
                      alt={listing.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-stone-900 backdrop-blur-sm">
                      {listing.status}
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col justify-between p-6">
                    <div>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="font-serif text-2xl text-stone-900">{listing.title}</h3>
                          <div className="mt-1 flex items-center gap-1 text-sm text-stone-500">
                            <MapPin className="h-3.5 w-3.5" />
                            {listing.address}
                          </div>
                        </div>
                        <p className="font-serif text-2xl text-gold-600">{formatPrice(listing.price)}</p>
                      </div>
                      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-stone-600">
                        <span className="flex items-center gap-1.5 rounded-lg bg-stone-50 px-3 py-1.5">
                          <BedDouble className="h-4 w-4 text-navy-700" />
                          {listing.beds} beds
                        </span>
                        <span className="flex items-center gap-1.5 rounded-lg bg-stone-50 px-3 py-1.5">
                          <Bath className="h-4 w-4 text-navy-700" />
                          {listing.baths} baths
                        </span>
                        <span className="flex items-center gap-1.5 rounded-lg bg-stone-50 px-3 py-1.5">
                          <CalendarDays className="h-4 w-4 text-navy-700" />
                          Added {new Date(listing.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => cycleStatus(listing)}
                        disabled={updateListing.isPending}
                      >
                        Cycle status
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/admin/listing/edit?id=${listing.id}`)}
                      >
                        <Pencil className="h-4 w-4" />
                        Edit details
                      </Button>
                      <Link
                        to={`/listing?id=${listing.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto text-sm font-medium text-navy-700 hover:underline"
                      >
                        View public page →
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
