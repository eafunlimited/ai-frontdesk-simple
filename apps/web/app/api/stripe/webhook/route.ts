// apps/web/app/api/stripe/webhook/route.ts
import { NextResponse } from "next/server";
import { verifyWebhook } from "@/lib/stripe";
import { confirmHold } from "@/lib/booking";

export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature") ?? "";
  const rawBody = await req.text();

  try {
    const event = await verifyWebhook(rawBody, signature);

    if (event?.type === "checkout.session.completed") {
      // assuming appointmentId is embedded in event.data.appointmentId
      const appointmentId = event.data?.appointmentId;
      if (appointmentId) {
        await confirmHold(appointmentId);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Webhook processing failed" },
      { status: 400 }
    );
  }
}
