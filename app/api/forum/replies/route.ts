import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await requireAuth();
    const topicId = req.nextUrl.searchParams.get("topicId");
    if (!topicId) return NextResponse.json({ error: "topicId required" }, { status: 400 });

    const replies = await db.forumReply.findMany({
      where: { topicId, parentId: null },
      orderBy: { createdAt: "asc" },
      include: {
        author: { select: { id: true, realName: true, nickname: true, avatar: true } },
        children: {
          orderBy: { createdAt: "asc" },
          include: { author: { select: { id: true, realName: true, nickname: true, avatar: true } } },
        },
      },
    });

    return NextResponse.json(replies);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { topicId, parentId, content } = await req.json();

    if (!topicId || !content?.trim()) {
      return NextResponse.json({ error: "topicId and content required" }, { status: 400 });
    }

    // Enforce max 2 levels
    if (parentId) {
      const parent = await db.forumReply.findUnique({ where: { id: parentId } });
      if (parent?.parentId) {
        return NextResponse.json({ error: "Maximum reply depth reached" }, { status: 400 });
      }
    }

    const reply = await db.forumReply.create({
      data: { topicId, authorId: user.id, parentId: parentId || null, content },
      include: { author: { select: { id: true, realName: true, nickname: true, avatar: true } } },
    });

    return NextResponse.json(reply);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}
