"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getBuildings, getReviews, getUser } from "@/lib/storage";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { LoadingIntro } from "@/components/LoadingHouse";
import type { Building, Review } from "@/types";

function Stars({ value }: { value: number }) {
  return (
    <span className="text-warm-500 text-sm">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < Math.round(value) ? "" : "text-concrete-200"}>★</span>
      ))}
    </span>
  );
}

export default function MyReviewsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);

  useEffect(() => {
    setMounted(true);
    const u = getUser();
    if (!u) {
      router.replace("/onboarding");
      return;
    }
    setReviews(getReviews().filter((r) => r.authorId === u.id).sort((a, b) => b.createdAt - a.createdAt));
    setBuildings(getBuildings());
  }, [router]);

  if (!mounted) return <LoadingIntro />;

  return (
    <div className="bg-white min-h-screen">
      <PageHeader title="내가 쓴 리뷰" back="history" />
      {reviews.length === 0 ? (
        <EmptyState
          kind="empty"
          title="아직 작성한 리뷰가 없어요"
          description="내가 살았던/살고 있는 오피스텔의 솔직한 경험을 들려주세요."
          action={{ label: "리뷰 쓰기", href: "/review/write" }}
        />
      ) : (
        <div className="p-3 space-y-2">
          {reviews.map((r) => {
            const b = buildings.find((x) => x.id === r.buildingId);
            return (
              <div key={r.id} className="warm-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <Link href={`/building/${r.buildingId}`} className="text-sm font-bold text-concrete-900">
                    {b?.name || "건물"}
                  </Link>
                  <Stars value={r.rating} />
                </div>
                <div className="text-sm font-semibold text-concrete-900 mb-1">{r.summary}</div>
                <div className="text-xs text-concrete-500 line-clamp-2">{r.content}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
