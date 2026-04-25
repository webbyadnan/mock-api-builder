"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Zap, LayoutDashboard, LogOut, X, Menu, Users, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { NotificationBell } from "./NotificationBell";

const navLinks = [
  { href: "/dashboard", label: "My Projects", icon: LayoutDashboard },
  { href: "/dashboard", label: "Team Projects", icon: Users, hash: "team" },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-[#E5E1D8] px-5">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-[#1A1A1A]">
            <Zap className="h-3.5 w-3.5 text-[#F59E0B]" />
          </div>
          <span className="font-[family-name:var(--font-mono)] text-sm font-bold">
            MockAPI
          </span>
        </Link>
        <NotificationBell />
      </div>

      {/* Nav Links */}
      <nav className="flex-1 space-y-1 p-3">
        {navLinks.map((link) => {
          const isActive =
            !link.hash &&
            (pathname === link.href || pathname.startsWith(link.href + "/"));
          const href = link.hash
            ? `${link.href}#${link.hash}`
            : link.href;
          return (
            <a
              key={link.label}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive && !link.hash
                  ? "bg-[#1A1A1A] text-white"
                  : "text-[#9C9789] hover:bg-[#F0EDE6] hover:text-[#1A1A1A]",
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </a>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-[#E5E1D8] p-3">
        <div className="flex items-center gap-3 rounded-md px-3 py-2">
          {session?.user?.image ? (
            <img
              src={session.user.image}
              alt=""
              className="h-7 w-7 rounded-full"
            />
          ) : (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F59E0B] text-xs font-bold text-white">
              {session?.user?.name?.[0]?.toUpperCase() || "?"}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="truncate text-xs font-medium text-[#1A1A1A]">
              {session?.user?.name || "User"}
            </p>
            <p className="truncate text-[10px] text-[#9C9789]">
              {session?.user?.email}
            </p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="mt-1 flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-[#9C9789] transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 border-r border-[#E5E1D8] bg-white md:block">
        <SidebarContent />
      </aside>

      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 flex h-9 w-9 items-center justify-center rounded-md border border-[#E5E1D8] bg-white md:hidden"
      >
        <Menu className="h-4 w-4" />
      </button>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-64 bg-white shadow-xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-4 rounded-md p-1 text-[#9C9789] hover:text-[#1A1A1A]"
            >
              <X className="h-4 w-4" />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
}
