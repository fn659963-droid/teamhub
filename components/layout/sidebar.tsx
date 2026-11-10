"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Share2,
  Newspaper,
  MessageSquare,
  Settings,
  Bell,
  Search,
  LogOut,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/worklog", label: "Work Log", icon: ClipboardList },
  { href: "/members", label: "Members", icon: Users },
  { href: "/shared-accounts", label: "Shared Accounts", icon: Share2 },
  { href: "/news", label: "News", icon: Newspaper },
  { href: "/forum", label: "Forum", icon: MessageSquare },
];

interface SidebarProps {
  unreadCount?: number;
  userRole?: string;
  userName?: string;
}

export function Sidebar({ unreadCount = 0, userRole, userName }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 bg-slate-900 text-slate-100 flex flex-col z-40">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-slate-700">
        <span className="text-lg font-semibold tracking-tight">TeamHub</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-slate-700 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom area */}
      <div className="px-3 pb-4 border-t border-slate-700 pt-3 space-y-0.5">
        <Link
          href="/search"
          className="flex items-center gap-3 rounded px-3 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors"
        >
          <Search className="h-4 w-4 shrink-0" />
          Search
        </Link>
        <Link
          href="/notifications"
          className="flex items-center gap-3 rounded px-3 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors"
        >
          <Bell className="h-4 w-4 shrink-0" />
          Notifications
          {unreadCount > 0 && (
            <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>
        {userRole === "ADMIN" && (
          <Link
            href="/admin"
            className="flex items-center gap-3 rounded px-3 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors"
          >
            <Settings className="h-4 w-4 shrink-0" />
            Admin
          </Link>
        )}
        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded px-3 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign out
          </button>
        </form>
      </div>

      {/* User info */}
      <Link
        href="/profile"
        className="px-4 py-3 border-t border-slate-700 hover:bg-slate-800 transition-colors"
      >
        <p className="text-xs text-slate-400">Signed in as</p>
        <p className="text-sm font-medium text-slate-100 truncate">{userName ?? "—"}</p>
      </Link>
    </aside>
  );
}
