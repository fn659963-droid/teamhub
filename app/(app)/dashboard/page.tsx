export const instant = false;

import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatDateTime } from "@/lib/utils";
import Link from "next/link";
import { ClipboardList, Newspaper, MessageSquare, Bell } from "lucide-react";

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">Welcome, {displayName}</h1>
        <p className="text-sm text-slate-500 mt-0.5">{formatDate(new Date())}</p>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <ClipboardList className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">Today&apos;s Work Log</p>
                <div className="mt-0.5">
                  {myLog ? (
                    <Badge variant={myLog.status === "ACKNOWLEDGED" ? "success" : myLog.status === "SUBMITTED" ? "default" : "secondary"}>
                      {myLog.status}
                    </Badge>
                  ) : (
                    <Badge variant="warning">Not submitted</Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">Unread Notifications</p>
                <p className="text-lg font-semibold text-slate-800 mt-0.5">{unreadNotifs}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <Newspaper className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">News Posts</p>
                <p className="text-lg font-semibold text-slate-800 mt-0.5">{recentNews.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">Forum Topics</p>
                <p className="text-lg font-semibold text-slate-800 mt-0.5">{recentTopics.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Recent News */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent News</CardTitle>
              <Link href="/news" className="text-xs text-slate-500 hover:text-slate-700">View all →</Link>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {recentNews.length === 0 ? (
              <p className="text-sm text-slate-400">No news yet.</p>
            ) : (
              <ul className="space-y-3">
                {recentNews.map((post) => (
                  <li key={post.id} className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        {post.isPinned && <Badge variant="secondary" className="text-xs">Pinned</Badge>}
                        <p className="text-sm font-medium text-slate-800 truncate">{post.title}</p>
                      </div>
                      <p className="text-xs text-slate-400">{post.author.nickname ?? post.author.realName}</p>
                    </div>
                    <span className="text-xs text-slate-400 shrink-0">{formatDate(post.createdAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Recent Forum */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Forum Topics</CardTitle>
              <Link href="/forum" className="text-xs text-slate-500 hover:text-slate-700">View all →</Link>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {recentTopics.length === 0 ? (
              <p className="text-sm text-slate-400">No topics yet.</p>
            ) : (
              <ul className="space-y-3">
                {recentTopics.map((topic) => (
                  <li key={topic.id} className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link href={`/forum/${topic.id}`} className="text-sm font-medium text-slate-800 hover:underline truncate block">
                        {topic.title}
                      </Link>
                      <p className="text-xs text-slate-400">
                        {topic.author.nickname ?? topic.author.realName} · {topic._count.replies} replies
                      </p>
                    </div>
                    <span className="text-xs text-slate-400 shrink-0">{formatDateTime(topic.createdAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
