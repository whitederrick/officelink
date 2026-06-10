"use client";

import type { Building, BuildingStats, NeighborhoodStats, Review } from "@/types";
import { getBuildings, getReviews } from "./storage";

/**
 * 건물의 차트/통계 데이터 계산
 */
export function calcBuildingStats(buildingId: string): BuildingStats {
  const reviews = getReviews(buildingId);
  const dist = [1, 2, 3, 4, 5].map((star) => ({
    star,
    count: reviews.filter((r) => Math.round(r.rating) === star).length,
  }));

  const avg = (k: keyof Review["ratings"]) =>
    reviews.length === 0
      ? 0
      : reviews.reduce((s, r) => s + r.ratings[k], 0) / reviews.length;

  // 최근 6개월 리뷰 수 + 평균
  const now = new Date();
  const monthly: { month: string; count: number; avgRating: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const monthReviews = reviews.filter((r) => {
      const rd = new Date(r.createdAt);
      return rd.getFullYear() === d.getFullYear() && rd.getMonth() === d.getMonth();
    });
    monthly.push({
      month: ym,
      count: monthReviews.length,
      avgRating:
        monthReviews.length === 0
          ? 0
          : monthReviews.reduce((s, r) => s + r.rating, 0) / monthReviews.length,
    });
  }

  // 태그 클라우드
  const tagCount = new Map<string, { count: number; sentiment: "pos" | "neg" }>();
  for (const r of reviews) {
    for (const t of r.pros) {
      const cur = tagCount.get(t) || { count: 0, sentiment: "pos" as const };
      tagCount.set(t, { count: cur.count + 1, sentiment: "pos" });
    }
    for (const t of r.cons) {
      const cur = tagCount.get(t) || { count: 0, sentiment: "neg" as const };
      tagCount.set(t, { count: cur.count + 1, sentiment: "neg" });
    }
  }
  const tagCloud = Array.from(tagCount.entries())
    .map(([tag, v]) => ({ tag, ...v }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);

  return {
    buildingId,
    totalReviews: reviews.length,
    ratingDistribution: dist,
    categoryAverages: {
      noise: avg("noise"),
      clean: avg("clean"),
      facility: avg("facility"),
      management: avg("management"),
      safety: avg("safety"),
    },
    monthlyReviews: monthly,
    tagCloud,
  };
}

/**
 * 동네(시군구+동)별 통계
 */
export function calcNeighborhoodStats(): NeighborhoodStats[] {
  const buildings = getBuildings();
  const map = new Map<string, Building[]>();
  for (const b of buildings) {
    const key = `${b.sigungu} ${b.dong}`;
    const arr = map.get(key) || [];
    arr.push(b);
    map.set(key, arr);
  }
  const out: NeighborhoodStats[] = [];
  for (const [name, bs] of map.entries()) {
    const reviews = bs.flatMap((b) => getReviews(b.id));
    const tagCount = new Map<string, number>();
    for (const r of reviews) {
      for (const t of [...r.pros, ...r.cons]) {
        tagCount.set(t, (tagCount.get(t) || 0) + 1);
      }
    }
    const topTags = Array.from(tagCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([t]) => t);
    out.push({
      name,
      buildingCount: bs.length,
      avgRating:
        reviews.length === 0
          ? 0
          : reviews.reduce((s, r) => s + r.rating, 0) / reviews.length,
      totalReviews: reviews.length,
      topTags,
    });
  }
  return out.sort((a, b) => b.totalReviews - a.totalReviews);
}

/**
 * 사용자의 월별 활동 (스파크라인용)
 */
export function calcMonthlyActivity(userId: string): { month: string; count: number }[] {
  const reviews = getReviews().filter((r) => r.authorId === userId);
  const now = new Date();
  const out: { month: string; count: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const count = reviews.filter((r) => {
      const rd = new Date(r.createdAt);
      return rd.getFullYear() === d.getFullYear() && rd.getMonth() === d.getMonth();
    }).length;
    out.push({ month: ym, count });
  }
  return out;
}
