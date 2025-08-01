// apps/web/app/api/availability/route.ts
import { NextResponse } from "next/server";
import { getOpenSlots } from "@/lib/booking";

export async function POST(req: Request) {
  try {
    const { date } = await req.json();
    const slots = await getOpenSlots(date);
    return NextResponse.json({ slots });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Failed to fetch availability" },
      { status: 500 }
    );
  }
}
