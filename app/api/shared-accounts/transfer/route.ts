import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";

// POST — create transfer request
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { sharedAccountId } = await req.json();

    const account = await db.sharedAccount.findUnique({
      where: { id: sharedAccountId },
      include: { currentUser: true },
    });
    if (!account) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Check no pending request exists
    const existing = await db.transferRequest.findFirst({
      where: { sharedAccountId, status: { in: ["PENDING", "CURRENT_USER_APPROVED"] } },
    });
    if (existing) {
      return NextResponse.json({ error: "A transfer request is already pending" }, { status: 409 });
    }

    const request = await db.transferRequest.create({
      data: { sharedAccountId, requesterId: user.id },
    });

    // Notify current user (if any)
    if (account.currentUserId && account.currentUserId !== user.id) {
      await createNotification({
        userId: account.currentUserId,
        type: "transfer_request",
        title: "Transfer request",
        message: `${user.nickname ?? user.realName} wants to take over ${account.platform} (${account.accountEmail}).`,
        link: "/shared-accounts",
      });
    }

    // Notify all admins
    const admins = await db.user.findMany({ where: { role: "ADMIN", isActive: true }, select: { id: true } });
    for (const admin of admins) {
      if (admin.id !== user.id) {
        await createNotification({
          userId: admin.id,
          type: "transfer_request",
          title: "Transfer request (pending approval)",
          message: `${user.nickname ?? user.realName} requested ${account.platform} (${account.accountEmail}).`,
          link: "/shared-accounts",
        });
      }
    }

    return NextResponse.json(request);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}

// PATCH — approve or reject
export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { requestId, action } = await req.json(); // action: "approve" | "reject"

    const request = await db.transferRequest.findUnique({
      where: { id: requestId },
      include: { sharedAccount: true, requester: true },
    });
    if (!request) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const isAdmin = user.role === "ADMIN";
    const isCurrentUser = request.sharedAccount.currentUserId === user.id;

    if (action === "reject") {
      if (!isAdmin && !isCurrentUser) {
        return NextResponse.json({ error: "Not authorized" }, { status: 403 });
      }
      await db.transferRequest.update({ where: { id: requestId }, data: { status: "REJECTED" } });
      await createNotification({
        userId: request.requesterId,
        type: "transfer_request",
        title: "Transfer request rejected",
        message: `Your request for ${request.sharedAccount.platform} was rejected.`,
        link: "/shared-accounts",
      });
      return NextResponse.json({ ok: true });
    }

    if (action === "approve") {
      // Current user approves first
      if (isCurrentUser && request.status === "PENDING") {
        await db.transferRequest.update({ where: { id: requestId }, data: { status: "CURRENT_USER_APPROVED" } });
        // Notify admins
        const admins = await db.user.findMany({ where: { role: "ADMIN", isActive: true }, select: { id: true } });
        for (const admin of admins) {
          await createNotification({
            userId: admin.id,
            type: "transfer_request",
            title: "Transfer awaiting admin approval",
            message: `Current user approved transfer of ${request.sharedAccount.platform}. Admin approval needed.`,
            link: "/shared-accounts",
          });
        }
        return NextResponse.json({ ok: true });
      }

      // Admin approves second (or first if no current user)
      if (isAdmin && (request.status === "CURRENT_USER_APPROVED" || (!request.sharedAccount.currentUserId && request.status === "PENDING"))) {
        const prevUserId = request.sharedAccount.currentUserId;
        await db.sharedAccount.update({
          where: { id: request.sharedAccountId },
          data: { currentUserId: request.requesterId },
        });
        await db.transferRequest.update({
          where: { id: requestId },
          data: { status: "APPROVED", approverId: user.id },
        });
        // Record history
        await db.sharedAccountHistory.create({
          data: {
            sharedAccountId: request.sharedAccountId,
            changedBy: user.id,
            field: "currentUserId",
            oldValue: prevUserId ?? null,
            newValue: request.requesterId,
          },
        });
        // Notify requester
        await createNotification({
          userId: request.requesterId,
          type: "transfer_request",
          title: "Transfer approved",
          message: `You are now the current user of ${request.sharedAccount.platform} (${request.sharedAccount.accountEmail}).`,
          link: "/shared-accounts",
        });
        return NextResponse.json({ ok: true });
      }

      return NextResponse.json({ error: "Cannot approve at this stage" }, { status: 400 });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}
