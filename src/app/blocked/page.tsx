"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getBlockedUsers, getUser, unblockUser } from "@/lib/storage";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { LoadingIntro } from "@/components/LoadingHouse";
import { Button } from "@/components/Button";
import { showToast } from "@/lib/toast";
import type { BlockedUser } from "@/types";

export default function BlockedPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [list, setList] = useState<BlockedUser[]>([]);

  const reload = () => {
    if (!getUser()) return;
    setList(getBlockedUsers(getUser()!.id));
  };

  useEffect(() => {
    setMounted(true);
    if (!getUser()) {
      router.replace("/onboarding");
      return;
    }
    reload();
  }, [router]);

  if (!mounted) return <LoadingIntro />;

  const onUnblock = (b: BlockedUser) => {
    unblockUser(b.blockerId, b.blockedId);
    showToast({ kind: "success", title: `${b.blockedNickname} 차단 해제됨` });
    reload();
  };

  return (
    <div className="bg-white min-h-screen">
      <PageHeader title="🚫 차단 사용자" back="history" />
      <div className="p-4 space-y-3">
        <div className="warm-card p-3 bg-coral-50 border-coral-200">
          <div className="text-sm font-bold text-concrete-900 mb-1">차단한 사용자</div>
          <div className="text-xs text-concrete-600 leading-relaxed">
            차단한 사용자의 글/댓글은 보이지 않습니다. 다시 보고 싶으면 차단을 해제하세요.
          </div>
        </div>

        {list.length === 0 ? (
          <EmptyState kind="empty" title="차단한 사용자가 없어요" description="댓글에서 신고/차단하면 여기에 표시돼요." />
        ) : (
          <div className="space-y-2">
            {list.map((b) => (
              <div key={b.blockedId} className="warm-card p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-concrete-200 flex items-center justify-center text-concrete-500 font-bold shrink-0">
                  {b.blockedNickname.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-concrete-900 truncate">{b.blockedNickname}</div>
                  <div className="text-[11px] text-concrete-500">
                    {new Date(b.createdAt).toLocaleDateString("ko-KR")} 차단
                  </div>
                </div>
                <Button variant="secondary" size="sm" onClick={() => onUnblock(b)}>
                  해제
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
