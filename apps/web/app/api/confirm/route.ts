// apps/web/app/api/confirm/route.ts
import { NextResponse } from "next/server";
import { retrieveSession } from "@/lib/stripe";
import { confirmHold } from "@/lib/booking";

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();
    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing sessionId" },
        { status: 400 }
      );
    }

    const session = await retrieveSession(sessionId);
    const appointmentId = session?.appointmentId;
    if (!appointmentId) {
      return NextResponse.json(
        { error: "No appointment in session" },
        { status: 400 }
      );
    }

    await confirmHold(appointmentId);
    return NextResponse.json({ confirmed: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Confirmation failed" },
      { status: 400 }
    );
  }
}

