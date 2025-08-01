// apps/web/lib/booking.ts
import { v4 as uuidv4 } from "uuid";

export type Hold = {
  id: string;
  expiresAt: number; // epoch ms
};

export type Slot = {
  id: string;
  startsAt: string; // ISO string
  durationMinutes: number;
};

/**
 * Return a fake list of open slots for a given day (or today if omitted).
 * This is a stub so the app can compile and deploy.
 */
export async function getOpenSlots(date?: string): Promise<Slot[]> {
  const base = date ? new Date(date) : new Date();
  // start at 09:00 local time
  const start = new Date(
    base.getFullYear(),
    base.getMonth(),
    base.getDate(),
    9,
    0,
    0,
    0
  );

  const slots: Slot[] = [];
  for (let i = 0; i < 8; i++) {
    const dt = new Date(start.getTime() + i * 60 * 60 * 1000); // hourly
    slots.push({
      id: uuidv4(),
      startsAt: dt.toISOString(),
      durationMinutes: 60,
    });
  }
  return slots;
}

/**
 * Minimal stub that pretends to create a hold for a slot.
 * Replace with a real implementation later if desired.
 */
export async function createHold(
  slotId: string,
  _customer?: unknown
): Promise<Hold> {
  if (!slotId) {
    throw new Error("slotId is required");
  }
  const id = uuidv4();
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes
  return { id, expiresAt };
}

/**
 * Minimal stub to “confirm” a hold.
 */
export async function confirmHold(
  appointmentId: string
): Promise<{ id: string; status: "confirmed" }> {
  if (!appointmentId) {
    throw new Error("appointmentId is required");
  }
  return { id: appointmentId, status: "confirmed" };
}
