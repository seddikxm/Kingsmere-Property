-- Run this in your Supabase SQL Editor to add listing management.

CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  price TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'For Sale',
  address TEXT NOT NULL,
  beds INTEGER NOT NULL DEFAULT 0,
  baths INTEGER NOT NULL DEFAULT 0,
  sqft TEXT NOT NULL DEFAULT '',
  acres TEXT NOT NULL DEFAULT '',
  cars INTEGER NOT NULL DEFAULT 0,
  description TEXT NOT NULL,
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  amenities JSONB NOT NULL DEFAULT '[]'::jsonb,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  agent_name TEXT NOT NULL,
  agent_role TEXT NOT NULL,
  agent_phone TEXT NOT NULL,
  agent_email TEXT NOT NULL,
  agent_image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE IF EXISTS listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view listings" ON listings;
CREATE POLICY "Public can view listings"
  ON listings FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Admin full access listings" ON listings;
CREATE POLICY "Admin full access listings"
  ON listings FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM admin_users))
  WITH CHECK (auth.uid() IN (SELECT user_id FROM admin_users));

-- Insert a default listing if none exists
INSERT INTO listings (
  title, subtitle, price, status, address, beds, baths, sqft, acres, cars,
  description, images, amenities, features,
  agent_name, agent_role, agent_phone, agent_email, agent_image
)
SELECT
  'The Grange',
  'A refined country house with parkland views',
  '$3,450,000',
  'For Sale',
  'Kingsmere Lane, Newbury, Berkshire, RG14 7PA',
  5,
  4,
  '4,850',
  '1.2',
  3,
  'Set behind a private gated entrance, The Grange is a beautifully restored five-bedroom country house arranged over three light-filled floors. The property balances period character with a confident contemporary sensibility — tall sash windows, wide plank oak floors, and a double-height entrance hall create an immediate sense of arrival. The principal reception rooms open directly onto landscaped gardens, while a bespoke kitchen by Smallbone sits at the heart of the home. The first-floor principal suite enjoys a dressing room and a spa-like bathroom. Four further bedrooms, two with en-suite bathrooms, sit across the upper floors. Outside, a south-facing terrace, walled kitchen garden, and established parkland trees frame the plot.',
  '[
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=2400",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1600",
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=1600",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=1600",
    "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&q=80&w=1600",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1600"
  ]'::jsonb,
  '[
    {"label":"5 bedrooms","icon":"BedDouble"},
    {"label":"4 bathrooms","icon":"Bath"},
    {"label":"4,850 sq ft","icon":"Maximize"},
    {"label":"Triple garage","icon":"Car"},
    {"label":"1.2 acres","icon":"Trees"},
    {"label":"Heated pool","icon":"Waves"},
    {"label":"Underfloor heating","icon":"Flame"},
    {"label":"Bespoke kitchen","icon":"ChefHat"},
    {"label":"Walk-in wardrobes","icon":"Shirt"},
    {"label":"Media room","icon":"Tv"},
    {"label":"Fibre broadband","icon":"Wifi"},
    {"label":"Home gym","icon":"Dumbbell"}
  ]'::jsonb,
  '[
    "Gated private entrance",
    "Double-height entrance hall",
    "Principal suite with dressing room",
    "South-facing terrace",
    "Walled kitchen garden",
    "Period character with contemporary restoration"
  ]'::jsonb,
  'Eleanor Whitfield',
  'Senior Property Consultant',
  '+44 (0) 1635 882 410',
  'eleanor@kingsmere.property',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400'
WHERE NOT EXISTS (SELECT 1 FROM listings LIMIT 1);
