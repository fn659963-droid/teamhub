/** @jest-environment node */
// Tests for auth API routes — Prisma and bcryptjs are mocked.
import { NextRequest } from "next/server";

// --- mocks ---
jest.mock("@/lib/db", () => ({
  db: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    session: { create: jest.fn() },
    auditLog: { create: jest.fn() },
  },
}));

jest.mock("bcryptjs", () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

jest.mock("next/headers", () => ({
  cookies: jest.fn(() => ({
    set: jest.fn(),
    delete: jest.fn(),
    get: jest.fn(),
  })),
}));

import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

const mockDb = db as jest.Mocked<typeof db>;
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

function makeLoginRequest(body: object) {
  return new NextRequest("http://localhost/api/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("POST /api/auth/login", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 401 when user is not found", async () => {
    (mockDb.user.findUnique as jest.Mock).mockResolvedValue(null);
    const { POST } = await import("@/app/api/auth/login/route");
    const res = await POST(makeLoginRequest({ email: "nope@example.com", password: "pass" }));
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  it("returns 401 when password does not match", async () => {
    (mockDb.user.findUnique as jest.Mock).mockResolvedValue({
      id: "1", email: "user@example.com", password: "hash", isActive: true, role: "MEMBER",
    });
    (mockBcrypt.compare as jest.Mock).mockResolvedValue(false);
    const { POST } = await import("@/app/api/auth/login/route");
    const res = await POST(makeLoginRequest({ email: "user@example.com", password: "wrong" }));
    expect(res.status).toBe(401);
  });

  it("returns 401 when account is inactive", async () => {
    (mockDb.user.findUnique as jest.Mock).mockResolvedValue({
      id: "1", email: "user@example.com", password: "hash", isActive: false, role: "MEMBER",
    });
    (mockBcrypt.compare as jest.Mock).mockResolvedValue(true);
    const { POST } = await import("@/app/api/auth/login/route");
    const res = await POST(makeLoginRequest({ email: "user@example.com", password: "pass" }));
    expect(res.status).toBe(401);
  });

  it("returns 200 with ok on success", async () => {
    (mockDb.user.findUnique as jest.Mock).mockResolvedValue({
      id: "1", email: "user@example.com", password: "hash",
      isActive: true, role: "MEMBER", realName: "Alice", nickname: null,
    });
    (mockBcrypt.compare as jest.Mock).mockResolvedValue(true);
    (mockDb.session.create as jest.Mock).mockResolvedValue({ token: "tok" });
    const { POST } = await import("@/app/api/auth/login/route");
    const res = await POST(makeLoginRequest({ email: "user@example.com", password: "correct" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });
});

describe("POST /api/auth/register", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 400 when email is missing", async () => {
    const req = new NextRequest("http://localhost/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ password: "pass12345", realName: "Bob" }),
      headers: { "Content-Type": "application/json" },
    });
    const { POST } = await import("@/app/api/auth/register/route");
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 409 when email already exists", async () => {
    (mockDb.user.findUnique as jest.Mock).mockResolvedValue({ id: "1", email: "taken@example.com" });
    const req = new NextRequest("http://localhost/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email: "taken@example.com", password: "pass12345", realName: "Bob" }),
      headers: { "Content-Type": "application/json" },
    });
    const { POST } = await import("@/app/api/auth/register/route");
    const res = await POST(req);
    expect(res.status).toBe(409);
  });

  it("creates a user and returns 201 on success", async () => {
    (mockDb.user.findUnique as jest.Mock).mockResolvedValue(null);
    (mockBcrypt.hash as jest.Mock).mockResolvedValue("hashed");
    (mockDb.user.create as jest.Mock).mockResolvedValue({
      id: "2", email: "new@example.com", realName: "New User",
      nickname: null, role: "MEMBER", isActive: true,
    });
    const req = new NextRequest("http://localhost/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email: "new@example.com", password: "pass12345", realName: "New User" }),
      headers: { "Content-Type": "application/json" },
    });
    const { POST } = await import("@/app/api/auth/register/route");
    const res = await POST(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });
});
