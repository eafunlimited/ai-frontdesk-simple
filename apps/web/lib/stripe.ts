// apps/web/lib/stripe.ts

// Minimal stub that returns a fake Stripe Checkout URL.
// Replace with real Stripe SDK code later if desired.
export async function createCheckoutSession(
  appointmentId: string
): Promise<{ url: string }> {
  if (!appointmentId) {
    throw new Error("appointmentId is required");
  }

  // Pretend we created a Stripe Checkout session and return a URL
  const url = `https://checkout.stripe.com/test_session?appointment=${encodeURIComponent(
    appointmentId
  )}`;

  return { url };
}
