-- Run this in your Supabase SQL Editor to create tables, default data, and policies.
-- IMPORTANT: Create a Supabase Auth user via the dashboard, then insert their uuid into admin_users.

-- Tables (created only if they do not exist, with the exact required columns)
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  price INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE services ADD COLUMN IF NOT EXISTS image_url TEXT;

CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS business_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  weekday INTEGER NOT NULL UNIQUE,
  is_open BOOLEAN NOT NULL DEFAULT true,
  start_time TIME NOT NULL DEFAULT '09:00:00',
  end_time TIME NOT NULL DEFAULT '17:00:00'
);

CREATE TABLE IF NOT EXISTS blocked_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocked_date DATE NOT NULL UNIQUE,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS business_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name TEXT NOT NULL,
  business_email TEXT NOT NULL,
  business_phone TEXT NOT NULL,
  business_address TEXT NOT NULL,
  slot_interval_minutes INTEGER NOT NULL DEFAULT 30,
  booking_notice_hours INTEGER NOT NULL DEFAULT 24,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE IF EXISTS services ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS admin_users ENABLE ROW LEVEL SECURITY;

-- Services policies
DROP POLICY IF EXISTS "Public can view active services" ON services;
CREATE POLICY "Public can view active services"
  ON services FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

DROP POLICY IF EXISTS "Admin full access services" ON services;
CREATE POLICY "Admin full access services"
  ON services FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM admin_users))
  WITH CHECK (auth.uid() IN (SELECT user_id FROM admin_users));

-- Business hours policies
DROP POLICY IF EXISTS "Public can view business hours" ON business_hours;
CREATE POLICY "Public can view business hours"
  ON business_hours FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Admin full access business hours" ON business_hours;
CREATE POLICY "Admin full access business hours"
  ON business_hours FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM admin_users))
  WITH CHECK (auth.uid() IN (SELECT user_id FROM admin_users));

-- Blocked dates policies
DROP POLICY IF EXISTS "Public can view blocked dates" ON blocked_dates;
CREATE POLICY "Public can view blocked dates"
  ON blocked_dates FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Admin full access blocked dates" ON blocked_dates;
CREATE POLICY "Admin full access blocked dates"
  ON blocked_dates FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM admin_users))
  WITH CHECK (auth.uid() IN (SELECT user_id FROM admin_users));

-- Business settings policies
DROP POLICY IF EXISTS "Public can view business settings" ON business_settings;
CREATE POLICY "Public can view business settings"
  ON business_settings FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Admin full access business settings" ON business_settings;
CREATE POLICY "Admin full access business settings"
  ON business_settings FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM admin_users))
  WITH CHECK (auth.uid() IN (SELECT user_id FROM admin_users));

-- Appointments policies
DROP POLICY IF EXISTS "Public can insert appointments" ON appointments;
CREATE POLICY "Public can insert appointments"
  ON appointments FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admin full access appointments" ON appointments;
CREATE POLICY "Admin full access appointments"
  ON appointments FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM admin_users))
  WITH CHECK (auth.uid() IN (SELECT user_id FROM admin_users));

-- admin_users policy
DROP POLICY IF EXISTS "Admin can read own admin row" ON admin_users;
CREATE POLICY "Admin can read own admin row"
  ON admin_users FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Ensure weekday is unique for business hours
ALTER TABLE business_hours DROP CONSTRAINT IF EXISTS business_hours_weekday_unique;
ALTER TABLE business_hours ADD CONSTRAINT business_hours_weekday_unique UNIQUE (weekday);

-- Default business hours (Mon–Fri 9am–5pm, Sat 10am–2pm, Sun closed)
INSERT INTO business_hours (weekday, is_open, start_time, end_time)
VALUES
  (0, false, '09:00:00', '17:00:00'),
  (1, true,  '09:00:00', '17:00:00'),
  (2, true,  '09:00:00', '17:00:00'),
  (3, true,  '09:00:00', '17:00:00'),
  (4, true,  '09:00:00', '17:00:00'),
  (5, true,  '09:00:00', '17:00:00'),
  (6, true,  '10:00:00', '14:00:00')
ON CONFLICT (weekday) DO UPDATE SET
  is_open = EXCLUDED.is_open,
  start_time = EXCLUDED.start_time,
  end_time = EXCLUDED.end_time;

-- Default business settings
INSERT INTO business_settings (
  business_name,
  business_email,
  business_phone,
  business_address,
  slot_interval_minutes,
  booking_notice_hours
)
VALUES (
  'Kingsmere Property',
  'hello@kingsmere.property',
  '+1 (555) 123-4567',
  '123 Estate Avenue, Suite 400, New York, NY 10001',
  30,
  24
)
ON CONFLICT (id) DO UPDATE SET
  business_name = EXCLUDED.business_name,
  business_email = EXCLUDED.business_email,
  business_phone = EXCLUDED.business_phone,
  business_address = EXCLUDED.business_address,
  slot_interval_minutes = EXCLUDED.slot_interval_minutes,
  booking_notice_hours = EXCLUDED.booking_notice_hours;

-- Default services (deactivate first if you want to manage them from dashboard)
INSERT INTO services (name, description, duration_minutes, price, is_active)
VALUES
  ('Buyer Consultation', 'A focused session to understand your goals, budget, and ideal property so we can build a smart buying strategy together.', 60, 0, true),
  ('Seller Consultation', 'Review your property, discuss market positioning, and create a listing strategy that attracts the right buyers.', 60, 0, true),
  ('Property Viewing Appointment', 'Schedule an in-person or guided walkthrough of a property so you can experience the space and ask questions directly.', 45, 0, true),
  ('Home Valuation Consultation', 'Get a clear, market-based valuation of your home with comparable sales and pricing guidance for your timeline.', 45, 0, true),
  ('Investment Property Consultation', 'Explore income potential, financing considerations, and portfolio strategy for your next real estate investment.', 75, 150, true),
  ('Virtual Real Estate Consultation', 'Meet by video from anywhere. Ideal for initial questions, remote buyers, or a quick market update.', 30, 0, true)
ON CONFLICT (id) DO NOTHING;
