// apps/web/lib/booking.ts

export type Slot = { id: string; startsAt: string; endsAt: string };
export type HoldStatus = "hold" | "confirmed" | "expired";
export type Hold = { id: string; slotId: string; expiresAt: string; status: HoldStatus };

/** Return a list of open appointment slots (stub). */
export async function getOpenSlots(date?: string): Promise<Slot[]> {
  const base = date ?? new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  return [
    { id: "slot_09", startsAt: `${base}T09:00:00.000Z`, endsAt: `${base}T09:30:00.000Z` },
    { id: "slot_10", startsAt: `${base}T10:00:00.000Z`, endsAt: `${base}T10:30:00.000Z` },
    { id: "slot_11", startsAt: `${base}T11:00:00.000Z`, endsAt: `${base}T11:30:00.000Z` }
  ];
}

/** Aliases some routes expect. */
export const getAvailability = getOpenSlots;
export const checkAvailability = getOpenSlots;

/** Create a temporary hold on a slot (stub). */
export async function createHold(slotId: string): Promise<Hold> {
  const expires = new Date(Date.now() + 5 * 60 * 1000).toISOString();
  return { id: `hold_${Math.random().toString(36).slice(2, 8)}`, slotId, expiresAt: expires, status: "hold" };
}

/** Retrieve a hold (stub). */
export async function getHold(holdId: string): Promise<Hold | null> {
  const expires = new Date(Date.now() + 4 * 60 * 1000).toISOString();
  return { id: holdId, slotId: "slot_09", expiresAt: expires, status: "hold" };
}

/** Confirm a hold (stub). */
export async function confirmHold(
  holdId: string,
  _data?: any
): Promise<{ id: string; confirmed: boolean; status: "confirmed" }> {
  return { id: holdId, confirmed: true, status: "confirmed" };
}

