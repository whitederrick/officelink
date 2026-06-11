"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getBuildings, getProfile, getUser } from "@/lib/storage";
import { heroClass } from "@/lib/display";
import { PageHeader } from "@/components/PageHeader";
import { LoadingIntro } from "@/components/LoadingHouse";
import type { Building, Profile } from "@/types";

export default function LandlordPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [buildings, setBuildings] = useState<Building[]>([]);

  useEffect(() => {
    setMounted(true);
    if (!getUser()) {
      router.replace("/onboarding");
      return;
    }
    const p = getProfile(params.id);
    if (!p) {
      router.replace("/");
      return;
    }
    setProfile(p);
    setBuildings(getBuildings().filter((b) => p.buildingIds.includes(b.id)));
  }, [router, params.id]);

  if (!mounted || !profile) {
    return <LoadingIntro />;
  }

  return (
    <div className="bg-white min-h-screen senior-mode">
      <PageHeader title="임대인 정보" back="history" />
      <div className={`${heroClass.cool} px-4 pt-4 pb-5 border-b border-concrete-100`}>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 bg-ink-50 text-ink-700 rounded text-[11px] font-semibold">
            임대인
          </span>
        </div>
        <h1 className="text-xl font-bold text-concrete-900 mb-1">{profile.name}</h1>
        <div className="flex items-center gap-3 text-xs text-concrete-500 mb-3">
          <span>보유 건물 {profile.buildingIds.length}개</span>
        </div>

        <div className="warm-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="text-3xl font-bold text-warm-600">{profile.ratingAvg.toFixed(1)}</div>
            <div className="text-xs text-concrete-500">/ 5.0</div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="warm-card p-2 text-center">
              <div className="text-[11px] text-concrete-500">응답률</div>
              <div className="text-base font-bold text-ink-700">{profile.responseRate}%</div>
            </div>
            <div className="warm-card p-2 text-center">
              <div className="text-[11px] text-concrete-500">평균 응답</div>
              <div className="text-base font-bold text-ink-700">{profile.responseHours}시간</div>
            </div>
          </div>
        </div>
      </div>

      {/* 태그별 평점 */}
      <section className="p-4">
        <h2 className="text-sm font-bold text-concrete-900 mb-3">세부 평판</h2>
        <div className="space-y-2">
          {profile.ratingTags.map((t) => (
            <div key={t.name} className="warm-card p-3 flex items-center justify-between">
              <span className="text-sm text-concrete-700">{t.name}</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-1.5 bg-concrete-100 rounded-pill overflow-hidden">
                  <div
                    className="h-full bg-warm-500"
                    style={{ width: `${(t.score / 5) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-concrete-900 w-8 text-right">
                  {t.score.toFixed(1)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 보유 건물 */}
      {buildings.length > 0 && (
        <section className="p-4 border-t border-concrete-100">
          <h2 className="text-sm font-bold text-concrete-900 mb-3">보유 건물</h2>
          <div className="space-y-2">
            {buildings.map((b) => (
              <Link
                key={b.id}
                href={`/building/${b.id}`}
                className="warm-card p-3 flex items-center gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold">{b.name}</div>
                  <div className="text-[11px] text-concrete-500 truncate">{b.address}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-bold text-warm-600">{b.ratingAvg.toFixed(1)}</div>
                  <div className="text-[11px] text-concrete-500">리뷰 {b.ratingCount}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 연락 */}
      {profile.phone && (
        <div className="p-4">
          <a
            href={`tel:${profile.phone}`}
            className="cta-info w-full h-12 rounded-soft flex items-center justify-center text-sm"
          >
            📞 {profile.phone}로 전화
          </a>
        </div>
      )}
    </div>
  );
}
