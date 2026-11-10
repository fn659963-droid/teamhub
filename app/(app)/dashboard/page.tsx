export const instant = false;

import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate, formatDateTime } from "@/lib/utils";
import Link from "next/link";
import { ClipboardList, Newspaper, MessageSquare, Bell, TrendingUp, Pin } from "lucide-react";

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
  const logStatusConfig = {
    ACKNOWLEDGED: { label: "Acknowledged", bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
    SUBMITTED:    { label: "Submitted",    bg: "bg-blue-100",    text: "text-blue-700",    dot: "bg-blue-500" },
    DRAFT:        { label: "Draft",        bg: "bg-amber-100",   text: "text-amber-700",   dot: "bg-amber-500" },
    NOT_SUBMITTED:{ label: "Not submitted",bg: "bg-red-100",     text: "text-red-600",     dot: "bg-red-400" },
  }[logStatus] ?? { label: logStatus, bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400" };

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium">{formatDate(new Date())}</p>
          <h1 className="text-2xl font-bold text-slate-900 mt-0.5">Welcome back, {displayName} 👋</h1>
        </div>
        <Link href="/worklog" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:underline">
          Go to Work Log →
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        {/* Work Log */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Today's Work Log</p>
            <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <ClipboardList className="h-4 w-4 text-blue-600" />
            </div>
          </div>
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${logStatusConfig.bg} ${logStatusConfig.text}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${logStatusConfig.dot}`} />
            {logStatusConfig.label}
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Notifications</p>
            <div className="h-8 w-8 rounded-lg bg-rose-100 flex items-center justify-center">
              <Bell className="h-4 w-4 text-rose-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-800">{unreadNotifs}</p>
          <p className="text-xs text-slate-400 mt-0.5">unread</p>
        </div>

        {/* News */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">News Posts</p>
            <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <Newspaper className="h-4 w-4 text-amber-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-800">{recentNews.length}</p>
          <p className="text-xs text-slate-400 mt-0.5">recent posts</p>
        </div>

        {/* Forum */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Forum Topics</p>
            <div className="h-8 w-8 rounded-lg bg-violet-100 flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-violet-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-800">{recentTopics.length}</p>
          <p className="text-xs text-slate-400 mt-0.5">active topics</p>
        </div>
      </div>

      {/* Recent content */}
      <div className="grid grid-cols-2 gap-6">
        {/* News */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Newspaper className="h-4 w-4 text-amber-500" />
              <h3 className="font-semibold text-slate-800">Recent News</h3>
            </div>
            <Link href="/news" className="text-xs font-medium text-indigo-600 hover:underline">View all →</Link>
          </div>
          <div className="px-6 py-4">
            {recentNews.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">No news yet.</p>
            ) : (
              <ul className="space-y-3.5">
                {recentNews.map((post) => (
                  <li key={post.id} className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        {post.isPinned && <Pin className="h-3 w-3 text-amber-500 shrink-0" />}
                        <Link href="/news" className="text-sm font-medium text-slate-800 hover:text-indigo-600 truncate">{post.title}</Link>
                      </div>
                      <p className="text-xs text-slate-400">{post.author.nickname ?? post.author.realName}</p>
                    </div>
                    <span className="text-xs text-slate-400 shrink-0 mt-0.5">{formatDate(post.createdAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Forum */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-violet-500" />
              <h3 className="font-semibold text-slate-800">Recent Forum Topics</h3>
            </div>
            <Link href="/forum" className="text-xs font-medium text-indigo-600 hover:underline">View all →</Link>
          </div>
          <div className="px-6 py-4">
            {recentTopics.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">No topics yet.</p>
            ) : (
              <ul className="space-y-3.5">
                {recentTopics.map((topic) => (
                  <li key={topic.id} className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link href={`/forum/${topic.id}`} className="text-sm font-medium text-slate-800 hover:text-indigo-600 truncate block mb-0.5">
                        {topic.title}
                      </Link>
                      <p className="text-xs text-slate-400">
                        {topic.author.nickname ?? topic.author.realName}
                        <span className="mx-1">·</span>
                        <TrendingUp className="h-3 w-3 inline mr-0.5 text-slate-300" />
                        {topic._count.replies} replies
                      </p>
                    </div>
                    <span className="text-xs text-slate-400 shrink-0 mt-0.5">{formatDateTime(topic.createdAt)}</span>
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
