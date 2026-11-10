export const instant = false;

import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate, formatDateTime } from "@/lib/utils";
import Link from "next/link";
import { ClipboardList, Newspaper, MessageSquare, Bell, Pin } from "lucide-react";

export default async function DashboardPage() {
  const user = await getSession();
  if (!user) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [myLog, recentNews, recentTopics, unreadNotifs] = await Promise.all([
    db.workLog.findUnique({ where: { userId_date: { userId: user.id, date: today } } }),
    db.newsPost.findMany({ orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }], take: 5, include: { author: { select: { realName: true, nickname: true } } } }),
    db.forumTopic.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { author: { select: { realName: true, nickname: true } }, _count: { select: { replies: true } } } }),
    db.notification.count({ where: { userId: user.id, isRead: false } }),
  ]);

  const displayName = user.nickname ?? user.realName;
  const logStatus = myLog?.status ?? "NOT_SUBMITTED";

  const logLabel: Record<string, string> = {
    ACKNOWLEDGED: "Acknowledged",
    SUBMITTED: "Submitted",
    DRAFT: "Draft",
    NOT_SUBMITTED: "Not submitted",
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm text-neutral-500 font-medium">{formatDate(new Date())}</p>
          <h1 className="text-3xl font-bold text-black mt-1">Welcome back, {displayName}</h1>
        </div>
        <Link href="/worklog" className="text-base font-medium text-black hover:underline underline-offset-4">
          Go to Work Log →
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Today&apos;s Work Log</p>
            <div className="h-9 w-9 rounded-lg bg-neutral-100 flex items-center justify-center">
              <ClipboardList className="h-5 w-5 text-black" />
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-neutral-100 text-black border border-neutral-200">
            <span className="h-1.5 w-1.5 rounded-full bg-black" />
            {logLabel[logStatus] ?? logStatus}
          </span>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Notifications</p>
            <div className="h-9 w-9 rounded-lg bg-neutral-100 flex items-center justify-center">
              <Bell className="h-5 w-5 text-black" />
            </div>
          </div>
          <p className="text-3xl font-bold text-black">{unreadNotifs}</p>
          <p className="text-sm text-neutral-500 mt-1">unread</p>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold uppercase tracking-wide text-neutral-500">News Posts</p>
            <div className="h-9 w-9 rounded-lg bg-neutral-100 flex items-center justify-center">
              <Newspaper className="h-5 w-5 text-black" />
            </div>
          </div>
          <p className="text-3xl font-bold text-black">{recentNews.length}</p>
          <p className="text-sm text-neutral-500 mt-1">recent posts</p>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Forum Topics</p>
            <div className="h-9 w-9 rounded-lg bg-neutral-100 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-black" />
            </div>
          </div>
          <p className="text-3xl font-bold text-black">{recentTopics.length}</p>
          <p className="text-sm text-neutral-500 mt-1">active topics</p>
        </div>
      </div>

      {/* Recent content */}
      <div className="grid grid-cols-2 gap-6">
        {/* News */}
        <div className="bg-white rounded-xl border border-neutral-200">
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <Newspaper className="h-4 w-4 text-black" />
              <h3 className="text-base font-semibold text-black">Recent News</h3>
            </div>
            <Link href="/news" className="text-sm font-medium text-black hover:underline underline-offset-4">View all →</Link>
          </div>
          <div className="px-6 py-4">
            {recentNews.length === 0 ? (
              <p className="text-base text-neutral-400 py-4 text-center">No news yet.</p>
            ) : (
              <ul className="space-y-4">
                {recentNews.map((post) => (
                  <li key={post.id} className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        {post.isPinned && <Pin className="h-3 w-3 text-black shrink-0" />}
                        <Link href="/news" className="text-base font-medium text-black hover:underline underline-offset-4 truncate">{post.title}</Link>
                      </div>
                      <p className="text-sm text-neutral-500">{post.author.nickname ?? post.author.realName}</p>
                    </div>
                    <span className="text-sm text-neutral-400 shrink-0 mt-0.5">{formatDate(post.createdAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Forum */}
        <div className="bg-white rounded-xl border border-neutral-200">
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-black" />
              <h3 className="text-base font-semibold text-black">Recent Forum Topics</h3>
            </div>
            <Link href="/forum" className="text-sm font-medium text-black hover:underline underline-offset-4">View all →</Link>
          </div>
          <div className="px-6 py-4">
            {recentTopics.length === 0 ? (
              <p className="text-base text-neutral-400 py-4 text-center">No topics yet.</p>
            ) : (
              <ul className="space-y-4">
                {recentTopics.map((topic) => (
                  <li key={topic.id} className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link href={`/forum/${topic.id}`} className="text-base font-medium text-black hover:underline underline-offset-4 truncate block mb-0.5">
                        {topic.title}
                      </Link>
                      <p className="text-sm text-neutral-500">
                        {topic.author.nickname ?? topic.author.realName}
                        <span className="mx-1">·</span>
                        {topic._count.replies} replies
                      </p>
                    </div>
                    <span className="text-sm text-neutral-400 shrink-0 mt-0.5">{formatDateTime(topic.createdAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
