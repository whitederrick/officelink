"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getBuildings,
  getBuildingLinks,
  getUser,
  unlinkBuilding,
  linkBuilding,
} from "@/lib/storage";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { LoadingIntro } from "@/components/LoadingHouse";
import { IllustEmpty } from "@/components/Illustrations";

export default function FavoritePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [buildings, setBuildings] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    const u = getUser();
    if (!u) {
      router.replace("/onboarding");
      return;
    }
    const links = getBuildingLinks(u.id).filter((l) => l.relation === "interested");
    const all = getBuildings();
    setBuildings(all.filter((b) => links.some((l) => l.buildingId === b.id)));
  }, [router]);

  if (!mounted) return <LoadingIntro />;

  return (
    <div className="bg-white min-h-screen">
      <PageHeader title="관심 거주지" subtitle="1곳까지 등록 가능" back="history" />
      <div className="p-3">
        {buildings.length === 0 ? (
          <EmptyState
            kind="empty"
            illustrationSize={120}
            title="아직 관심 거주지가 없어요"
            description="이사 후보 오피스텔을 등록해두면, 그 동네 소식과 리뷰가 자동으로 모여요."
            action={{ label: "건물 보러 가기", href: "/buildings" }}
          />
        ) : (
          <div className="space-y-2">
            {buildings.map((b) => (
              <div key={b.id} className="warm-card p-3 flex items-center gap-3">
                <Link href={`/building/${b.id}`} className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-concrete-900">{b.name}</div>
                  <div className="text-[11px] text-concrete-500 truncate">{b.address}</div>
                </Link>
                <button
                  onClick={() => {
                    const u = getUser();
                    if (!u) return;
                    unlinkBuilding(u.id, b.id);
                    setBuildings(buildings.filter((x) => x.id !== b.id));
                  }}
                  className="text-[11px] text-concrete-400 px-2 py-1"
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
