import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Only admins can comment on work logs" }, { status: 403 });
    }

    const { workLogId, content } = await req.json();
    if (!workLogId || !content?.trim()) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const workLog = await db.workLog.findUnique({ where: { id: workLogId } });
    if (!workLog) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const comment = await db.workLogComment.create({
      data: { workLogId, authorId: user.id, content },
      include: { author: { select: { id: true, realName: true, nickname: true } } },
    });

    // Update log status to ACKNOWLEDGED
    await db.workLog.update({ where: { id: workLogId }, data: { status: "ACKNOWLEDGED" } });

    // Notify the log owner
    if (workLog.userId !== user.id) {
      await createNotification({
        userId: workLog.userId,
        type: "work_log_comment",
        title: "Work log acknowledged",
        message: `${user.nickname ?? user.realName} commented on your work log.`,
        link: `/worklog`,
      });
    }

    return NextResponse.json(comment);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}
