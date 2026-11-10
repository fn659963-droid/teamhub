import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    await requireAuth();
    const members = await db.user.findMany({
      where: { isActive: true },
      select: {
        id: true, email: true, realName: true, nickname: true,
        avatar: true, phone: true, birthday: true, handles: true, role: true,
        createdAt: true,
      },
      orderBy: { realName: "asc" },
    });
    return NextResponse.json(members);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}
