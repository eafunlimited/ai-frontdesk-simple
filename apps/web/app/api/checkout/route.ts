// apps/web/app/api/checkout/route.ts
import { NextResponse } from "next/server";
import { getHold } from "@/lib/booking";
import { createCheckoutSession } from "@/lib/stripe";

export async function POST(req: Request) {
  const { appointmentId } = await req.json();

  // ✅ Await the promise before using .status
  const hold = await getHold(appointmentId);

  if (!hold || hold.status !== "hold") {
    return NextResponse.json({ error: "Appointment is not on hold" }, { status: 400 });
  }

  const { url } = await createCheckoutSession(appointmentId);
  return NextResponse.json({ url });
}
