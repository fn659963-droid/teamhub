export const instant = false;

import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Sidebar } from "./sidebar";
import { redirect } from "next/navigation";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  if (!user) redirect("/login");

  const unreadCount = await db.notification.count({
    where: { userId: user.id, isRead: false },
  });

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        unreadCount={unreadCount}
        userRole={user.role}
        userName={user.nickname ?? user.realName}
      />
      <main className="ml-56 flex-1 min-w-0">
        <div className="max-w-7xl mx-auto px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
