// apps/web/lib/booking.ts

export type Slot = { id: string; startsAt: string; endsAt: string };

export async function getOpenSlots(date?: string): Promise<Slot[]> {
  // Simple demo slots; replace with real availability later.
  const base = date ?? new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  return [
    { id: "slot_09", startsAt: `${base}T09:00:00.000Z`, endsAt: `${base}T09:30:00.000Z` },
    { id: "slot_10", startsAt: `${base}T10:00:00.000Z`, endsAt: `${base}T10:30:00.000Z` },
    { id: "slot_11", startsAt: `${base}T11:00:00.000Z`, endsAt: `${base}T11:30:00.000Z` },
  ];
}

export type Hold = { id: string; slotId: string; expiresAt: string };

export async function createHold(slotId: string): Promise<Hold> {
  // Stub: create a 5-minute hold.
  const expires = new Date(Date.now() + 5 * 60 * 1000).toISOString();
  return { id: `hold_${Math.random().toString(36).slice(2, 8)}`, slotId, expiresAt: expires };
}

export async function getHold(holdId: string): Promise<Hold | null> {
  // Stub: return a hold that “exists”.
  const expires = new Date(Date.now() + 4 * 60 * 1000).toISOString();
  return { id: holdId, slotId: "slot_09", expiresAt: expires };
}

export async function confirmHold(
  holdId: string,
  _data?: any
): Promise<{ id: string; confirmed: boolean }> {
  // Stub: mark the hold as confirmed.
  return { id: holdId, confirmed: true };
}

