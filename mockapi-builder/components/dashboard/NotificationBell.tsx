"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check, X, Mail, UserPlus, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/components/ui/Toast";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  meta: any;
  isRead: boolean;
  createdAt: string;
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { addToast } = useToast();
  const latestNotifTimeRef = useRef<number>(0);

  const fetchNotifications = async (isInitial = false) => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        
        if (!isInitial && data.notifications.length > 0) {
          // Check for new notifications that arrived since last fetch
          const latestTime = new Date(data.notifications[0].createdAt).getTime();
          if (latestNotifTimeRef.current > 0 && latestTime > latestNotifTimeRef.current) {
            // Find all new notifications
            const newNotifs = data.notifications.filter(
              (n: NotificationItem) => new Date(n.createdAt).getTime() > latestNotifTimeRef.current
            );
            
            newNotifs.forEach((notif: NotificationItem) => {
              addToast({
                type: "info",
                title: notif.title,
                description: notif.message,
              });
            });
          }
          latestNotifTimeRef.current = latestTime;
        } else if (isInitial && data.notifications.length > 0) {
          latestNotifTimeRef.current = new Date(data.notifications[0].createdAt).getTime();
        }

        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Poll every 5 seconds
  useEffect(() => {
    fetchNotifications(true);
    const interval = setInterval(() => fetchNotifications(false), 5000);
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications", { method: "PUT" });
      setUnreadCount(0);
      setNotifications(n => n.map(item => ({ ...item, isRead: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const handleAcceptInvite = async (inviteId: string) => {
    try {
      const res = await fetch(`/api/invites/${inviteId}/accept`, { method: "POST" });
      if (res.ok) {
        fetchNotifications();
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRejectInvite = async (inviteId: string) => {
    try {
      const res = await fetch(`/api/invites/${inviteId}/reject`, { method: "POST" });
      if (res.ok) {
        fetchNotifications();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "INVITE": return <Mail className="h-4 w-4 text-[#F59E0B]" />;
      case "INVITE_ACCEPTED": return <UserPlus className="h-4 w-4 text-emerald-500" />;
      case "NEW_MESSAGE": return <MessageSquare className="h-4 w-4 text-blue-500" />;
      default: return <Bell className="h-4 w-4 text-[#9C9789]" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => { setIsOpen(!isOpen); if (!isOpen) markAllRead(); }}
        className="relative flex h-8 w-8 items-center justify-center rounded-md text-[#9C9789] transition-colors hover:bg-[#F0EDE6] hover:text-[#1A1A1A]"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#F59E0B] px-1 text-[10px] font-bold text-black">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-80 rounded-lg border border-[#E5E1D8] bg-white shadow-lg z-50">
          <div className="flex items-center justify-between border-b border-[#E5E1D8] px-4 py-3">
            <h3 className="font-[family-name:var(--font-mono)] text-xs font-bold text-[#1A1A1A]">
              NOTIFICATIONS
            </h3>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-[10px] text-[#9C9789] hover:text-[#1A1A1A]">
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#9C9789]">
                No notifications yet
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`border-b border-[#E5E1D8] px-4 py-3 last:border-b-0 ${
                    !notif.isRead ? "bg-[#FFFBEB]" : ""
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="mt-0.5 shrink-0">{getIcon(notif.type)}</div>
                    <div className="flex-1 min-w-0">
                      {notif.link ? (
                        <Link href={notif.link} className="text-xs font-medium text-[#1A1A1A] hover:underline">
                          {notif.title}
                        </Link>
                      ) : (
                        <p className="text-xs font-medium text-[#1A1A1A]">{notif.title}</p>
                      )}
                      <p className="mt-0.5 text-[11px] text-[#9C9789] leading-relaxed">{notif.message}</p>
                      <p className="mt-1 text-[10px] text-[#C4C0B6]">
                        {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                      </p>

                      {/* Notification actions */}
                      {notif.type === "INVITE" && notif.meta?.inviteId && (
                        <div className="mt-2 flex gap-2">
                          <button
                            onClick={() => handleAcceptInvite(notif.meta.inviteId)}
                            className="flex items-center gap-1 rounded bg-[#1A1A1A] px-2.5 py-1 text-[10px] font-bold text-white transition-colors hover:bg-[#333]"
                          >
                            <Check className="h-3 w-3" />
                            Accept
                          </button>
                          <button
                            onClick={() => handleRejectInvite(notif.meta.inviteId)}
                            className="flex items-center gap-1 rounded border border-[#E5E1D8] px-2.5 py-1 text-[10px] font-medium text-[#9C9789] transition-colors hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                          >
                            <X className="h-3 w-3" />
                            Decline
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
