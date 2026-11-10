import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

// GET /api/worklog?date=2026-11-10
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const date = req.nextUrl.searchParams.get("date") ?? new Date().toISOString().split("T")[0];

    const logs = await db.workLog.findMany({
      where: { date: new Date(date) },
      include: {
        user: { select: { id: true, realName: true, nickname: true, avatar: true } },
        comments: { include: { author: { select: { id: true, realName: true, nickname: true } } } },
      },
      orderBy: { user: { realName: "asc" } },
    });

    // Also get all active users to show empty rows
    const allUsers = await db.user.findMany({
      where: { isActive: true },
      select: { id: true, realName: true, nickname: true, avatar: true },
      orderBy: { realName: "asc" },
    });

    return NextResponse.json({ logs, allUsers, requestingUserId: user.id, requestingUserRole: user.role });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}

const VALID_STATUSES = ["DRAFT", "SUBMITTED", "ACKNOWLEDGED", "NOT_SUBMITTED"];

// POST /api/worklog
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { date, morningPlan, whatIDid, tomorrowPlan, status } = await req.json();

    if (!date) {
      return NextResponse.json({ error: "date is required" }, { status: 400 });
    }
    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: "invalid status" }, { status: 400 });
    }

    const log = await db.workLog.upsert({
      where: { userId_date: { userId: user.id, date: new Date(date) } },
      update: { morningPlan, whatIDid, tomorrowPlan, status },
      create: { userId: user.id, date: new Date(date), morningPlan, whatIDid, tomorrowPlan, status: status ?? "DRAFT" },
    });

    return NextResponse.json(log);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}
