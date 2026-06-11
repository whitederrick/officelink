"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getServices, getUser } from "@/lib/storage";
import type { Service, ServiceCategory } from "@/types";
import { LoadingIntro } from "@/components/LoadingHouse";

const CATEGORY_INFO: Record<ServiceCategory, { label: string; emoji: string; desc: string; hero: string }> = {
  clean: { label: "청소", emoji: "🧹", desc: "입주/퇴거, 정기 청소", hero: "bg-cool-gradient" },
  move: { label: "이사", emoji: "🚛", desc: "원룸/투룸 이사", hero: "bg-soft-gradient" },
  as: { label: "AS 수리", emoji: "🔧", desc: "보일러, 도어락, 싱크대", hero: "bg-soft-gradient" },
  delivery: { label: "택배·짐", emoji: "📦", desc: "부재중 보관/짐 보관", hero: "bg-warm-gradient" },
  utility: { label: "인터넷·가스", emoji: "📡", desc: "인터넷, 가스, 전기", hero: "bg-cool-gradient" },
  finance: { label: "대출·보험", emoji: "💳", desc: "전세대출, 비교 상담", hero: "bg-soft-gradient" },
  food: { label: "식사·배달", emoji: "🍱", desc: "도시락, 야식, 배달", hero: "bg-soft-gradient" },
  etc: { label: "기타", emoji: "✨", desc: "기타 생활 서비스", hero: "bg-soft-gradient" },
};

export default function ServiceCategoryPage() {
  const router = useRouter();
  const params = useParams<{ category: string }>();
  const cat = params.category as ServiceCategory;
  const [mounted, setMounted] = useState(false);
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    setMounted(true);
    if (!getUser()) router.replace("/onboarding");
    setServices(getServices(cat));
  }, [router, cat]);

  if (!mounted) {
    return <LoadingIntro />;
  }

  const info = CATEGORY_INFO[cat] || CATEGORY_INFO.etc;

  return (
    <div className="bg-white min-h-screen">
      <div className={`${info.hero} px-4 pt-4 pb-5 border-b border-concrete-100`}>
        <button onClick={() => router.back()} className="text-lg mb-3 text-concrete-600">‹</button>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-3xl">{info.emoji}</span>
          <h1 className="text-xl font-bold text-concrete-900">{info.label}</h1>
        </div>
        <p className="text-xs text-concrete-500">{info.desc}</p>
      </div>

      <div className="p-3 space-y-2">
        {services.length === 0 ? (
          <div className="p-12 text-center text-concrete-400 text-sm">
            이 카테고리에는 아직 업체가 없어요.
          </div>
        ) : (
          services.map((s) => (
            <Link
              key={s.id}
              href={`/service/${s.id}`}
              className="warm-card p-3 flex items-center gap-3"
            >
              <div className="w-12 h-12 rounded-soft bg-warm-50 flex items-center justify-center text-2xl shrink-0">
                {info.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-sm font-semibold truncate">{s.name}</span>
                  <span className="text-[11px] text-warm-700">⭐ {s.rating}</span>
                  <span className="text-[11px] text-concrete-400">({s.reviewCount})</span>
                </div>
                <div className="text-[11px] text-concrete-500 truncate">{s.description}</div>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  {s.tags.map((t) => (
                    <span key={t} className="text-[10px] px-1.5 py-0.5 bg-concrete-100 text-concrete-600 rounded">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="text-[11px] text-warm-700 font-semibold mt-1">{s.price}</div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
