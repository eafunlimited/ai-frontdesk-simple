// apps/web/lib/stripe.ts

export async function createCheckoutSession(
  appointmentId: string
): Promise<{ url: string }> {
  if (!appointmentId) throw new Error("appointmentId is required");
  const url = `https://checkout.stripe.com/test_session?appointment=${encodeURIComponent(
    appointmentId
  )}`;
  return { url };
}

export type StripeSession = {
  appointmentId?: string;
};

export async function retrieveSession(
  sessionId: string
): Promise<StripeSession> {
  // Stub: replace with real Stripe SDK retrieval
  if (!sessionId) throw new Error("sessionId is required");
  return { appointmentId: sessionId };
}

export async function verifyWebhook(
  rawBody: string,
  signature: string
): Promise<any> {
  // Stub: replace with real signature verification logic.
  if (!signature) throw new Error("Missing signature");
  return JSON.parse(rawBody);
}
