export type Service = {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number;
  is_active: boolean;
  image_url: string | null;
  created_at: string;
};

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export type Appointment = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  service_id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  notes: string | null;
  created_at: string;
  service?: Service | null;
};

export type BusinessHours = {
  id: string;
  weekday: number;
  is_open: boolean;
  start_time: string;
  end_time: string;
};

export type BlockedDate = {
  id: string;
  blocked_date: string;
  reason: string | null;
  created_at: string;
};

export type BusinessSettings = {
  id: string;
  business_name: string;
  business_email: string;
  business_phone: string;
  business_address: string;
  slot_interval_minutes: number;
  booking_notice_hours: number;
  created_at: string;
};

export type AdminUser = {
  id: string;
  user_id: string;
  created_at: string;
};

export type BusinessLogo = {
  id: string;
  logo_url: string;
  created_at: string;
};

export type ListingAmenity = {
  label: string;
  icon: string;
};

export type Listing = {
  id: string;
  title: string;
  subtitle: string | null;
  price: string;
  status: string;
  address: string;
  beds: number;
  baths: number;
  sqft: string;
  acres: string;
  cars: number;
  description: string;
  images: string[];
  amenities: ListingAmenity[];
  features: string[];
  agent_name: string;
  agent_role: string;
  agent_phone: string;
  agent_email: string;
  agent_image: string | null;
  created_at: string;
  updated_at: string;
};
