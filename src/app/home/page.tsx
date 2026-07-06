"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getAddresses,
  getBuilding,
  getBuildingLinks,
  getBuildings,
  getPosts,
  getUser,
  getASRequests,
  uid,
} from "@/lib/storage";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { LoadingIntro } from "@/components/LoadingHouse";
import { IllustWelcome } from "@/components/Illustrations";
import type { Address } from "@/types";

export default function MyHomePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [user, setU] = useState<ReturnType<typeof getUser>>(null);
  const [addrs, setAddrs] = useState<Address[]>([]);
  const [asList, setAsList] = useState<ReturnType<typeof getASRequests>>([]);

  useEffect(() => {
    setMounted(true);
    const u = getUser();
    if (!u) {
      router.replace("/onboarding");
      return;
    }
    setU(u);
    setAddrs(getAddresses(u.id));
    setAsList(getASRequests(u.id));
  }, [router]);

  if (!mounted || !user) return <LoadingIntro />;

  const primary = addrs.find((a) => a.isPrimary) || addrs[0];
  const liveBuildings = addrs
    .map((a) => ({ addr: a, building: getBuildingByNameLocal(a.detail) }))
    .filter((x) => x.building);

  // 가상 데이터: 택배/관리비/공지
  const fakeNotices = [
    { kind: "택배", emoji: "📦", title: "택배 1건 도착", time: "오후 2:30" },
    { kind: "관리비", emoji: "💰", title: "6월 관리비 고지서 발행", time: "오늘" },
    { kind: "공지", emoji: "📢", title: "엘리베이터 정기 점검 (6/15)", time: "어제" },
  ];

  return (
    <div className="bg-white min-h-screen">
      <PageHeader title="우리 집" subtitle="내 거주지 대시보드" back="history" />

      {/* 환영 히어로 */}
      <div className="bg-soft-gradient px-4 py-5 flex items-center gap-3">
        <IllustWelcome size={80} />
        <div className="flex-1 min-w-0">
          <div className="text-base font-bold text-concrete-900">
            {user.nickname}님, 안녕하세요 👋
          </div>
          <div className="text-xs text-concrete-600 mt-0.5 truncate">
            {primary ? `${primary.detail}에서 생활 중` : "주소를 등록해 보세요"}
          </div>
        </div>
      </div>

      {/* 빠른 액션 */}
      <section className="px-4 pt-4">
        <div className="grid grid-cols-4 gap-2">
          {[
            { emoji: "🔧", label: "AS 신청", href: "/as-request" },
            { emoji: "📢", label: "건물 공지", href: "/notices" },
            { emoji: "🎉", label: "이웃 모임", href: "/events" },
            { emoji: "✍️", label: "리뷰", href: "/review/write" },
          ].map((a) => (
            <Link
              key={a.label}
              href={a.href}
              className="warm-card p-3 flex flex-col items-center text-center active:scale-95 transition"
            >
              <div className="text-2xl mb-1">{a.emoji}</div>
              <div className="text-[11px] font-semibold text-concrete-900">{a.label}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* 알림/공지 */}
      <section className="px-4 pt-4">
        <h2 className="text-sm font-bold text-concrete-900 mb-2">📬 우리 집 알림</h2>
        <div className="warm-card divide-y divide-concrete-100">
          {fakeNotices.map((n, i) => (
            <div key={i} className="p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-soft bg-warm-50 flex items-center justify-center text-xl">
                {n.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-concrete-900">{n.title}</div>
                <div className="text-[11px] text-concrete-500">{n.kind} · {n.time}</div>
              </div>
              <span className="text-concrete-400">›</span>
            </div>
          ))}
        </div>
      </section>

      {/* AS 진행 상태 */}
      {asList.length > 0 && (
        <section className="px-4 pt-4">
          <h2 className="text-sm font-bold text-concrete-900 mb-2">🔧 AS 진행 상황</h2>
          <div className="space-y-2">
            {asList.slice(0, 2).map((a) => (
              <div key={a.id} className="warm-card p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-concrete-900">{a.category}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-pill ${
                    a.status === "done" ? "bg-sage-50 text-sage-700" :
                    a.status === "in_progress" ? "bg-ink-50 text-ink-700" :
                    a.status === "rejected" ? "bg-coral-50 text-coral-600" :
                    "bg-warm-50 text-warm-700"
                  }`}>
                    {a.status === "received" ? "접수됨" :
                     a.status === "in_progress" ? "처리중" :
                     a.status === "done" ? "완료" : "보류"}
                  </span>
                </div>
                <div className="text-xs text-concrete-500 truncate">{a.description}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 내 건물 바로가기 */}
      <section className="px-4 pt-4">
        <h2 className="text-sm font-bold text-concrete-900 mb-2">🏠 내 건물</h2>
        {liveBuildings.length === 0 ? (
          <EmptyState
            kind="empty"
            title="아직 내 건물이 없어요"
            description="주소를 등록하면 우리 건물 리뷰와 서비스가 자동으로 보여요."
            action={{ label: "주소 등록하기", href: "/profile" }}
          />
        ) : (
          <div className="space-y-2">
            {liveBuildings.map(({ addr, building }) => (
              <Link
                key={addr.id}
                href={`/building/${building!.id}`}
                className="warm-card p-3 flex items-center gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-concrete-900">{building!.name}</div>
                  <div className="text-[11px] text-concrete-500 truncate">{building!.address}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-bold text-warm-600">{building!.ratingAvg.toFixed(1)}</div>
                  <div className="text-[10px] text-concrete-500">리뷰 {building!.ratingCount}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// 이름으로 건물 검색
function getBuildingByNameLocal(name: string) {
  return getBuildings().find((b) => b.name === name) ?? null;
}
