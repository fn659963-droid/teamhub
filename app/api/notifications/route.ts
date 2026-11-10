import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const user = await requireAuth();
    const notifications = await db.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    const unreadCount = await db.notification.count({ where: { userId: user.id, isRead: false } });
    return NextResponse.json({ notifications, unreadCount });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}

// PATCH — mark as read
export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { id, markAll } = await req.json();

    if (markAll) {
      await db.notification.updateMany({ where: { userId: user.id, isRead: false }, data: { isRead: true } });
    } else if (id) {
      await db.notification.updateMany({ where: { id, userId: user.id }, data: { isRead: true } });
    }

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}
