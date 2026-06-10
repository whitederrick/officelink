"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getBuildings, getService, getUser } from "@/lib/storage";
import { heroClass } from "@/lib/display";
import type { Building, Service, ServiceCategory } from "@/types";
import { LoadingIntro } from "@/components/LoadingHouse";

const CAT_EMOJI: Record<ServiceCategory, string> = {
  clean: "🧹", move: "🚛", as: "🔧", delivery: "📦",
  utility: "📡", finance: "💳", food: "🍱", etc: "✨",
};

export default function ServiceDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [mounted, setMounted] = useState(false);
  const [service, setService] = useState<Service | null>(null);
  const [buildings, setBuildings] = useState<Building[]>([]);

  useEffect(() => {
    setMounted(true);
    if (!getUser()) {
      router.replace("/onboarding");
      return;
    }
    const s = getService(params.id);
    if (!s) {
      router.replace("/services");
      return;
    }
    setService(s);
    setBuildings(getBuildings().filter((b) => s.buildingIds?.includes(b.id)));
  }, [router, params.id]);

  if (!mounted || !service) {
    return <LoadingIntro />;
  }

  return (
    <div className="bg-white min-h-screen">
      <div className={`${heroClass.warm} px-4 pt-4 pb-5 border-b border-concrete-100`}>
        <button onClick={() => router.back()} className="text-lg mb-3 text-concrete-600">‹</button>
        <div className="text-4xl mb-2">{CAT_EMOJI[service.category]}</div>
        <h1 className="text-xl font-bold text-concrete-900 mb-1">{service.name}</h1>
        <div className="flex items-center gap-2 text-sm text-concrete-600 mb-2">
          <span className="text-warm-600 font-semibold">⭐ {service.rating}</span>
          <span>·</span>
          <span>리뷰 {service.reviewCount}개</span>
        </div>
        <div className="text-2xl font-bold text-warm-600 mb-2">{service.price}</div>
        <p className="text-sm text-concrete-700 leading-relaxed">{service.description}</p>
      </div>

      {/* 태그 */}
      {service.tags.length > 0 && (
        <section className="p-4 border-b border-concrete-100">
          <h2 className="text-sm font-bold text-concrete-900 mb-2">특징</h2>
          <div className="flex flex-wrap gap-1.5">
            {service.tags.map((t) => (
              <span key={t} className="text-xs px-2.5 py-1 bg-sage-50 text-sage-700 rounded-pill">
                ✓ {t}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* 서비스 가능 지역 */}
      <section className="p-4 border-b border-concrete-100">
        <h2 className="text-sm font-bold text-concrete-900 mb-2">서비스 가능 지역</h2>
        <div className="text-sm text-concrete-700">
          📍 {service.sigungu}
          {buildings.length > 0 && (
            <div className="mt-2 text-xs text-concrete-500">
              제휴 건물: {buildings.map((b) => b.name).join(", ")}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <div className="p-4 space-y-2">
        <a
          href={`tel:${service.phone}`}
          className="cta-primary w-full h-12 rounded-soft flex items-center justify-center text-sm"
        >
          📞 전화로 문의 ({service.phone})
        </a>
        <button
          onClick={() => alert("요청이 전달되었어요. (데모)" )}
          className="cta-secondary w-full h-12 rounded-soft flex items-center justify-center text-sm"
        >
          ✉️ 온라인 문의하기
        </button>
      </div>

      <div className="p-4 pt-0 text-[11px] text-concrete-400 text-center">
        ※ OFFICELINK는 업체와 제휴 관계이며, 서비스 품질은 업체가 책임집니다.
      </div>
    </div>
  );
}
