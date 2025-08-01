// apps/web/app/api/confirm/route.ts
import { NextResponse } from "next/server";
import { retrieveSession } from "@/lib/stripe";
import { confirmHold } from "@/lib/booking";

export async function POST(req: Request) {
  try {
    const { sessionId, appointmentId } = await req.json();

    if (!sessionId || !appointmentId) {
      return NextResponse.json(
        { error: "Missing sessionId or appointmentId" },
        { status: 400 }
      );
    }

    const session = await retrieveSession(sessionId);
    if (session?.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Payment not completed" },
        { status: 400 }
      );
    }

    const confirmed = await confirmHold(appointmentId);
    return NextResponse.json({ confirmed });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Unable to confirm hold" },
      { status: 500 }
    );
  }
}

