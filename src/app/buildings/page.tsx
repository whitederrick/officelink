"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getBuildings, getReviews, getUser } from "@/lib/storage";
import type { Building, Review } from "@/types";
import { LoadingIntro } from "@/components/LoadingHouse";

function Stars({ value }: { value: number }) {
  return (
    <span className="text-warm-500 text-sm">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < Math.round(value) ? "" : "text-concrete-200"}>★</span>
      ))}
    </span>
  );
}

export default function BuildingsListPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [sort, setSort] = useState<"rating" | "recent" | "price">("rating");
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    setMounted(true);
    if (!getUser()) router.replace("/onboarding");
  }, [router]);

  const list = useMemo(() => {
    if (!mounted) return [];
    const all = getBuildings();
    let filtered = all;
    if (keyword.trim()) {
      const k = keyword.trim().toLowerCase();
      filtered = all.filter(
        (b) =>
          b.name.toLowerCase().includes(k) ||
          b.address.toLowerCase().includes(k) ||
          b.dong.toLowerCase().includes(k),
      );
    }
    if (sort === "rating") return [...filtered].sort((a, b) => b.ratingAvg - a.ratingAvg);
    if (sort === "price") return [...filtered].sort((a, b) => (a.priceMonthly || 0) - (b.priceMonthly || 0));
    return [...filtered].sort((a, b) => b.createdAt - a.createdAt);
  }, [mounted, sort, keyword]);

  if (!mounted) {
    return <LoadingIntro />;
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="sticky top-12 z-20 bg-white border-b border-concrete-100 px-4 h-12 flex items-center gap-2">
        <button onClick={() => router.back()} className="text-lg">‹</button>
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="건물명, 주소, 동 검색"
          className="flex-1 h-8 px-3 border border-concrete-200 rounded-pill text-sm focus:outline-none focus:border-warm-500"
        />
      </div>

      <div className="px-4 pt-3 pb-1 flex gap-1.5">
        {([
          ["rating", "평점순"],
          ["price", "저가순"],
          ["recent", "최신순"],
        ] as const).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setSort(k)}
            className={`px-3 h-7 text-xs rounded-pill border ${
              sort === k
                ? "bg-warm-500 text-white border-warm-500"
                : "bg-white text-concrete-600 border-concrete-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="p-3 space-y-2">
        {list.length === 0 ? (
          <div className="p-12 text-center text-concrete-400 text-sm">
            검색 결과가 없어요.
          </div>
        ) : (
          list.map((b) => (
            <Link
              key={b.id}
              href={`/building/${b.id}`}
              className="warm-card p-4 block"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-concrete-900 mb-0.5">{b.name}</h3>
                  <div className="text-xs text-concrete-500 truncate">📍 {b.address}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-lg font-bold text-warm-600">{b.ratingAvg.toFixed(1)}</div>
                  <div className="text-[10px] text-concrete-500">리뷰 {b.ratingCount}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 mb-2">
                <Stars value={b.ratingAvg} />
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="text-concrete-600">
                  {b.priceDeposit && b.priceMonthly
                    ? `보증금 ${b.priceDeposit} / 월세 ${b.priceMonthly}`
                    : "시세 정보 없음"}
                </div>
                <div className="text-concrete-400">
                  {b.totalUnits && `${b.totalUnits}세대`}
                  {b.parking && " · 주차"}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
