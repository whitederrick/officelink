"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getNotifications, getUser, markAllRead, uid } from "@/lib/storage";
import { RoleBadge } from "@/components/Badges";
import type { Notification } from "@/types";
import { LoadingIntro } from "@/components/LoadingHouse";

function timeAgo(ts: number) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return "방금";
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);

  useEffect(() => {
    setMounted(true);
    const u = getUser();
    if (!u) {
      router.replace("/onboarding");
      return;
    }
    setItems(getNotifications(u.id));
    markAllRead(u.id);
  }, [router]);

  if (!mounted) {
    return <LoadingIntro />;
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="sticky top-12 z-20 bg-white border-b border-gray-100 px-4 h-12 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-lg">‹</button>
        <div className="text-sm font-semibold">알림</div>
      </div>

      {items.length === 0 ? (
        <div className="p-12 text-center">
          <div className="text-3xl mb-2">🔔</div>
          <div className="text-sm text-gray-500">아직 알림이 없어요.</div>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {items.map((n) => (
            <Link
              key={n.id}
              href={n.postId ? `/post/${n.postId}` : "/"}
              className={`block px-4 py-3 ${
                n.read ? "bg-white" : "bg-blue-50/40"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <RoleBadge role={n.actorRole} size="xs" />
                <span className="text-xs font-medium text-gray-700">
                  {n.actorNickname}
                </span>
                <span className="text-[11px] text-gray-400">· {timeAgo(n.createdAt)}</span>
                {!n.read && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-officelink-primary" />
                )}
              </div>
              <div className="text-sm text-gray-800 leading-relaxed">
                {n.message}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
