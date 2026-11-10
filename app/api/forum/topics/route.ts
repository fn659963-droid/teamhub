import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await requireAuth();
    const page = parseInt(req.nextUrl.searchParams.get("page") ?? "1");
    const tag = req.nextUrl.searchParams.get("tag") ?? undefined;
    const limit = 20;
    const skip = (page - 1) * limit;

    const where = tag ? { tags: { has: tag } } : {};

    const [topics, total] = await Promise.all([
      db.forumTopic.findMany({
        where,
        orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
        skip,
        take: limit,
        include: {
          author: { select: { id: true, realName: true, nickname: true, avatar: true } },
          _count: { select: { replies: true } },
        },
      }),
      db.forumTopic.count({ where }),
    ]);

    return NextResponse.json({ topics, total, page, totalPages: Math.ceil(total / limit) });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { title, content, tags } = await req.json();

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json({ error: "Title and content required" }, { status: 400 });
    }

    const topic = await db.forumTopic.create({
      data: { authorId: user.id, title, content, tags: tags ?? [] },
      include: {
        author: { select: { id: true, realName: true, nickname: true, avatar: true } },
        _count: { select: { replies: true } },
      },
    });

    return NextResponse.json(topic);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}
