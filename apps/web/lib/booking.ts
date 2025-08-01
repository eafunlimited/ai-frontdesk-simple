// apps/web/lib/booking.ts

export type Slot = { start: string; end: string }
export type Hold = {
  id: string
  slot: Slot
  expiresAt: number
  meta?: Record<string, unknown>
}

/**
 * Return a list of open appointment slots.
 * Stub returns an empty list so build succeeds.
 */
export async function getOpenSlots(_opts?: { date?: string }): Promise<Slot[]> {
  return []
}

/**
 * Create a temporary hold on a slot.
 * Stub returns a dummy hold object.
 */
export async function createHold(_payload: any): Promise<Hold> {
  const now = Date.now()
  return {
    id: "demo-hold",
    slot: {
      start: new Date(now).toISOString(),
      end: new Date(now + 30 * 60 * 1000).toISOString(),
    },
    expiresAt: now + 5 * 60 * 1000,
    meta: _payload ?? {},
  }
}

/**
 * Retrieve a hold by id.
 * Stub returns a dummy hold object.
 */
export async function getHold(id: string): Promise<Hold | null> {
  const now = Date.now()
  return {
    id,
    slot: {
      start: new Date(now).toISOString(),
      end: new Date(now + 30 * 60 * 1000).toISOString(),
    },
    expiresAt: now + 3 * 60 * 1000,
  }
}

/**
 * Confirm a hold.
 * Stub returns a minimal confirmation payload.
 */
export async function confirmHold(id: string, _meta?: any): Promise<{ id: string; confirmed: true }> {
  return { id, confirmed: true as const }
}
