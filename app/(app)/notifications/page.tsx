"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import { Bell, ExternalLink } from "lucide-react";
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
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-black">Notifications</h1>
          {unread > 0 && <Badge>{unread} unread</Badge>}
        </div>
        {unread > 0 && (
          <Button variant="outline" size="sm" onClick={markAll} disabled={loading}>
            Mark all as read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-xl border border-neutral-200 p-16 text-center">
          <div className="h-14 w-14 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
            <Bell className="h-6 w-6 text-neutral-400" />
          </div>
          <p className="text-base font-semibold text-black">All caught up!</p>
          <p className="text-sm text-neutral-400 mt-1">No notifications yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 divide-y divide-neutral-100 overflow-hidden">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`flex items-start gap-4 px-5 py-4 cursor-pointer transition-colors ${!n.isRead ? "bg-neutral-50 hover:bg-neutral-100" : "hover:bg-neutral-50"}`}
              onClick={() => { if (!n.isRead) markOne(n.id); }}
            >
              <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${!n.isRead ? "bg-black border-black" : "bg-neutral-100 border-neutral-200"}`}>
                <Bell className={`h-4 w-4 ${!n.isRead ? "text-white" : "text-neutral-500"}`} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-base font-semibold ${!n.isRead ? "text-black" : "text-neutral-700"}`}>{n.title}</p>
                  <span className="text-sm text-neutral-400 shrink-0 mt-0.5">{formatDateTime(n.createdAt)}</span>
                </div>
                <p className="text-base text-neutral-500 mt-0.5 leading-snug">{n.message}</p>
                {n.link && (
                  <Link href={n.link} className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-black hover:underline underline-offset-4">
                    View <ExternalLink className="h-3 w-3" />
                  </Link>
                )}
              </div>

              {!n.isRead && <div className="mt-2.5 h-2 w-2 rounded-full bg-black shrink-0" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
