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
      <h1 className="text-xl font-semibold text-slate-800">Admin Panel</h1>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-slate-700">Member Management</h2>
        <AdminUsersClient initialUsers={users} />
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-slate-700">Audit Log</h2>
        <div className="rounded-lg border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 font-medium text-slate-600">Time</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">User</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Action</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Entity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.map((log) => (
                <tr key={log.id}>
                  <td className="px-4 py-2 text-slate-500 text-xs">{formatDate(log.createdAt)}</td>
                  <td className="px-4 py-2 text-slate-700">{log.user ? (log.user.nickname ?? log.user.realName) : "System"}</td>
                  <td className="px-4 py-2"><Badge variant="secondary">{log.action}</Badge></td>
                  <td className="px-4 py-2 text-slate-600">{log.entity}</td>
                </tr>
              ))}
              {auditLogs.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400 text-sm">No audit logs yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
