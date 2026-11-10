import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await requireAuth();
    const q = req.nextUrl.searchParams.get("q")?.trim();
    if (!q || q.length < 2) return NextResponse.json({ results: [] });

    const [members, contacts, news, topics] = await Promise.all([
      db.user.findMany({
        where: {
          isActive: true,
          OR: [
            { realName: { contains: q, mode: "insensitive" } },
            { nickname: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        },
        select: { id: true, realName: true, nickname: true, email: true },
        take: 5,
      }),
      db.contact.findMany({
        where: {
          OR: [
            { realName: { contains: q, mode: "insensitive" } },
            { nickname: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        },
        select: { id: true, realName: true, nickname: true, email: true },
        take: 5,
      }),
      db.newsPost.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { content: { contains: q, mode: "insensitive" } },
          ],
        },
        select: { id: true, title: true, createdAt: true },
        take: 5,
        orderBy: { createdAt: "desc" },
      }),
      db.forumTopic.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { content: { contains: q, mode: "insensitive" } },
          ],
        },
        select: { id: true, title: true, createdAt: true },
        take: 5,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return NextResponse.json({
      results: [
        ...members.map((m) => ({ type: "member", id: m.id, label: m.nickname ?? m.realName, sub: m.email, href: `/members` })),
        ...contacts.map((c) => ({ type: "friend", id: c.id, label: c.nickname ?? c.realName ?? c.email, sub: c.email, href: `/shared-accounts` })),
        ...news.map((n) => ({ type: "news", id: n.id, label: n.title, sub: "News", href: `/news` })),
        ...topics.map((t) => ({ type: "forum", id: t.id, label: t.title, sub: "Forum", href: `/forum/${t.id}` })),
      ],
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}
