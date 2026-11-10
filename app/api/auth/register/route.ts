import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password, realName, nickname, role } = await req.json();

    if (!email || !password || !realName) {
      return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const hashed = await hashPassword(password);
    await db.user.create({
      data: {
        email,
        password: hashed,
        realName,
        nickname: nickname || null,
        role: role === "ADMIN" ? "ADMIN" : "MEMBER",
        isActive: true, // skip email verification for now
        emailVerified: new Date(),
      },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
