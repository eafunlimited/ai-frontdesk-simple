// apps/web/lib/booking.ts
export type Booking = { id: string; [k: string]: any };

export async function getAvailability(_params?: any): Promise<any[]> {
  return [];
}

export async function createBooking(data: any): Promise<Booking> {
  return { id: "booking_placeholder", ...data };
}

// Compatibility helpers if other files import these:
export const checkAvailability = getAvailability;
export async function confirmBooking(id: string) {
  return { id, status: "confirmed" };
}
export async function getBooking(id: string) {
  return { id };
}

export default {
  getAvailability,
  checkAvailability,
  createBooking,
  confirmBooking,
  getBooking
};
