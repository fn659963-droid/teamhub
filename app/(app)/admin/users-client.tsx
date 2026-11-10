"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface UserRow {
  id: string;
  email: string;
  realName: string;
  nickname: string | null;
  role: string;
  isActive: boolean;
  createdAt: Date;
}

export default function AdminUsersClient({ initialUsers }: { initialUsers: UserRow[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [loading, setLoading] = useState<string | null>(null);

  async function updateUser(userId: string, patch: { role?: string; isActive?: boolean }) {
    setLoading(userId);
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, ...patch }),
    });
    const updated = await res.json();
    setUsers((us) => us.map((u) => (u.id === userId ? { ...u, ...updated } : u)));
    setLoading(null);
  }

  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
      <table className="w-full text-base">
        <thead>
          <tr className="bg-neutral-50 border-b border-neutral-200">
            <th className="text-left px-5 py-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">Name</th>
            <th className="text-left px-5 py-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">Email</th>
            <th className="text-left px-5 py-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">Role</th>
            <th className="text-left px-5 py-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">Status</th>
            <th className="text-left px-5 py-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">Joined</th>
            <th className="w-32"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {users.map((u) => (
            <tr key={u.id} className="hover:bg-neutral-50 transition-colors">
              <td className="px-5 py-4 font-semibold text-black">
                {u.realName}
                {u.nickname && <span className="ml-1.5 text-neutral-400 text-sm font-normal">({u.nickname})</span>}
              </td>
              <td className="px-5 py-4 text-neutral-500">{u.email}</td>
              <td className="px-5 py-4 w-36">
                <Select
                  value={u.role}
                  onValueChange={(v) => updateUser(u.id, { role: v })}
                  disabled={loading === u.id}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MEMBER">Member</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </td>
              <td className="px-5 py-4">
                <Badge variant={u.isActive ? "default" : "secondary"}>
                  {u.isActive ? "Active" : "Inactive"}
                </Badge>
              </td>
              <td className="px-5 py-4 text-neutral-400 text-sm">{formatDate(u.createdAt)}</td>
              <td className="px-5 py-4">
                <Button
                  variant={u.isActive ? "outline" : "default"}
                  size="sm"
                  disabled={loading === u.id}
                  onClick={() => updateUser(u.id, { isActive: !u.isActive })}
                >
                  {u.isActive ? "Deactivate" : "Activate"}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
