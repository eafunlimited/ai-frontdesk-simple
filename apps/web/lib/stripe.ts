// apps/web/lib/stripe.ts

/**
 * Create a checkout session.
 * Stub: returns a minimal object with id and url so the app can proceed.
 * Replace with real Stripe logic later.
 */
export async function createCheckoutSession(_payload: any): Promise<{ id: string; url: string }> {
  return {
    id: "cs_test_demo",
    // If your route expects a URL, any valid path works for now.
    url: "/checkout/success",
  };
}

/**
 * Retrieve a Stripe Checkout Session.
 * Stub returns a minimal object that looks “paid”.
 */
export async function retrieveSession(sessionId: string): Promise<any> {
  return { id: sessionId, payment_status: "paid" };
}

/**
 * Verify a Stripe webhook signature and return the event.
 * Stub returns a minimal “completed” event.
 */
export async function verifyWebhook(_rawBody: string, _signature: string): Promise<any> {
  return {
    type: "checkout.session.completed",
    data: { object: { id: "evt_demo" } },
  };
}
