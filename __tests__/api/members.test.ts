/** @jest-environment node */
// Tests for GET /api/members
import { NextRequest } from "next/server";

jest.mock("@/lib/db", () => ({
  db: {
    user: { findMany: jest.fn() },
  },
}));

jest.mock("@/lib/auth", () => ({
  requireAuth: jest.fn(),
}));

import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

const mockRequireAuth = requireAuth as jest.Mock;
const mockFindMany = (db.user.findMany as jest.Mock);

const MOCK_USER = { id: "u1", email: "admin@example.com", role: "ADMIN" };

const MOCK_MEMBERS = [
  { id: "u1", email: "alice@example.com", realName: "Alice", nickname: "Al", role: "MEMBER", createdAt: new Date("2026-01-01"), birthday: null },
  { id: "u2", email: "bob@example.com", realName: "Bob", nickname: null, role: "ADMIN", createdAt: new Date("2026-02-01"), birthday: null },
];

describe("GET /api/members", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAuth.mockResolvedValue(MOCK_USER);
    mockFindMany.mockResolvedValue(MOCK_MEMBERS);
  });

  it("returns 200 with member list", async () => {
    const { GET } = await import("@/app/api/members/route");
    const req = new NextRequest("http://localhost/api/members");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body).toHaveLength(2);
  });

  it("returns member fields: realName, email, role", async () => {
    const { GET } = await import("@/app/api/members/route");
    const req = new NextRequest("http://localhost/api/members");
    const res = await GET(req);
    const body = await res.json();
    expect(body[0]).toHaveProperty("realName");
    expect(body[0]).toHaveProperty("email");
    expect(body[0]).toHaveProperty("role");
  });

  it("returns 401 when not authenticated", async () => {
    mockRequireAuth.mockRejectedValue(new Error("Unauthorized"));
    const { GET } = await import("@/app/api/members/route");
    const req = new NextRequest("http://localhost/api/members");
    const res = await GET(req);
    expect(res.status).toBe(401);
  });
});
