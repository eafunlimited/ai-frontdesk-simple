import { NextResponse } from 'next/server';
import { getOpenSlots } from '@/lib/booking';

// POST /api/availability
// Returns the list of open appointment slots.  An optional `date` parameter
// (YYYY-MM-DD) filters the results to a specific day.  If omitted all open
// slots across the next two days are returned.
export async function POST(request: Request) {
  let date: string | undefined;
  try {
    const body = await request.json();
    date = body?.date;
  } catch {
    // ignore parsing errors and treat as no date filter
  }
  const slots = getOpenSlots(date);
  return NextResponse.json({ slots });
}
