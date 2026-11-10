"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import { Bell } from "lucide-react";
import Link from "next/link";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetch_() {
    const res = await fetch("/api/notifications");
    const data = await res.json();
    setNotifications(data.notifications ?? []);
  }

  useEffect(() => { fetch_(); }, []);

  async function markAll() {
    setLoading(true);
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ markAll: true }) });
    setLoading(false);
    fetch_();
  }

  async function markOne(id: string) {
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setNotifications((n) => n.map((x) => x.id === id ? { ...x, isRead: true } : x));
  }

  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold text-slate-800">Notifications</h1>
          {unread > 0 && <Badge>{unread} unread</Badge>}
        </div>
        {unread > 0 && (
          <Button variant="outline" size="sm" onClick={markAll} disabled={loading}>
            Mark all as read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-lg border border-slate-200 p-12 text-center">
          <Bell className="h-8 w-8 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-400">No notifications yet.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-slate-200 divide-y divide-slate-100 overflow-hidden">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`flex items-start gap-3 px-4 py-3 ${!n.isRead ? "bg-blue-50/40" : ""}`}
              onClick={() => { if (!n.isRead) markOne(n.id); }}
            >
              {!n.isRead && <div className="mt-1.5 h-2 w-2 rounded-full bg-blue-500 shrink-0" />}
              {n.isRead && <div className="mt-1.5 h-2 w-2 shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800">{n.title}</p>
                <p className="text-sm text-slate-600">{n.message}</p>
                {n.link && (
                  <Link href={n.link} className="text-xs text-blue-600 hover:underline">View →</Link>
                )}
              </div>
              <span className="text-xs text-slate-400 shrink-0">{formatDateTime(n.createdAt)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
