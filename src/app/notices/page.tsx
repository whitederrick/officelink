"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getNotices, getUser } from "@/lib/storage";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { LoadingIntro } from "@/components/LoadingHouse";
import type { Notice } from "@/types";

const CAT_COLOR: Record<Notice["category"], string> = {
  update: "bg-ink-50 text-ink-700",
  event: "bg-warm-50 text-warm-700",
  system: "bg-coral-50 text-coral-600",
  info: "bg-sage-50 text-sage-700",
};

const CAT_LABEL: Record<Notice["category"], string> = {
  update: "업데이트",
  event: "이벤트",
  system: "시스템",
  info: "안내",
};

function timeAgo(ts: number) {
  const diff = Math.floor((Date.now() - ts) / (1000 * 60 * 60 * 24));
  if (diff < 1) return "오늘";
  if (diff < 7) return `${diff}일 전`;
  return `${Math.floor(diff / 7)}주 전`;
}

export default function NoticesPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [items, setItems] = useState<Notice[]>([]);

  useEffect(() => {
    setMounted(true);
    if (!getUser()) {
      router.replace("/onboarding");
      return;
    }
    setItems(getNotices());
  }, [router]);

  if (!mounted) return <LoadingIntro />;

  return (
    <div className="bg-white min-h-screen">
      <PageHeader title="공지사항" subtitle="OFFICELINK 앱 공지" back="history" />
      {items.length === 0 ? (
        <EmptyState
          kind="empty"
          title="아직 공지가 없어요"
          description="앱 업데이트, 이벤트, 운영 안내가 올라오는 곳이에요."
        />
      ) : (
        <div className="divide-y divide-concrete-100">
          {items.map((n) => (
            <div key={n.id} className="p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`text-[10px] px-2 py-0.5 rounded-pill font-semibold ${CAT_COLOR[n.category]}`}>
                  {CAT_LABEL[n.category]}
                </span>
                {n.important && (
                  <span className="text-[10px] px-2 py-0.5 rounded-pill bg-coral-500 text-white font-semibold">
                    중요
                  </span>
                )}
                <span className="text-[11px] text-concrete-400 ml-auto">{timeAgo(n.createdAt)}</span>
              </div>
              <h3 className="text-sm font-bold text-concrete-900 mb-1">{n.title}</h3>
              <p className="text-sm text-concrete-600 leading-relaxed whitespace-pre-wrap">{n.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
