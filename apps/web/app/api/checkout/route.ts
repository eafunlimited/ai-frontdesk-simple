import { NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/stripe';
import { getHold } from '@/lib/booking';

// POST /api/checkout
// Starts a Stripe Checkout flow for a held appointment.  Expects a request
// body { appointmentId: string }.  Returns the checkout URL.  When Stripe is
// not configured the demo mode returns a URL pointing to the success page.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const appointmentId: string | undefined = body?.appointmentId;
    if (!appointmentId) {
      return NextResponse.json({ error: 'Missing appointmentId' }, { status: 400 });
    }
    const hold = getHold(appointmentId);
    if (!hold) {
      return NextResponse.json({ error: 'Hold not found' }, { status: 404 });
    }
    // Only allow starting checkout when the hold is still active
    if (hold.status !== 'hold') {
      return NextResponse.json({ error: 'Appointment is not on hold' }, { status: 400 });
    }
    const { url } = await createCheckoutSession(appointmentId);
    return NextResponse.json({ url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unable to create checkout session' }, { status: 400 });
  }
}
