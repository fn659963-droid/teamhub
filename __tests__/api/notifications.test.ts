/** @jest-environment node */
// Tests for /api/notifications
import { NextRequest } from "next/server";

jest.mock("@/lib/db", () => ({
  db: {
    notification: {
      findMany: jest.fn(),
      count: jest.fn(),
      updateMany: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock("@/lib/auth", () => ({
  requireAuth: jest.fn(),
}));

import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

const mockRequireAuth = requireAuth as jest.Mock;
const mockFindMany = db.notification.findMany as jest.Mock;
const mockCount = db.notification.count as jest.Mock;
const mockUpdateMany = db.notification.updateMany as jest.Mock;
const mockUpdate = db.notification.update as jest.Mock;

const ME = { id: "u1", email: "me@example.com", role: "MEMBER" };

const NOTIFS = [
  { id: "n1", userId: "u1", type: "GENERAL", title: "Hello", message: "World", link: null, isRead: false, createdAt: new Date() },
  { id: "n2", userId: "u1", type: "GENERAL", title: "Bye", message: "Now", link: null, isRead: true, createdAt: new Date() },
];

describe("GET /api/notifications", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAuth.mockResolvedValue(ME);
    mockFindMany.mockResolvedValue(NOTIFS);
    mockCount.mockResolvedValue(1);
  });

  it("returns 200 with notifications array", async () => {
    const { GET } = await import("@/app/api/notifications/route");
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.notifications).toHaveLength(2);
    expect(body.unreadCount).toBe(1);
  });

  it("returns 401 when unauthenticated", async () => {
    mockRequireAuth.mockRejectedValue(new Error("Unauthorized"));
    const { GET } = await import("@/app/api/notifications/route");
    const res = await GET();
    expect(res.status).toBe(401);
  });
});

describe("PATCH /api/notifications", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAuth.mockResolvedValue(ME);
    mockUpdateMany.mockResolvedValue({ count: 1 });
    mockUpdate.mockResolvedValue({});
  });

  it("marks all as read when markAll=true", async () => {
    const { PATCH } = await import("@/app/api/notifications/route");
    const req = new NextRequest("http://localhost/api/notifications", {
      method: "PATCH",
      body: JSON.stringify({ markAll: true }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await PATCH(req);
    expect(res.status).toBe(200);
    expect(mockUpdateMany).toHaveBeenCalled();
  });

  it("marks one notification as read by id", async () => {
    const { PATCH } = await import("@/app/api/notifications/route");
    const req = new NextRequest("http://localhost/api/notifications", {
      method: "PATCH",
      body: JSON.stringify({ id: "n1" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await PATCH(req);
    expect(res.status).toBe(200);
    expect(mockUpdate).toHaveBeenCalled();
  });
});
