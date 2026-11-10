import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const user = await requireAuth();
    const profile = await db.user.findUnique({
      where: { id: user.id },
      select: { id: true, email: true, realName: true, nickname: true, phone: true, birthday: true, handles: true, notes: true, role: true },
    });
    return NextResponse.json(profile);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}
