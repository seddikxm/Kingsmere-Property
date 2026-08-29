import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { format, isPast, startOfDay } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useServices } from '@/hooks/useServices';
import { useBusinessHours } from '@/hooks/useBusinessHours';
import { useBlockedDates } from '@/hooks/useBlockedDates';
import { useBusinessSettings } from '@/hooks/useBusinessSettings';
import { useBookAppointment } from '@/hooks/useAppointments';
import { usePublicAppointments } from '@/hooks/usePublicAppointments';
import { generateTimeSlots, toSupabaseDate, toSupabaseTime } from '@/lib/availability';
import { formatCurrency } from '@/lib/utils';
import { Check, ChevronLeft, ChevronRight, Clock, CalendarDays, User, Mail, Phone, MessageSquare } from 'lucide-react';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ScrollReveal';
import type { Appointment, Service } from '@/types';

interface BookingProps {
  preselectedService?: Service | null;
}

export function Booking({ preselectedService }: BookingProps) {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(preselectedService || null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date; label: string } | null>(null);
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', notes: '' });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (preselectedService) {
      setSelectedService(preselectedService);
      setStep(2);
    }
  }, [preselectedService]);

  const { data: services, isLoading: servicesLoading } = useServices(true);
  const { data: businessHours } = useBusinessHours();
  const { data: blockedDates } = useBlockedDates();
  const { data: publicAppointments } = usePublicAppointments(selectedDate);
  const { data: settings } = useBusinessSettings();
  const bookAppointment = useBookAppointment();

  const slotInterval = settings?.slot_interval_minutes ?? 30;
  const bookingNoticeHours = settings?.booking_notice_hours ?? 24;

  const slots = useMemo(() => {
    if (!selectedService || !selectedDate || !businessHours || !blockedDates || !publicAppointments || !settings) return [];
    return generateTimeSlots(
      selectedDate,
      selectedService.duration_minutes,
      slotInterval,
      businessHours,
      blockedDates,
      publicAppointments as Appointment[],
      bookingNoticeHours
    );
  }, [selectedService, selectedDate, businessHours, blockedDates, publicAppointments, settings, slotInterval, bookingNoticeHours]);

  const isDateDisabled = (date: Date) => {
    if (isPast(startOfDay(date))) return true;
    const weekday = date.getDay();
    const dayHours = businessHours?.find((h) => h.weekday === weekday);
    if (!dayHours || !dayHours.is_open) return true;
    return false;
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setStep(2);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot: { start: Date; end: Date; label: string }) => {
    setSelectedSlot(slot);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!selectedService || !selectedSlot) return;

    try {
      await bookAppointment.mutateAsync({
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        service_id: selectedService.id,
        appointment_date: toSupabaseDate(selectedSlot.start),
        start_time: toSupabaseTime(selectedSlot.start),
        end_time: toSupabaseTime(selectedSlot.end),
        notes: form.notes || null,
      });
      setSubmitted(true);
      setStep(4);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  };

  const canProceed = () => {
    if (step === 2) return !!selectedDate && !!selectedSlot;
    if (step === 3) return form.full_name && form.email && form.phone;
    return true;
  };

  return (
    <section id="booking" className="relative bg-navy-950 py-24">
      <div className="absolute inset-0 opacity-20">
        <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=2400" alt="" className="h-full w-full object-cover" />
      </div>
      <div className="relative z-10 mx-auto max-w-6xl px-6 lg:px-8">
        <ScrollReveal className="mb-12 text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-gold-400">Book your appointment</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Reserve your real estate consultation
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/70">
            Select a service, choose a convenient time, and share a few details. We will confirm your appointment shortly.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <Card className="mx-auto max-w-4xl overflow-hidden border-white/10 shadow-lift">
          <div className="border-b border-stone-100 bg-stone-50/80 px-6 py-4">
            <div className="flex items-center justify-between">
              {['Service', 'Date & Time', 'Your Details', 'Confirmation'].map((label, idx) => {
                const stepNumber = idx + 1;
                const active = step === stepNumber;
                const completed = step > stepNumber;
                return (
                  <div key={label} className="flex flex-1 items-center">
                    <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-3">
                      <motion.div
                        layout
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                          completed ? 'bg-emerald-500 text-white' : active ? 'bg-navy-800 text-white' : 'bg-stone-200 text-stone-500'
                        }`}
                      >
                        {completed ? <Check className="h-4 w-4" /> : stepNumber}
                      </motion.div>
                      <motion.span
                        animate={{ opacity: active ? 1 : 0.6 }}
                        className={`hidden text-sm font-medium sm:block ${active ? 'text-stone-900' : 'text-stone-500'}`}
                      >
                        {label}
                      </motion.span>
                    </div>
                    {idx < 3 && (
                      <div className="mx-4 hidden h-px flex-1 overflow-hidden rounded-full bg-stone-200 sm:block">
                        <motion.div
                          className="h-full bg-navy-700"
                          initial={{ width: '0%' }}
                          animate={{ width: completed ? '100%' : '0%' }}
                          transition={{ duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <CardContent className="p-6 sm:p-10">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
                >
                  <h3 className="mb-6 flex items-center gap-2 text-xl font-semibold text-stone-900">
                    <CalendarDays className="h-5 w-5 text-navy-700" />
                    Select a service
                  </h3>
                  {servicesLoading ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
                    </div>
                  ) : (
                    <StaggerContainer className="grid gap-4 sm:grid-cols-2" stagger={0.06}>
                      {services?.map((service) => (
                        <StaggerItem key={service.id}>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleServiceSelect(service)}
                            className={`flex w-full flex-col rounded-2xl border p-5 text-left transition-all hover:shadow-soft ${
                              selectedService?.id === service.id
                                ? 'border-navy-700 bg-navy-50 ring-1 ring-navy-700'
                                : 'border-stone-200 bg-white hover:border-stone-300'
                            }`}
                          >
                            <span className="text-base font-semibold text-stone-900">{service.name}</span>
                            <span className="mt-1 text-sm text-stone-500 line-clamp-2">{service.description}</span>
                            <div className="mt-4 flex items-center gap-3 text-sm text-stone-600">
                              <Clock className="h-4 w-4" />
                              <span>{service.duration_minutes} min</span>
                              {service.price > 0 && (
                                <>
                                  <span>•</span>
                                  <span>{formatCurrency(service.price)}</span>
                                </>
                              )}
                            </div>
                          </motion.button>
                        </StaggerItem>
                      ))}
                    </StaggerContainer>
                  )}
                </motion.div>
              )}

            {step === 2 && selectedService && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
              >
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-xl font-semibold text-stone-900">
                    <CalendarDays className="h-5 w-5 text-navy-700" />
                    Select date and time
                  </h3>
                  <Badge variant="secondary">{selectedService.name}</Badge>
                </div>
                <div className="grid gap-8 lg:grid-cols-2">
                  <div>
                    <Calendar
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      disabled={isDateDisabled}
                    />
                    {selectedDate && (
                      <p className="mt-4 text-sm text-stone-600">
                        Selected date: <span className="font-semibold text-stone-900">{format(selectedDate, 'EEEE, MMMM do')}</span>
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="mb-3 block text-sm font-medium text-stone-700">
                      Available times
                    </Label>
                    {selectedDate ? (
                      slots.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                          {slots.map((slot) => (
                            <button
                              key={slot.label}
                              onClick={() => handleSlotSelect(slot)}
                              className={`rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                                selectedSlot?.label === slot.label
                                  ? 'border-navy-700 bg-navy-800 text-white shadow-soft'
                                  : 'border-stone-200 bg-white text-stone-700 hover:border-navy-300 hover:bg-navy-50'
                              }`}
                            >
                              {slot.label}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-stone-200 bg-stone-50 p-6 text-center">
                          <p className="text-stone-600">No available slots for this date.</p>
                          <p className="mt-1 text-sm text-stone-500">Please select another date.</p>
                        </div>
                      )
                    ) : (
                      <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-8 text-center text-stone-500">
                        Choose a date to see available times.
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && selectedService && selectedSlot && selectedDate && (
              <motion.form
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
                onSubmit={handleSubmit}
              >
                <h3 className="mb-6 flex items-center gap-2 text-xl font-semibold text-stone-900">
                  <User className="h-5 w-5 text-navy-700" />
                  Your details
                </h3>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                      <Input id="full_name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="pl-10" placeholder="Jane Smith" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                      <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="pl-10" placeholder="jane@example.com" required />
                    </div>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="phone">Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                      <Input id="phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="pl-10" placeholder="(555) 123-4567" required />
                    </div>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="notes">Notes <span className="text-stone-400">(optional)</span></Label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
                      <Textarea id="notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="min-h-[100px] pl-10" placeholder="What would you like to discuss?" />
                    </div>
                  </div>
                </div>

                <div className="mt-8 rounded-2xl border border-stone-200 bg-stone-50 p-5">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-stone-500">Appointment summary</h4>
                  <div className="mt-3 space-y-1 text-sm">
                    <p><span className="text-stone-500">Service:</span> <span className="font-medium text-stone-900">{selectedService.name}</span></p>
                    <p><span className="text-stone-500">Date:</span> <span className="font-medium text-stone-900">{format(selectedDate, 'EEEE, MMMM do, yyyy')}</span></p>
                    <p><span className="text-stone-500">Time:</span> <span className="font-medium text-stone-900">{selectedSlot.label} — {format(selectedSlot.end, 'h:mm a')}</span></p>
                  </div>
                </div>

                {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
              </motion.form>
            )}

            {step === 4 && submitted && selectedService && selectedSlot && selectedDate && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
                className="text-center"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                  <Check className="h-8 w-8 text-emerald-700" />
                </div>
                <h3 className="mt-6 text-2xl font-bold text-stone-900">Your consultation is requested</h3>
                <p className="mt-2 text-stone-600">We have received your appointment request and will confirm shortly.</p>
                <div className="mx-auto mt-8 max-w-md rounded-2xl border border-stone-200 bg-stone-50 p-6 text-left">
                  <p className="text-sm text-stone-500">Service</p>
                  <p className="font-semibold text-stone-900">{selectedService.name}</p>
                  <p className="mt-3 text-sm text-stone-500">Date & time</p>
                  <p className="font-semibold text-stone-900">{format(selectedDate, 'MMMM do, yyyy')} at {selectedSlot.label}</p>
                  <p className="mt-3 text-sm text-stone-500">Client</p>
                  <p className="font-semibold text-stone-900">{form.full_name}</p>
                </div>
                <Button
                  onClick={() => {
                    setStep(1);
                    setSelectedService(null);
                    setSelectedDate(undefined);
                    setSelectedSlot(null);
                    setForm({ full_name: '', email: '', phone: '', notes: '' });
                    setSubmitted(false);
                  }}
                  className="mt-8"
                >
                  Book another appointment
                </Button>
              </motion.div>
            )}
            </AnimatePresence>
          </CardContent>

          {step < 4 && (
            <div className="flex items-center justify-between border-t border-stone-100 px-6 py-5 sm:px-10">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep(Math.max(1, step - 1))}
                disabled={step === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
              {step < 3 ? (
                <Button type="button" onClick={() => setStep(step + 1)} disabled={!canProceed()}>
                  Continue
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button type="button" onClick={handleSubmit} disabled={!canProceed() || bookAppointment.isPending}>
                  {bookAppointment.isPending ? 'Booking...' : 'Confirm booking'}
                  <Check className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </Card>
        </ScrollReveal>
      </div>
    </section>
  );
}
