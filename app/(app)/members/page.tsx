export const instant = false;

import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
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
      birthday: true, role: true, createdAt: true,
    },
    orderBy: { realName: "asc" },
  });

  function formatBirthday(d: Date | null) {
    if (!d) return null;
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  const initials = (name: string) =>
    name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  const avatarColors = [
    "bg-violet-100 text-violet-700",
    "bg-blue-100 text-blue-700",
    "bg-emerald-100 text-emerald-700",
    "bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700",
    "bg-sky-100 text-sky-700",
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Members</h1>
          <p className="text-sm text-slate-500 mt-0.5">{members.length} active member{members.length !== 1 ? "s" : ""}</p>
        </div>
        {me?.id && (
          <Link
            href="/profile"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50 transition-colors"
          >
            Edit my profile
          </Link>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Name</th>
              <th className="text-left px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Nickname</th>
              <th className="text-left px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Email</th>
              <th className="text-left px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Birthday</th>
              <th className="text-left px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Role</th>
              <th className="text-left px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {members.map((m, i) => {
              const isMe = m.id === me?.id;
              const color = avatarColors[i % avatarColors.length];
              return (
                <tr key={m.id} className={`transition-colors ${isMe ? "bg-blue-50/60" : "hover:bg-slate-50"}`}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 font-semibold text-xs ${color}`}>
                        {initials(m.realName)}
                      </div>
                      <div className="leading-tight">
                        <span className="font-medium text-slate-800">{m.realName}</span>
                        {isMe && <span className="ml-1.5 text-xs text-blue-500 font-medium">you</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-500">
                    {m.nickname ?? <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-5 py-4 text-slate-600">{m.email}</td>
                  <td className="px-5 py-4 text-slate-500">
                    {formatBirthday(m.birthday) ?? <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      m.role === "ADMIN"
                        ? "bg-violet-100 text-violet-700"
                        : "bg-slate-100 text-slate-600"
                    }`}>
                      {m.role}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-500">{formatDate(m.createdAt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
