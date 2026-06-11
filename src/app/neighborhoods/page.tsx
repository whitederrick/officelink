"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/storage";
import { calcNeighborhoodStats } from "@/lib/stats";
import { PageHeader } from "@/components/PageHeader";
import { LoadingIntro } from "@/components/LoadingHouse";
import { BarChart } from "@/components/Charts";
import type { NeighborhoodStats } from "@/types";

function Stars({ value }: { value: number }) {
  return (
    <span className="text-warm-500 text-xs">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < Math.round(value) ? "" : "text-concrete-200"}>★</span>
      ))}
    </span>
  );
}

export default function NeighborhoodsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<NeighborhoodStats[]>([]);

  useEffect(() => {
    setMounted(true);
    if (!getUser()) router.replace("/onboarding");
    setStats(calcNeighborhoodStats());
  }, [router]);

  if (!mounted) return <LoadingIntro />;

  return (
    <div className="bg-white min-h-screen">
      <PageHeader title="동네별 통계" subtitle="우리 동네 비교" back="history" />

      <div className="p-4 space-y-4">
        {/* 막대 차트 */}
        {stats.length > 0 && (
          <div className="warm-card p-4">
            <h2 className="text-sm font-bold text-concrete-900 mb-3">📊 동네별 리뷰 수</h2>
            <BarChart
              data={stats.map((s) => ({ label: s.name.split(" ")[1] || s.name, value: s.totalReviews, color: "#f59e0b" }))}
              height={140}
            />
          </div>
        )}

        {/* 동네별 카드 */}
        <div className="space-y-2">
          {stats.map((s, i) => (
            <div key={s.name} className="warm-card p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="text-base font-bold text-concrete-900">
                    {i === 0 && "🥇 "}
                    {i === 1 && "🥈 "}
                    {i === 2 && "🥉 "}
                    {s.name}
                  </div>
                  <div className="text-[11px] text-concrete-500">건물 {s.buildingCount}개</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-2xl font-bold text-warm-600">
                    {s.avgRating.toFixed(1)}
                  </div>
                  <Stars value={s.avgRating} />
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="text-concrete-600">
                  리뷰 <span className="font-semibold text-concrete-900">{s.totalReviews}</span>개
                </div>
                <div className="flex flex-wrap gap-1 justify-end">
                  {s.topTags.slice(0, 3).map((t) => (
                    <span key={t} className="text-[10px] px-1.5 py-0.5 bg-concrete-100 text-concrete-600 rounded">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {stats.length === 0 && (
          <div className="text-center text-sm text-concrete-400 py-8">
            동네 데이터가 없어요.
          </div>
        )}
      </div>
    </div>
  );
}
