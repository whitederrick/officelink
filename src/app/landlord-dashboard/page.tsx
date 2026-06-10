"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getBuildings,
  getProfileByName,
  getRepliesByBuilding,
  getReviews,
  getUser,
} from "@/lib/storage";
import { calcBuildingStats } from "@/lib/stats";
import { PageHeader } from "@/components/PageHeader";
import { LoadingIntro } from "@/components/LoadingHouse";
import { EmptyState } from "@/components/EmptyState";
import { Sparkline, StarBar } from "@/components/Charts";
import { RoleBadge } from "@/components/Badges";
import type { Building, Profile, Review, BuildingStats } from "@/types";

export default function LandlordDashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [statsMap, setStatsMap] = useState<Record<string, BuildingStats>>({});
  const [pendingReplies, setPendingReplies] = useState<{ b: Building; reviews: Review[] }[]>([]);

  useEffect(() => {
    setMounted(true);
    const u = getUser();
    if (!u) {
      router.replace("/onboarding");
      return;
    }
    // 가짜 임대인 프로필 가져오기
    const profile = getProfileByName("landlord", "김집주");
    const owned = profile ? getBuildings().filter((b) => profile.buildingIds.includes(b.id)) : [];
    setBuildings(owned);

    // 통계
    const sm: Record<string, BuildingStats> = {};
    const pending: { b: Building; reviews: Review[] }[] = [];
    for (const b of owned) {
      sm[b.id] = calcBuildingStats(b.id);
      const allReviews = getReviews(b.id);
      const replies = getRepliesByBuilding(b.id);
      const repliedIds = new Set(replies.map((r) => r.reviewId));
      const unreplied = allReviews.filter((r) => !repliedIds.has(r.id));
      if (unreplied.length > 0) pending.push({ b, reviews: unreplied });
    }
    setStatsMap(sm);
    setPendingReplies(pending);
  }, [router]);

  if (!mounted) return <LoadingIntro />;

  const totalReviews = Object.values(statsMap).reduce((s, st) => s + st.totalReviews, 0);
  const avgRating = buildings.length === 0
    ? 0
    : buildings.reduce((s, b) => s + b.ratingAvg, 0) / buildings.length;

  return (
    <div className="bg-white min-h-screen senior-mode">
      <PageHeader title="임대인 대시보드" subtitle="내 건물 운영 현황" back="history" />

      {/* 요약 카드 */}
      <div className="p-4 grid grid-cols-3 gap-2">
        <div className="warm-card p-4 text-center">
          <div className="text-2xl font-bold text-ink-700">{buildings.length}</div>
          <div className="text-[11px] text-concrete-500 mt-1">보유 건물</div>
        </div>
        <div className="warm-card p-4 text-center bg-ink-50 border-ink-200">
          <div className="text-2xl font-bold text-ink-700">{avgRating.toFixed(1)}</div>
          <div className="text-[11px] text-concrete-500 mt-1">평균 평점</div>
        </div>
        <div className="warm-card p-4 text-center">
          <div className="text-2xl font-bold text-ink-700">{totalReviews}</div>
          <div className="text-[11px] text-concrete-500 mt-1">전체 리뷰</div>
        </div>
      </div>

      {/* 답글 필요한 리뷰 */}
      {pendingReplies.length > 0 && (
        <section className="px-4 pt-2">
          <div className="warm-card p-4 bg-warm-50 border-warm-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">💬</span>
              <h3 className="text-base font-bold text-concrete-900">
                답글 필요한 리뷰
              </h3>
              <span className="ml-auto text-xs text-warm-700 font-semibold">
                {pendingReplies.reduce((s, p) => s + p.reviews.length, 0)}개
              </span>
            </div>
            <div className="space-y-1.5">
              {pendingReplies.slice(0, 3).map((p) => (
                <Link
                  key={p.b.id}
                  href={`/building/${p.b.id}`}
                  className="flex items-center gap-2 p-2 bg-white rounded-soft active:bg-warm-50"
                >
                  <span className="text-xs font-semibold text-concrete-900 truncate flex-1">
                    {p.b.name}
                  </span>
                  <span className="text-[11px] text-coral-600 font-semibold">
                    {p.reviews.length}개 답글 대기
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 건물별 */}
      <section className="px-4 pt-4">
        <h2 className="text-base font-bold text-concrete-900 mb-3">🏢 내 건물</h2>
        {buildings.length === 0 ? (
          <EmptyState
            kind="empty"
            title="보유 건물이 없어요"
            description="건물 정보가 자동으로 표시되려면 임대인 인증이 필요해요."
          />
        ) : (
          <div className="space-y-3">
            {buildings.map((b) => {
              const s = statsMap[b.id];
              return (
                <div key={b.id} className="warm-card p-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <Link href={`/building/${b.id}`} className="text-base font-bold text-concrete-900 block">
                        {b.name}
                      </Link>
                      <div className="text-[11px] text-concrete-500 truncate">{b.address}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-2xl font-bold text-warm-600">{b.ratingAvg.toFixed(1)}</div>
                      <div className="text-[11px] text-concrete-500">리뷰 {b.ratingCount}</div>
                    </div>
                  </div>

                  {s && s.totalReviews > 0 && (
                    <>
                      {/* 별점 분포 */}
                      <div className="space-y-1 mb-3">
                        {s.ratingDistribution
                          .slice()
                          .reverse()
                          .map((d) => (
                            <StarBar key={d.star} star={d.star} count={d.count} total={s.totalReviews} />
                          ))}
                      </div>

                      {/* 월별 추이 */}
                      <div className="border-t border-concrete-100 pt-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[11px] font-semibold text-concrete-700">
                            최근 6개월 리뷰 추이
                          </span>
                          <span className="text-[10px] text-concrete-500">
                            총 {s.monthlyReviews.reduce((sum, m) => sum + m.count, 0)}개
                          </span>
                        </div>
                        <Sparkline
                          data={s.monthlyReviews.map((m) => m.count)}
                          width={300}
                          height={50}
                        />
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
