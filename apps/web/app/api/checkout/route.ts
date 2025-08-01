// apps/web/app/api/checkout/route.ts
import { NextResponse } from "next/server";
import { createCheckoutSession } from "@/lib/stripe";

export async function POST(req: Request) {
  try {
    const { appointmentId } = await req.json();
    if (!appointmentId) {
      return NextResponse.json(
        { error: "Missing appointmentId" },
        { status: 400 }
      );
    }

    const { url } = await createCheckoutSession(appointmentId);
    return NextResponse.json({ url });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Unable to create checkout session" },
      { status: 400 }
    );
  }
}

