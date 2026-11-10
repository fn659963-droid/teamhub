import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await requireAuth();
    const page = parseInt(req.nextUrl.searchParams.get("page") ?? "1");
    const limit = 20;
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      db.newsPost.findMany({
        orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
        skip,
        take: limit,
        include: {
          author: { select: { id: true, realName: true, nickname: true, avatar: true } },
          reactions: { select: { userId: true, type: true } },
        },
      }),
      db.newsPost.count(),
    ]);

    return NextResponse.json({ posts, total, page, totalPages: Math.ceil(total / limit) });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { title, content, attachment } = await req.json();

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json({ error: "Title and content required" }, { status: 400 });
    }

    const post = await db.newsPost.create({
      data: { authorId: user.id, title, content, attachment: attachment || null },
      include: { author: { select: { id: true, realName: true, nickname: true, avatar: true } }, reactions: true },
    });

    return NextResponse.json(post);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}
