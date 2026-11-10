/** @jest-environment node */
// Tests for /api/worklog
import { NextRequest } from "next/server";

jest.mock("@/lib/db", () => ({
  db: {
    workLog: {
      findMany: jest.fn(),
      upsert: jest.fn(),
    },
    user: { findMany: jest.fn() },
  },
}));

jest.mock("@/lib/auth", () => ({
  requireAuth: jest.fn(),
}));

import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

const mockRequireAuth = requireAuth as jest.Mock;
const mockWorkLogFindMany = db.workLog.findMany as jest.Mock;
const mockUserFindMany = db.user.findMany as jest.Mock;
const mockWorkLogUpsert = db.workLog.upsert as jest.Mock;

const ME = { id: "u1", email: "me@example.com", role: "MEMBER" };

describe("GET /api/worklog", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAuth.mockResolvedValue(ME);
    mockWorkLogFindMany.mockResolvedValue([]);
    mockUserFindMany.mockResolvedValue([
      { id: "u1", realName: "Me", nickname: null, avatar: null },
    ]);
  });

  it("returns 200 with logs and allUsers", async () => {
    const { GET } = await import("@/app/api/worklog/route");
    const req = new NextRequest("http://localhost/api/worklog?date=2026-11-10");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("logs");
    expect(body).toHaveProperty("allUsers");
    expect(body).toHaveProperty("requestingUserId", "u1");
  });

  it("returns 401 when unauthenticated", async () => {
    mockRequireAuth.mockRejectedValue(new Error("Unauthorized"));
    const { GET } = await import("@/app/api/worklog/route");
    const req = new NextRequest("http://localhost/api/worklog?date=2026-11-10");
    const res = await GET(req);
    expect(res.status).toBe(401);
  });
});

describe("POST /api/worklog", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAuth.mockResolvedValue(ME);
  });

  it("returns 400 when date is missing", async () => {
    const { POST } = await import("@/app/api/worklog/route");
    const req = new NextRequest("http://localhost/api/worklog", {
      method: "POST",
      body: JSON.stringify({ morningPlan: "Plan", status: "DRAFT" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("upserts the work log and returns 200", async () => {
    mockWorkLogUpsert.mockResolvedValue({
      id: "wl1", userId: "u1", date: new Date("2026-11-10"),
      morningPlan: "Plan", whatIDid: "Done it", tomorrowPlan: "More",
      status: "SUBMITTED",
    });
    const { POST } = await import("@/app/api/worklog/route");
    const req = new NextRequest("http://localhost/api/worklog", {
      method: "POST",
      body: JSON.stringify({
        date: "2026-11-10",
        morningPlan: "Plan",
        whatIDid: "Done it",
        tomorrowPlan: "More",
        status: "SUBMITTED",
      }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("SUBMITTED");
  });

  it("returns 400 for invalid status value", async () => {
    const { POST } = await import("@/app/api/worklog/route");
    const req = new NextRequest("http://localhost/api/worklog", {
      method: "POST",
      body: JSON.stringify({ date: "2026-11-10", status: "INVALID" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
