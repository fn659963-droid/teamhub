export const instant = false;

import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import AdminUsersClient from "./users-client";

export default async function AdminPage() {
  const user = await getSession();
  if (!user || user.role !== "ADMIN") redirect("/dashboard");

  const users = await db.user.findMany({
    select: { id: true, email: true, realName: true, nickname: true, role: true, isActive: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  const auditLogs = await db.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 30,
    include: { user: { select: { realName: true, nickname: true } } },
  });

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-black">Admin Panel</h1>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-black">Member Management</h2>
        <AdminUsersClient initialUsers={users} />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-black">Audit Log</h2>
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <table className="w-full text-base">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200">
                <th className="text-left px-5 py-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">Time</th>
                <th className="text-left px-5 py-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">User</th>
                <th className="text-left px-5 py-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">Action</th>
                <th className="text-left px-5 py-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">Entity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-5 py-3.5 text-neutral-400 text-sm">{formatDate(log.createdAt)}</td>
                  <td className="px-5 py-3.5 text-black font-semibold">{log.user ? (log.user.nickname ?? log.user.realName) : "System"}</td>
                  <td className="px-5 py-3.5"><Badge variant="secondary">{log.action}</Badge></td>
                  <td className="px-5 py-3.5 text-neutral-600">{log.entity}</td>
                </tr>
              ))}
              {auditLogs.length === 0 && (
                <tr><td colSpan={4} className="px-5 py-10 text-center text-neutral-400">No audit logs yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
