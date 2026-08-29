-- Run this in your Supabase SQL Editor to enable public availability checks
-- without exposing private appointment details.

-- Function: returns minimal appointment intervals for a date range
CREATE OR REPLACE FUNCTION get_appointments_for_date_range(
  start_date DATE,
  end_date DATE
)
RETURNS TABLE (
  appointment_date DATE,
  start_time TIME,
  end_time TIME,
  status TEXT
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT
    appointment_date,
    start_time,
    end_time,
    status
  FROM appointments
  WHERE appointment_date BETWEEN start_date AND end_date
    AND status != 'cancelled';
$$;

-- Grant execute to anonymous (public) users so the booking flow can check slots.
GRANT EXECUTE ON FUNCTION get_appointments_for_date_range(DATE, DATE) TO anon;
GRANT EXECUTE ON FUNCTION get_appointments_for_date_range(DATE, DATE) TO authenticated;

-- Optional: a helper to fetch all public business hours.
CREATE OR REPLACE FUNCTION get_public_business_hours()
RETURNS TABLE (
  id UUID,
  weekday INT,
  is_open BOOLEAN,
  start_time TIME,
  end_time TIME
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT id, weekday, is_open, start_time, end_time
  FROM business_hours;
$$;

GRANT EXECUTE ON FUNCTION get_public_business_hours() TO anon;
GRANT EXECUTE ON FUNCTION get_public_business_hours() TO authenticated;

-- Optional: a helper to fetch blocked dates for the public booking flow.
CREATE OR REPLACE FUNCTION get_public_blocked_dates()
RETURNS TABLE (
  id UUID,
  blocked_date DATE,
  reason TEXT
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT id, blocked_date, reason
  FROM blocked_dates;
$$;

GRANT EXECUTE ON FUNCTION get_public_blocked_dates() TO anon;
GRANT EXECUTE ON FUNCTION get_public_blocked_dates() TO authenticated;
