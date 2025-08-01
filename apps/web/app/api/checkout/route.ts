// apps/web/app/api/hold/route.ts
import { NextResponse } from "next/server";
import { createHold } from "@/lib/booking";

export async function POST(req: Request) {
  try {
    const { slotId, customer } = await req.json();

    if (!slotId) {
      return NextResponse.json(
        { error: "Missing slot or customer information" },
        { status: 400 }
      );
    }

    // Our createHold returns a Promise<Hold>; await it and map fields
    const hold = await createHold(slotId); // "customer" is ignored in the stub

    return NextResponse.json({
      appointmentId: hold.id,
      holdExpiresAt: hold.expiresAt,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Unable to create hold" },
      { status: 400 }
    );
  }
}
