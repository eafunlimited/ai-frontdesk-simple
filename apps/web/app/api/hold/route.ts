import { NextResponse } from 'next/server';
import { createHold } from '@/lib/booking';

// POST /api/hold
// Creates a temporary hold on a slot for the provided customer.  Expects a
// request body of the form:
// { slot: string; customer: { name: string; phone: string; email?: string } }
// Returns an object with an appointmentId and holdExpiresAt timestamp.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const slotId = body?.slot;
    const customer = body?.customer;
    if (!slotId || !customer || !customer.name || !customer.phone) {
      return NextResponse.json({ error: 'Missing slot or customer information' }, { status: 400 });
    }
    const { appointmentId, holdExpiresAt } = createHold(slotId, customer);
    return NextResponse.json({ appointmentId, holdExpiresAt });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unable to create hold' }, { status: 400 });
  }
}
