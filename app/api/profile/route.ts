import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, hashPassword } from "@/lib/auth";

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { realName, nickname, phone, birthday, handles, notes, password } = await req.json();

    const data: Record<string, unknown> = {};
    if (realName !== undefined) data.realName = realName;
    if (nickname !== undefined) data.nickname = nickname;
    if (phone !== undefined) data.phone = phone;
    if (birthday !== undefined) data.birthday = birthday ? new Date(birthday) : null;
    if (handles !== undefined) data.handles = handles;
    if (notes !== undefined) data.notes = notes;
    if (password) {
      if (password.length < 8) {
        return NextResponse.json({ error: "Password too short" }, { status: 400 });
      }
      data.password = await hashPassword(password);
    }

    const updated = await db.user.update({
      where: { id: user.id },
      data,
      select: { id: true, email: true, realName: true, nickname: true, phone: true, handles: true, role: true },
    });

    return NextResponse.json(updated);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}
