import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await requireAuth();
    const email = req.nextUrl.searchParams.get("email");

    if (email) {
      const contact = await db.contact.findUnique({ where: { email } });
      return NextResponse.json(contact ?? null);
    }

    const contacts = await db.contact.findMany({ orderBy: { realName: "asc" } });
    return NextResponse.json(contacts);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const { email, realName, nickname, phone, handles, notes } = await req.json();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });
    const contact = await db.contact.upsert({
      where: { email },
      update: { realName, nickname, phone, handles, notes },
      create: { email, realName, nickname, phone, handles, notes },
    });
    return NextResponse.json(contact);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAuth();
    const { email, realName, nickname, phone, handles, notes } = await req.json();

    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const contact = await db.contact.upsert({
      where: { email },
      update: { realName, nickname, phone, handles, notes },
      create: { email, realName, nickname, phone, handles, notes },
    });

    return NextResponse.json(contact);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}
