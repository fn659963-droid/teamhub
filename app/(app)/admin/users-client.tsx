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
    <div className="rounded-lg border border-slate-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="text-left px-4 py-3 font-medium text-slate-600">Name</th>
            <th className="text-left px-4 py-3 font-medium text-slate-600">Email</th>
            <th className="text-left px-4 py-3 font-medium text-slate-600">Role</th>
            <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
            <th className="text-left px-4 py-3 font-medium text-slate-600">Joined</th>
            <th className="w-28"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {users.map((u) => (
            <tr key={u.id}>
              <td className="px-4 py-3 font-medium text-slate-800">
                {u.realName}
                {u.nickname && <span className="ml-1 text-slate-400 text-xs">({u.nickname})</span>}
              </td>
              <td className="px-4 py-3 text-slate-600">{u.email}</td>
              <td className="px-4 py-3 w-32">
                <Select
                  value={u.role}
                  onValueChange={(v) => updateUser(u.id, { role: v })}
                  disabled={loading === u.id}
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MEMBER">Member</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </td>
              <td className="px-4 py-3">
                <Badge variant={u.isActive ? "success" : "destructive"}>
                  {u.isActive ? "Active" : "Inactive"}
                </Badge>
              </td>
              <td className="px-4 py-3 text-slate-500">{formatDate(u.createdAt)}</td>
              <td className="px-4 py-3">
                <Button
                  variant={u.isActive ? "destructive" : "outline"}
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
