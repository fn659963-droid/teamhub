export const instant = false;

import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { User } from "lucide-react";
import Link from "next/link";

export default async function MembersPage() {
  const me = await getSession();
  const members = await db.user.findMany({
    where: { isActive: true },
    select: {
      id: true, email: true, realName: true, nickname: true,
      phone: true, handles: true, role: true, createdAt: true,
    },
    orderBy: { realName: "asc" },
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-800">Members</h1>
        <span className="text-sm text-slate-500">{members.length} active members</span>
      </div>

      <div className="rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-3 font-medium text-slate-600">Name</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Email</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Phone</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Handles</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Role</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {members.map((m) => {
              const handles = m.handles as Record<string, string> | null;
              const isMe = m.id === me?.id;
              return (
                <tr key={m.id} className={isMe ? "bg-blue-50/50" : "hover:bg-slate-50"}>
                  <td className="px-4 py-3 font-medium text-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                        <User className="h-4 w-4 text-slate-500" />
                      </div>
                      <div>
                        <span>{m.realName}</span>
                        {m.nickname && <span className="ml-1 text-slate-400 text-xs">({m.nickname})</span>}
                        {isMe && <span className="ml-1 text-xs text-blue-500">you</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{m.email}</td>
                  <td className="px-4 py-3 text-slate-600">{m.phone ?? <span className="text-slate-300">—</span>}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {handles && Object.keys(handles).length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(handles).map(([k, v]) => (
                          <span key={k} className="text-xs bg-slate-100 rounded px-1.5 py-0.5">
                            {k}: {v}
                          </span>
                        ))}
                      </div>
                    ) : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={m.role === "ADMIN" ? "default" : "secondary"}>{m.role}</Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(m.createdAt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {me?.id && (
        <div className="text-right">
          <Link href="/profile" className="text-sm text-slate-500 hover:text-slate-700 underline">
            Edit my profile →
          </Link>
        </div>
      )}
    </div>
  );
}
