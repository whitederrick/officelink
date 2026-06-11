"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getBuildings, getListings, getUser } from "@/lib/storage";
import { PageHeader } from "@/components/PageHeader";
import { LoadingIntro } from "@/components/LoadingHouse";
import { EmptyState } from "@/components/EmptyState";
import { LinkButton } from "@/components/Button";
import { useT } from "@/lib/useT";
import { getLang, LANG_LABEL } from "@/lib/i18n";
import type { Building, ShortTermListing } from "@/types";

function formatPrice(n: number, currency: string) {
  if (currency === "KRW") return `${n.toLocaleString()}원`;
  if (currency === "USD") return `$${n.toLocaleString()}`;
  if (currency === "JPY") return `¥${n.toLocaleString()}`;
  if (currency === "CNY") return `¥${n.toLocaleString()}`;
  return n.toLocaleString();
}

export default function StaysPage() {
  const router = useRouter();
  const { t, lang } = useT();
  const [mounted, setMounted] = useState(false);
  const [listings, setListings] = useState<ShortTermListing[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [filterLang, setFilterLang] = useState<string>("all");
  const [filterBuilding, setFilterBuilding] = useState<string>("all");

  useEffect(() => {
    setMounted(true);
    if (!getUser()) {
      router.replace("/onboarding");
      return;
    }
    setListings(getListings());
    setBuildings(getBuildings());
  }, [router]);

  if (!mounted) return <LoadingIntro />;

  const filtered = listings.filter((l) => {
    if (filterLang !== "all" && !l.hostLangs.includes(filterLang as any)) return false;
    if (filterBuilding !== "all" && l.buildingId !== filterBuilding) return false;
    return true;
  });

  return (
    <div className="bg-white min-h-screen">
      <PageHeader
        title="🏠 단기임대 (For Foreigners)"
        subtitle="Short-term rental · 多言語対応"
        back="history"
        right={
          <LinkButton href="/stays/new" variant="primary" size="sm">
            + 등록
          </LinkButton>
        }
      />

      {/* 언어 필터 */}
      <div className="px-4 pt-3 pb-2 border-b border-concrete-100">
        <div className="text-[11px] font-semibold text-concrete-700 mb-1.5">🌐 호스트 언어</div>
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { v: "all", label: "전체", flag: "🌍" },
            { v: "ko", label: "한국어", flag: "🇰🇷" },
            { v: "en", label: "English", flag: "🇺🇸" },
            { v: "ja", label: "日本語", flag: "🇯🇵" },
            { v: "zh", label: "中文", flag: "🇨🇳" },
          ].map((f) => (
            <button
              key={f.v}
              onClick={() => setFilterLang(f.v)}
              className={`shrink-0 px-3 h-7 text-xs rounded-pill border ${
                filterLang === f.v
                  ? "bg-warm-500 text-white border-warm-500"
                  : "bg-white text-concrete-600 border-concrete-200"
              }`}
            >
              {f.flag} {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* 건물 필터 */}
      <div className="px-4 py-2 border-b border-concrete-100">
        <select
          value={filterBuilding}
          onChange={(e) => setFilterBuilding(e.target.value)}
          className="w-full h-9 px-3 border border-concrete-200 rounded-soft text-xs bg-white"
        >
          <option value="all">🏢 전체 건물</option>
          {buildings.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      {/* 안내 배너 */}
      <div className="px-4 pt-3">
        <div className="warm-card p-3 bg-sage-50 border-sage-200">
          <div className="text-sm font-bold text-concrete-900 mb-1">🌍 외국인 단기임대 안내</div>
          <div className="text-xs text-concrete-600 leading-relaxed">
            출장·유학·워홀·여행 등 1일~3개월 단기 거주를 위한 매물이에요.
            호스트가 {LANG_LABEL[getLang()].native} 가능하면 자동으로 매물이 보여요.
          </div>
        </div>
      </div>

      {/* 리스팅 */}
      <div className="p-3 space-y-2">
        {filtered.length === 0 ? (
          <EmptyState
            kind="empty"
            title="조건에 맞는 매물이 없어요"
            description="필터를 변경하거나 잠시 후 다시 확인해주세요."
          />
        ) : (
          filtered.map((l) => (
            <Link
              key={l.id}
              href={`/stays/${l.id}`}
              className="warm-card p-3 block active:scale-[0.99] transition"
            >
              <div className="flex items-start gap-2 mb-2">
                <div className="w-10 h-10 rounded-soft bg-gradient-to-br from-warm-300 to-warm-500 flex items-center justify-center text-white font-bold shrink-0">
                  {l.hostNickname.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-concrete-900 truncate">
                    {l.hostNickname}
                  </div>
                  <div className="text-[11px] text-concrete-500 truncate">
                    {l.buildingName} · {l.unitNumber}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-base font-bold text-warm-700">
                    {formatPrice(l.pricePerDay, l.currency)}
                  </div>
                  <div className="text-[10px] text-concrete-500">/일</div>
                </div>
              </div>

              {/* 다국어 설명 */}
              <div className="text-xs text-concrete-700 leading-relaxed line-clamp-2 mb-2">
                {l.description[lang as keyof typeof l.description] || l.description.en}
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {l.hostLangs.map((ll) => (
                  <span
                    key={ll}
                    className="text-[10px] px-1.5 py-0.5 bg-concrete-100 text-concrete-600 rounded"
                  >
                    {LANG_LABEL[ll].flag} {LANG_LABEL[ll].native}
                  </span>
                ))}
                {l.furnished && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-sage-50 text-sage-700 rounded">가구가구</span>
                )}
                {l.wifi && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-sage-50 text-sage-700 rounded">WiFi</span>
                )}
                {l.utilities && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-sage-50 text-sage-700 rounded">공과금 포함</span>
                )}
                <span className="text-[10px] text-concrete-400 ml-auto">
                  {l.views}👁 · {l.inquiries}💬
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
