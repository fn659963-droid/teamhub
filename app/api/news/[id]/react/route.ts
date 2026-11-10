import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const { type } = await req.json();

    const existing = await db.newsReaction.findUnique({
      where: { postId_userId_type: { postId: id, userId: user.id, type } },
    });

    if (existing) {
      await db.newsReaction.delete({ where: { postId_userId_type: { postId: id, userId: user.id, type } } });
    } else {
      await db.newsReaction.create({ data: { postId: id, userId: user.id, type } });
    }

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}
