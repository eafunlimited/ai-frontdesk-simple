// apps/web/lib/stripe.ts

/**
 * Retrieve a Stripe Checkout Session.
 * Stub returns a minimal object that looks “paid”.
 */
export async function retrieveSession(sessionId: string): Promise<any> {
  return { id: sessionId, payment_status: "paid" }
}

/**
 * Verify a Stripe webhook signature and return the event.
 * Stub returns a minimal “completed” event.
 */
export async function verifyWebhook(_rawBody: string, _signature: string): Promise<any> {
  return {
    type: "checkout.session.completed",
    data: { object: { id: "evt_demo" } },
  }
}


