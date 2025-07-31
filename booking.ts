import { v4 as uuidv4 } from 'uuid';

// Types representing the appointment booking system.  A Slot represents a window
// of time when an appointment can occur.  A Hold represents a tentative
// reservation of a slot by a customer which expires after a short period.  A
// confirmed booking is represented by a Hold whose status is set to "booked".
export interface Slot {
  /** Identifier for the slot */
  id: string;
  /** ISO string for the start of the slot */
  start: string;
  /** ISO string for the end of the slot */
  end: string;
}

export interface Customer {
  name: string;
  phone: string;
  email?: string;
}

export interface Hold {
  appointmentId: string;
  slot: Slot;
  customer: Customer;
  status: 'hold' | 'booked';
  holdExpiresAt: Date;
  paymentId?: string;
}

interface BookingStore {
  slots: Slot[];
  holds: Hold[];
}

/*
 * Initialise a singleton booking store.  Netlify functions run in a single
 * process for a short period, so using a global variable is sufficient for
 * demo purposes.  When the module is first imported the store is created
 * with time slots for today and tomorrow between 9 AM and 5 PM in one hour
 * increments.
 */
function initStore(): BookingStore {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  function generateDaySlots(day: Date): Slot[] {
    const slots: Slot[] = [];
    // Appointments every hour from 9:00 until 16:00 inclusive (i.e. 9am to 5pm)
    for (let hour = 9; hour <= 16; hour++) {
      const startDate = new Date(day.getTime());
      startDate.setHours(hour, 0, 0, 0);
      const endDate = new Date(day.getTime());
      endDate.setHours(hour + 1, 0, 0, 0);
      slots.push({ id: uuidv4(), start: startDate.toISOString(), end: endDate.toISOString() });
    }
    return slots;
  }

  return {
    slots: [...generateDaySlots(today), ...generateDaySlots(tomorrow)],
    holds: [],
  };
}

// Expose the global store via a symbol on the globalThis object.  If the
// property already exists we reuse it; otherwise we create a new store.
const globalRef: any = globalThis as any;
if (!globalRef.__frontdesk_booking_store) {
  globalRef.__frontdesk_booking_store = initStore();
}
const store: BookingStore = globalRef.__frontdesk_booking_store;

/**
 * Remove any holds that have expired.  Expired holds free up their slots for
 * other customers.  This function should be called before reading the list of
 * open slots.
 */
function purgeExpiredHolds() {
  const now = new Date().getTime();
  store.holds = store.holds.filter((hold) => {
    if (hold.status === 'hold' && hold.holdExpiresAt.getTime() < now) {
      return false;
    }
    return true;
  });
}

/**
 * Return all slots which are not currently booked or held.  Optional date
 * parameter filters the results to only include slots on a given day.  The date
 * should be provided as a YYYY-MM-DD string.  Holds that have expired are
 * automatically purged before computing availability.
 */
export function getOpenSlots(date?: string): Slot[] {
  purgeExpiredHolds();
  const heldOrBookedIds = new Set(
    store.holds
      .filter((h) => h.status === 'hold' || h.status === 'booked')
      .map((h) => h.slot.id)
  );
  return store.slots.filter((slot) => {
    if (heldOrBookedIds.has(slot.id)) return false;
    if (date) {
      return slot.start.startsWith(date);
    }
    return true;
  });
}

/**
 * Place a hold on a slot for a customer.  Returns an appointment ID and
 * expiration time.  If the slot is already held or booked an error is thrown.
 */
export function createHold(slotId: string, customer: Customer): { appointmentId: string; holdExpiresAt: string } {
  purgeExpiredHolds();
  const slot = store.slots.find((s) => s.id === slotId);
  if (!slot) {
    throw new Error('Slot not found');
  }
  // ensure slot not already held or booked
  const exists = store.holds.some((h) => (h.status === 'hold' || h.status === 'booked') && h.slot.id === slotId);
  if (exists) {
    throw new Error('Slot is no longer available');
  }
  const appointmentId = uuidv4();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  const hold: Hold = {
    appointmentId,
    slot,
    customer,
    status: 'hold',
    holdExpiresAt: expiresAt,
  };
  store.holds.push(hold);
  return { appointmentId, holdExpiresAt: expiresAt.toISOString() };
}

/**
 * Confirm a held appointment by ID.  If found and still on hold it will
 * transition to booked.  Optionally record the payment identifier.  Returns
 * true if a booking was confirmed, false if not found or already booked.
 */
export function confirmHold(appointmentId: string, paymentId?: string): boolean {
  purgeExpiredHolds();
  const hold = store.holds.find((h) => h.appointmentId === appointmentId);
  if (!hold) return false;
  if (hold.status === 'booked') return true;
  hold.status = 'booked';
  if (paymentId) hold.paymentId = paymentId;
  return true;
}

/**
 * Look up a hold by appointment ID.  Used by the API to fetch metadata (e.g. for
 * Stripe checkout confirmation) and return information back to the caller.
 */
export function getHold(appointmentId: string): Hold | undefined {
  purgeExpiredHolds();
  return store.holds.find((h) => h.appointmentId === appointmentId);
}