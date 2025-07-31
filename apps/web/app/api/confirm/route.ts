import { NextResponse } from 'next/server';
import { confirmHold, getHold } from '@/lib/booking';
import { retrieveSession } from '@/lib/stripe';

// POST /api/confirm
// Confirms a held appointment.  The caller can provide either:
//   { appointmentId: string, paymentId?: string }
// Or, when using Stripe Checkout, { sessionId: string }
// In the latter case the session is looked up via the Stripe API to
// determine the appointmentId and payment identifier.  If the hold is found it
// transitions to a booked state and true is returned.
export async function POST(request: Request) {
  let appointmentId: string | undefined;
  let paymentId: string | undefined;
  try {
    const body = await request.json();
    if (body.sessionId) {
      const sessionId: string = body.sessionId;
      const session = await retrieveSession(sessionId);
      if (!session) {
        return NextResponse.json({ error: 'Session not found' }, { status: 400 });
      }
      appointmentId = (session.metadata?.appointmentId as string) || session.client_reference_id || undefined;
      paymentId = (session.payment_intent as string) || sessionId;
    } else {
      appointmentId = body.appointmentId;
      paymentId = body.paymentId;
    }
    if (!appointmentId) {
      return NextResponse.json({ error: 'Missing appointmentId' }, { status: 400 });
    }
    const success = confirmHold(appointmentId, paymentId);
    if (!success) {
      return NextResponse.json({ error: 'Appointment not found or expired' }, { status: 404 });
    }
    return NextResponse.json({ status: 'confirmed' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unable to confirm booking' }, { status: 400 });
  }
}
