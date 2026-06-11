"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getDMThreads,
  getUser,
} from "@/lib/storage";
import { RoleBadge } from "@/components/Badges";
import type { DMThread as Thread } from "@/types";
import { LoadingIntro } from "@/components/LoadingHouse";

function timeAgo(ts: number) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return "방금";
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}

export default function DMListPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [threads, setThreads] = useState<Thread[]>([]);

  useEffect(() => {
    setMounted(true);
    const u = getUser();
    if (!u) {
      router.replace("/onboarding");
      return;
    }
    setThreads(getDMThreads(u.id));
  }, [router]);

  if (!mounted) {
    return <LoadingIntro />;
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="sticky top-12 z-20 bg-white border-b border-gray-100 px-4 h-12 flex items-center">
        <div className="text-sm font-semibold">쪽지</div>
      </div>

      {threads.length === 0 ? (
        <div className="p-12 text-center">
          <div className="text-3xl mb-2">💬</div>
          <div className="text-sm text-gray-500 mb-1">아직 쪽지가 없어요.</div>
          <div className="text-[11px] text-gray-400">
            게시글 댓글의 닉네임을 누르면 쪽지를 보낼 수 있어요.
          </div>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {threads.map((t) => (
            <Link
              key={t.peerId}
              href={`/dm/${encodeURIComponent(t.peerId)}`}
              className="flex items-center gap-3 px-4 py-3 active:bg-gray-50"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center text-white font-bold">
                {t.peerNickname.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold truncate">
                    {t.peerNickname}
                  </span>
                  <RoleBadge role={t.peerRole} size="xs" />
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {t.lastMessage}
                </div>
              </div>
              <div className="text-[11px] text-gray-400">{timeAgo(t.lastAt)}</div>
              {t.unread > 0 && (
                <span className="ml-1 min-w-[18px] h-[18px] px-1 rounded-full bg-officelink-primary text-white text-[10px] font-bold flex items-center justify-center">
                  {t.unread}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
