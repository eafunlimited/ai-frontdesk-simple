// apps/web/lib/stripe.ts
import Stripe from "stripe";

const key =
  process.env.STRIPE_SECRET ||
  process.env.STRIPE_SECRET_KEY ||
  process.env.NEXT_PUBLIC_STRIPE_SECRET ||
  "";

export const stripe = key
  ? new Stripe(key, { apiVersion: "2024-06-20" as any })
  : null;

export async function createCheckoutSession(params: any): Promise<any> {
  if (!stripe) return { url: "#" };
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    ...params
  });
  return session;
}

// Alias some code might expect
export const createCheckout = createCheckoutSession;

