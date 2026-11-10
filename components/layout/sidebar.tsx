"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, ClipboardList, Share2,
  Newspaper, MessageSquare, Settings, Bell, Search, LogOut,
} from "lucide-react";

const navItems = [
  { href: "/dashboard",       label: "Dashboard",       icon: LayoutDashboard },
  { href: "/worklog",         label: "Work Log",         icon: ClipboardList },
  { href: "/members",         label: "Members",          icon: Users },
  { href: "/shared-accounts", label: "Shared Accounts",  icon: Share2 },
  { href: "/news",            label: "News",             icon: Newspaper },
  { href: "/forum",           label: "Forum",            icon: MessageSquare },
];

interface SidebarProps {
  unreadCount?: number;
  userRole?: string;
  userName?: string;
}

function NavLink({ href, label, icon: Icon, active }: { href: string; label: string; icon: React.ElementType; active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium transition-colors",
        active
          ? "bg-white text-black"
          : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </Link>
  );
}

export function Sidebar({ unreadCount = 0, userRole, userName }: SidebarProps) {
  const pathname = usePathname();

  const initials = (name: string) =>
    name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 flex flex-col z-40 bg-neutral-900">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-neutral-800">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-white flex items-center justify-center shrink-0">
            <span className="text-black text-xs font-bold">T</span>
          </div>
          <span className="text-white text-base font-bold tracking-tight">TeamHub</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-3 py-1 text-xs font-semibold uppercase tracking-widest text-neutral-600 mb-1">Menu</p>
        {navItems.map(({ href, label, icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return <NavLink key={href} href={href} label={label} icon={icon} active={active} />;
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-3 pt-3 border-t border-neutral-800 space-y-0.5">
        <p className="px-3 py-1 text-xs font-semibold uppercase tracking-widest text-neutral-600 mb-1">Account</p>
        <NavLink href="/search" label="Search" icon={Search} active={pathname === "/search"} />
        <Link
          href="/notifications"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium transition-colors",
            pathname === "/notifications"
              ? "bg-white text-black"
              : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
          )}
        >
          <Bell className="h-4 w-4 shrink-0" />
          Notifications
          {unreadCount > 0 && (
            <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-white text-black text-xs font-bold px-1">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>
        {userRole === "ADMIN" && (
          <NavLink href="/admin" label="Admin" icon={Settings} active={pathname === "/admin"} />
        )}
        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign out
          </button>
        </form>
      </div>

      {/* User */}
      <Link
        href="/profile"
        className="flex items-center gap-3 px-4 py-3.5 border-t border-neutral-800 hover:bg-neutral-800 transition-colors"
      >
        <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center shrink-0 text-xs font-bold text-black">
          {userName ? initials(userName) : "?"}
        </div>
        <div className="min-w-0">
          <p className="text-xs text-neutral-500 leading-none mb-0.5">Signed in as</p>
          <p className="text-sm font-semibold text-white truncate leading-none">{userName ?? "—"}</p>
        </div>
      </Link>
    </aside>
  );
}
