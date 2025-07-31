import Stripe from 'stripe';

// This helper initialises the Stripe client if the secret key is present in the
// environment.  When no secret is provided the application operates in demo
// mode – calls to create checkout sessions will immediately succeed and no
// communication with Stripe will occur.

const secretKey = process.env.STRIPE_SECRET;
export const isDemoMode = !secretKey;

export const stripe = secretKey
  ? new Stripe(secretKey, { apiVersion: '2024-06-20' })
  : undefined;

/**
 * Create a checkout session for the specified appointment.  In demo mode this
 * simply returns a URL pointing to the success page.  In real mode a real
 * Stripe session is created with metadata referencing the appointment.
 */
export async function createCheckoutSession(appointmentId: string): Promise<{ url: string; id: string }> {
  const amount = parseInt(process.env.DEPOSIT_AMOUNT_CENTS || '4900', 10);
  const currency = process.env.DEPOSIT_CURRENCY || 'usd';
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  // When operating in demo mode we skip contacting Stripe and instead direct
  // users straight to the success page.  We include the appointmentId on the
  // query string so that the success page can confirm the booking.
  if (!stripe) {
    const url = `${baseUrl}/success?appointmentId=${appointmentId}&demo=1`;
    return { url, id: 'demo' };
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency,
          unit_amount: amount,
          product_data: {
            name: 'Appointment deposit',
          },
        },
        quantity: 1,
      },
    ],
    // Pass the appointmentId in metadata so that the webhook can identify the
    // booking.
    metadata: {
      appointmentId,
    },
    client_reference_id: appointmentId,
    success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/booking`,
  });
  return { url: session.url as string, id: session.id };
}

/**
 * Retrieve a checkout session from Stripe.  Returns undefined if in demo mode.
 */
export async function retrieveSession(sessionId: string) {
  if (!stripe) return undefined;
  return stripe.checkout.sessions.retrieve(sessionId);
}

/**
 * Verify a Stripe webhook signature and return the parsed event.  If the
 * signature or secret is missing the function returns null.  Consumers should
 * handle the possibility of null being returned.
 */
export function verifyWebhook(rawBody: Buffer, signature: string | null) {
  if (!stripe) return null;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret || !signature) return null;
  try {
    return stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return null;
  }
}
