import { NextResponse } from 'next/server';
import { verifyWebhook } from '@/lib/stripe';
import { confirmHold } from '@/lib/booking';

// POST /api/stripe/webhook
// Stripe webhook endpoint.  Verifies the incoming signature and, on
// checkout.session.completed events, marks the associated appointment as
// booked.  To enable this endpoint you must configure a webhook in your
// Stripe dashboard and set the STRIPE_WEBHOOK_SECRET environment variable.
export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature');
  // Stripe sends the raw body as a stream.  We need to read it into a buffer.
  const raw = await request.arrayBuffer();
  const event = verifyWebhook(Buffer.from(raw), signature);
  if (!event) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    const appointmentId: string | undefined = session.metadata?.appointmentId || session.client_reference_id;
    const paymentId: string | undefined = session.payment_intent as string | undefined;
    if (appointmentId) {
      confirmHold(appointmentId, paymentId);
    }
  }
  return NextResponse.json({ received: true });
}
