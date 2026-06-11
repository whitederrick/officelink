"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getEvents, getUser, joinEvent, leaveEvent } from "@/lib/storage";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { LoadingIntro } from "@/components/LoadingHouse";
import { Button } from "@/components/Button";
import { showToast } from "@/lib/toast";
import type { CommunityEvent } from "@/types";

const CATEGORY_LABEL: Record<string, { emoji: string; label: string; color: string }> = {
  meetup: { emoji: "👋", label: "만남", color: "bg-sage-50 text-sage-700 border-sage-200" },
  party: { emoji: "🎉", label: "파티", color: "bg-warm-50 text-warm-700 border-warm-200" },
  sports: { emoji: "🏃", label: "스포츠", color: "bg-blue-50 text-blue-700 border-blue-200" },
  study: { emoji: "📚", label: "스터디", color: "bg-ink-50 text-ink-700 border-ink-200" },
  food: { emoji: "🍱", label: "식사", color: "bg-coral-50 text-coral-700 border-coral-200" },
  other: { emoji: "✨", label: "기타", color: "bg-concrete-50 text-concrete-700 border-concrete-200" },
};

export default function EventsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [filter, setFilter] = useState<string>("all");

  const reload = () => setEvents(getEvents());

  useEffect(() => {
    setMounted(true);
    if (!getUser()) {
      router.replace("/onboarding");
      return;
    }
    reload();
  }, [router]);

  if (!mounted) return <LoadingIntro />;

  const me = getUser()!;
  const filtered = filter === "all" ? events : events.filter((e) => e.category === filter);

  const onJoin = (e: CommunityEvent) => {
    if (e.participants.find((p) => p.userId === me.id)) {
      leaveEvent(e.id, me.id);
      showToast({ kind: "info", title: "참여 취소" });
    } else if (e.participants.length >= e.maxParticipants) {
      showToast({ kind: "warning", title: "정원 마감" });
      return;
    } else {
      joinEvent(e.id, me.id, me.nickname);
      showToast({ kind: "success", title: "참여 완료!" });
    }
    reload();
  };

  return (
    <div className="bg-white min-h-screen">
      <PageHeader
        title="🎉 이벤트/모임"
        subtitle={`${events.length}개 진행중`}
        back="history"
        right={
          <button onClick={() => router.push("/events/new")} className="text-sm text-warm-600 font-semibold">
            + 만들기
          </button>
        }
      />

      <div className="px-4 py-2 border-b border-concrete-100">
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { v: "all", label: "전체" },
            ...Object.entries(CATEGORY_LABEL).map(([k, v]) => ({ v: k, label: `${v.emoji} ${v.label}` })),
          ].map((f) => (
            <button
              key={f.v}
              onClick={() => setFilter(f.v)}
              className={`shrink-0 px-3 h-7 text-xs rounded-pill border ${
                filter === f.v
                  ? "bg-warm-500 text-white border-warm-500"
                  : "bg-white text-concrete-600 border-concrete-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-3">
        {filtered.length === 0 ? (
          <EmptyState kind="empty" title="이벤트가 없어요" description="새 모임을 만들어보세요." />
        ) : (
          <div className="space-y-2">
            {filtered.map((e) => {
              const cat = CATEGORY_LABEL[e.category];
              const joined = e.participants.find((p) => p.userId === me.id);
              const isPast = e.startsAt < Date.now();
              return (
                <div key={e.id} className="warm-card p-3">
                  <div className="flex items-start gap-2 mb-2">
                    <div className="text-3xl shrink-0">{cat.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-concrete-900 mb-1">{e.title}</div>
                      <div className="text-[11px] text-concrete-500 space-y-0.5">
                        <div>📍 {e.location}</div>
                        <div>🕐 {new Date(e.startsAt).toLocaleString("ko-KR", { dateStyle: "medium", timeStyle: "short" })}</div>
                        <div>👥 {e.participants.length} / {e.maxParticipants}명</div>
                      </div>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${cat.color}`}>{cat.label}</span>
                  </div>

                  <div className="text-xs text-concrete-700 leading-relaxed mb-2">
                    {e.description}
                  </div>

                  {/* 참가자 아바타 */}
                  {e.participants.length > 0 && (
                    <div className="flex -space-x-1.5 mb-2">
                      {e.participants.slice(0, 5).map((p) => (
                        <div
                          key={p.userId}
                          className="w-6 h-6 rounded-full bg-gradient-to-br from-warm-300 to-warm-500 flex items-center justify-center text-white text-[10px] font-bold border-2 border-white"
                          title={p.nickname}
                        >
                          {p.nickname.charAt(0)}
                        </div>
                      ))}
                      {e.participants.length > 5 && (
                        <div className="w-6 h-6 rounded-full bg-concrete-200 flex items-center justify-center text-concrete-600 text-[10px] font-bold border-2 border-white">
                          +{e.participants.length - 5}
                        </div>
                      )}
                    </div>
                  )}

                  {isPast ? (
                    <div className="text-[11px] text-concrete-400 italic">종료된 이벤트</div>
                  ) : (
                    <Button
                      variant={joined ? "secondary" : "primary"}
                      size="sm"
                      full
                      onClick={() => onJoin(e)}
                    >
                      {joined ? "✓ 참여중 (취소)" : "참여하기"}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
