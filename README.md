# Kingsmere Property

A premium real estate agent booking platform built with React, TypeScript, Vite, and Supabase.

## Features

- **Public website**: premium, image-led experience for clients to view services and book consultations.
- **Booking flow**: multi-step service → date → time → details → confirmation with live availability.
- **Secure admin dashboard**: Supabase Auth-protected with role checks against `admin_users.user_id`.
- **Admin tools**: appointments, services, property listing, business hours, blocked dates, and business settings.

## Tech stack

- React 19 + TypeScript
- Vite
- Tailwind CSS 3
- @tanstack/react-query
- @supabase/supabase-js
- date-fns
- lucide-react

## Local development

```bash
npm install
npm run dev
```

The dev server will start on the first available port (e.g. http://localhost:5175/).

## Environment variables

`.env.local` is already created with your Supabase credentials. If you need to regenerate or change them, update:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Supabase setup

1. Create the tables using the schema specified in the project brief. Columns must be named exactly:
   - `services`: id, name, description, duration_minutes, price, is_active, created_at
   - `appointments`: id, full_name, email, phone, service_id, appointment_date, start_time, end_time, status, notes, created_at
   - `business_hours`: id, weekday, is_open, start_time, end_time
   - `blocked_dates`: id, blocked_date, reason, created_at
   - `business_settings`: id, business_name, business_email, business_phone, business_address, slot_interval_minutes, booking_notice_hours, created_at
   - `admin_users`: id, user_id, created_at

2. Run the SQL migrations in `src/lib/migrations/` in order in the Supabase SQL Editor:
   - `01_availability_rpc.sql` — creates public RPCs for availability checks.
   - `02_schema_and_policies.sql` — creates RLS policies, default hours, default settings, and default services.
   - `04_business_logo.sql` — creates the `business_logos` table and storage bucket for logo uploads.
   - `05_listings.sql` — creates the `listings` table and seeds a default featured property.

3. Create an admin user:
   - In the Supabase Auth dashboard, create a new user (or sign up a user).
   - Copy the user's UUID.
   - Insert the UUID into `admin_users`:

     ```sql
     INSERT INTO admin_users (user_id) VALUES ('PASTE_USER_UUID_HERE');
     ```

4. Visit `/admin/login` and sign in with the admin email and password.

## Production build

```bash
npm run build
```

Static files are output to `dist/` and can be deployed to Vercel, Netlify, or any static host.

## Project structure

```
src/
  components/ui/    # reusable UI primitives
  hooks/          # data and auth hooks
  lib/            # Supabase client, availability engine, constants, migrations
  pages/          # public and admin pages
  sections/       # public website sections
  types/          # shared TypeScript types
```

## Important notes

- The booking flow inserts appointments without reading the full appointments table. Availability uses the `get_appointments_for_date_range` RPC function so public users never need a SELECT policy on `appointments`.
- Admin access is verified by checking `admin_users.user_id` against the authenticated user's ID.
- Inactive services remain in the dashboard but are hidden from the public booking page.
