"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getServices, getUser } from "@/lib/storage";
import { heroClass } from "@/lib/display";
import type { Service, ServiceCategory } from "@/types";
import { LoadingIntro } from "@/components/LoadingHouse";

const CATEGORY_INFO: Record<ServiceCategory, { label: string; emoji: string; desc: string; color: string }> = {
  clean: { label: "청소", emoji: "🧹", desc: "입주/퇴거, 정기 청소", color: "bg-ink-50 text-ink-700" },
  move: { label: "이사", emoji: "🚛", desc: "원룸/투룸 이사", color: "bg-warm-50 text-warm-700" },
  as: { label: "AS 수리", emoji: "🔧", desc: "보일러, 도어락, 싱크대", color: "bg-coral-50 text-coral-600" },
  delivery: { label: "택배·짐", emoji: "📦", desc: "부재중 보관/짐 보관", color: "bg-sage-50 text-sage-700" },
  utility: { label: "인터넷·가스", emoji: "📡", desc: "인터넷, 가스, 전기", color: "bg-ink-50 text-ink-700" },
  finance: { label: "대출·보험", emoji: "💳", desc: "전세대출, 비교 상담", color: "bg-warm-50 text-warm-700" },
  food: { label: "식사·배달", emoji: "🍱", desc: "도시락, 야식, 배달", color: "bg-coral-50 text-coral-600" },
  etc: { label: "기타", emoji: "✨", desc: "기타 생활 서비스", color: "bg-concrete-100 text-concrete-700" },
};

export default function ServicesPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [topServices, setTopServices] = useState<Service[]>([]);

  useEffect(() => {
    setMounted(true);
    if (!getUser()) router.replace("/onboarding");
    setTopServices(getServices().slice(0, 3));
  }, [router]);

  if (!mounted) {
    return <LoadingIntro />;
  }

  return (
    <div className="bg-white min-h-screen">
      {/* 히어로 */}
      <div className={`${heroClass.warm} px-4 pt-4 pb-5`}>
        <h1 className="text-xl font-bold text-concrete-900 mb-1">1인가구를 위한 생활 서비스</h1>
        <p className="text-xs text-concrete-500">우리 동네 검증된 업체만 모아봤어요</p>
      </div>

      {/* 카테고리 그리드 */}
      <section className="px-4 pt-4 pb-2">
        <div className="grid grid-cols-4 gap-2">
          {(Object.keys(CATEGORY_INFO) as ServiceCategory[]).map((cat) => {
            const info = CATEGORY_INFO[cat];
            return (
              <Link
                key={cat}
                href={`/services/${cat}`}
                className="warm-card p-3 flex flex-col items-center text-center active:scale-95 transition"
              >
                <div className="text-2xl mb-1">{info.emoji}</div>
                <div className="text-[11px] font-semibold text-concrete-900">{info.label}</div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 인기 서비스 */}
      <section className="px-4 pt-4 pb-2">
        <h2 className="text-sm font-bold text-concrete-900 mb-2">🔥 인기 서비스</h2>
        <div className="space-y-2">
          {topServices.map((s) => (
            <Link
              key={s.id}
              href={`/service/${s.id}`}
              className="warm-card p-3 flex items-center gap-3"
            >
              <div className="w-12 h-12 rounded-soft bg-warm-50 flex items-center justify-center text-2xl shrink-0">
                {CATEGORY_INFO[s.category].emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-sm font-semibold truncate">{s.name}</span>
                  <span className="text-[11px] text-warm-700">⭐ {s.rating}</span>
                </div>
                <div className="text-[11px] text-concrete-500 truncate">{s.description}</div>
                <div className="text-[11px] text-warm-700 font-semibold mt-0.5">{s.price}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 안내 */}
      <section className="px-4 py-4">
        <div className="warm-card p-4 bg-sage-50/30 border-sage-200">
          <div className="text-sm font-semibold text-concrete-900 mb-1">💡 도움말</div>
          <ul className="text-xs text-concrete-600 space-y-1 leading-relaxed">
            <li>• 건물 상세 → 편의 서비스 탭에서 우리 집 제휴 업체를 확인하세요.</li>
            <li>• AS 수리는 보통 관리사무소를 통해 신청하는 게 빨라요.</li>
            <li>• 이사/청소는 1-2주 전 예약이 안전합니다.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
