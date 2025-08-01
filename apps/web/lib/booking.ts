// apps/web/lib/booking.ts
import { v4 as uuidv4 } from "uuid";

export type Hold = {
  id: string;
  expiresAt: number; // epoch ms
};

// Minimal stub that pretends to create a hold for a slot
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

