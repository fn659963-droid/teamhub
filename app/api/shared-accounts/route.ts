import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    await requireAuth();
    const accounts = await db.sharedAccount.findMany({
      include: {
        owner: { select: { id: true, realName: true, nickname: true, email: true } },
        currentUser: { select: { id: true, realName: true, nickname: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    const columns = await db.sharedAccountColumn.findMany({ orderBy: { order: "asc" } });
    return NextResponse.json({ accounts, columns });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAuth();
    const { platform, accountEmail, anydeskAddr, ownerId, startDate, extraData, contact } = await req.json();

    if (!platform || !accountEmail) {
      return NextResponse.json({ error: "Platform and account email are required" }, { status: 400 });
    }

    // Upsert contact if provided
    if (contact?.email) {
      await db.contact.upsert({
        where: { email: contact.email },
        update: {
          realName: contact.realName || undefined,
          nickname: contact.nickname || undefined,
          phone: contact.phone || undefined,
          handles: contact.handles || undefined,
          notes: contact.notes || undefined,
        },
        create: {
          email: contact.email,
          realName: contact.realName,
          nickname: contact.nickname,
          phone: contact.phone,
          handles: contact.handles,
          notes: contact.notes,
        },
      });
    }

    const account = await db.sharedAccount.create({
      data: {
        platform,
        accountEmail,
        anydeskAddr,
        ownerId: ownerId || null,
        startDate: startDate ? new Date(startDate) : null,
        extraData: extraData || null,
      },
      include: {
        owner: { select: { id: true, realName: true, nickname: true, email: true } },
        currentUser: { select: { id: true, realName: true, nickname: true, email: true } },
      },
    });

    return NextResponse.json(account);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}
