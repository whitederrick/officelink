"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getListing, getUser } from "@/lib/storage";
import { PageHeader } from "@/components/PageHeader";
import { LoadingIntro } from "@/components/LoadingHouse";
import { Button } from "@/components/Button";
import { showToast } from "@/lib/toast";
import { useT } from "@/lib/useT";
import { LANG_LABEL, type Lang } from "@/lib/i18n";
import type { ShortTermListing } from "@/types";

function formatPrice(n: number, currency: string) {
  if (currency === "KRW") return `${n.toLocaleString()}원`;
  if (currency === "USD") return `$${n.toLocaleString()}`;
  if (currency === "JPY") return `¥${n.toLocaleString()}`;
  if (currency === "CNY") return `¥${n.toLocaleString()}`;
  return n.toLocaleString();
}

export default function StayDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { lang: uiLang } = useT();
  const [mounted, setMounted] = useState(false);
  const [listing, setListing] = useState<ShortTermListing | null>(null);
  const [displayLang, setDisplayLang] = useState<Lang>("ko");
  const [nights, setNights] = useState(7);

  useEffect(() => {
    setMounted(true);
    if (!getUser()) {
      router.replace("/onboarding");
      return;
    }
    const l = getListing(params.id);
    if (!l) {
      router.replace("/stays");
      return;
    }
    setListing(l);
    // 사용 가능한 언어 중 uiLang으로 시작
    if (l.hostLangs.includes(uiLang as Lang)) {
      setDisplayLang(uiLang as Lang);
    } else if (l.hostLangs.length > 0) {
      setDisplayLang(l.hostLangs[0]);
    }
  }, [router, params.id, uiLang]);

  if (!mounted || !listing) return <LoadingIntro />;

  const desc = listing.description[displayLang] || listing.description.en || listing.description.ko || "";
  const rules = listing.rules[displayLang] || listing.rules.en || listing.rules.ko || [];

  return (
    <div className="bg-white min-h-screen">
      <PageHeader title="단기임대 상세" back="history" />

      {/* 히어로 */}
      <div className="bg-soft-gradient px-4 pt-4 pb-5 border-b border-concrete-100">
        <div className="text-3xl mb-2">🏠</div>
        <h1 className="text-xl font-bold text-concrete-900 mb-1">
          {listing.buildingName} {listing.unitNumber}
        </h1>
        <div className="text-sm text-concrete-700 mb-3">
          호스트: <strong>{listing.hostNickname}</strong>
        </div>

        <div className="warm-card p-4 bg-white">
          <div className="text-[11px] text-concrete-500 mb-1">일일 가격</div>
          <div className="text-3xl font-bold text-warm-600">
            {formatPrice(listing.pricePerDay, listing.currency)}
          </div>
          <div className="text-[11px] text-concrete-500 mt-1">
            주 {formatPrice(listing.pricePerWeek, listing.currency)} · 월 {formatPrice(listing.pricePerMonth, listing.currency)}
          </div>
        </div>
      </div>

      {/* 다국어 토글 */}
      <div className="px-4 py-3 border-b border-concrete-100 bg-warm-50/30">
        <div className="text-[11px] font-semibold text-concrete-700 mb-1.5">🌐 표시 언어</div>
        <div className="flex gap-1.5">
          {(["ko", "en", "ja", "zh"] as Lang[]).map((ll) => {
            const has = listing.hostLangs.includes(ll);
            return (
              <button
                key={ll}
                onClick={() => has && setDisplayLang(ll)}
                disabled={!has}
                className={`px-3 h-7 text-xs rounded-pill border ${
                  displayLang === ll
                    ? "bg-warm-500 text-white border-warm-500"
                    : has
                    ? "bg-white text-concrete-600 border-concrete-200"
                    : "bg-concrete-50 text-concrete-300 border-concrete-100"
                }`}
              >
                {LANG_LABEL[ll].flag} {LANG_LABEL[ll].native}
                {!has && " · 없음"}
              </button>
            );
          })}
        </div>
      </div>

      {/* 설명 */}
      <section className="p-4 border-b border-concrete-100">
        <h2 className="text-sm font-bold text-concrete-900 mb-2">📝 설명 ({LANG_LABEL[displayLang].native})</h2>
        <div className="text-sm text-concrete-700 leading-relaxed whitespace-pre-wrap">
          {desc}
        </div>
      </section>

      {/* 옵션 */}
      <section className="p-4 border-b border-concrete-100">
        <h2 className="text-sm font-bold text-concrete-900 mb-2">🏠 옵션</h2>
        <div className="grid grid-cols-3 gap-2 text-xs">
          {[
            { k: "furnished", emoji: "🛋", label: "가구" },
            { k: "wifi", emoji: "📡", label: "WiFi" },
            { k: "kitchen", emoji: "🍳", label: "주방" },
            { k: "washer", emoji: "🧺", label: "세탁기" },
            { k: "ac", emoji: "❄️", label: "에어컨" },
            { k: "heating", emoji: "🔥", label: "난방" },
            { k: "utilities", emoji: "💡", label: "공과금" },
          ].map((o) => {
            const on = (listing as any)[o.k];
            return (
              <div
                key={o.k}
                className={`p-2 rounded-soft border text-center ${
                  on
                    ? "border-sage-200 bg-sage-50 text-sage-700"
                    : "border-concrete-200 bg-concrete-50 text-concrete-300"
                }`}
              >
                <div className="text-lg">{o.emoji}</div>
                <div className="mt-0.5 font-semibold">{o.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 규칙 */}
      <section className="p-4 border-b border-concrete-100">
        <h2 className="text-sm font-bold text-concrete-900 mb-2">📋 이용 규칙</h2>
        {rules.length === 0 ? (
          <div className="text-xs text-concrete-400">규칙 없음</div>
        ) : (
          <ul className="space-y-1 text-sm text-concrete-700">
            {rules.map((r, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-coral-500">•</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 가격 계산 */}
      <section className="p-4 border-b border-concrete-100">
        <h2 className="text-sm font-bold text-concrete-900 mb-2">💰 예상 가격</h2>
        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={() => setNights(Math.max(1, nights - 1))}
            className="w-9 h-9 rounded-soft bg-concrete-100 text-concrete-700"
          >
            −
          </button>
          <div className="flex-1 text-center">
            <div className="text-2xl font-bold text-concrete-900">{nights}</div>
            <div className="text-[11px] text-concrete-500">일 / nights</div>
          </div>
          <button
            onClick={() => setNights(nights + 1)}
            className="w-9 h-9 rounded-soft bg-concrete-100 text-concrete-700"
          >
            +
          </button>
        </div>
        <div className="warm-card p-3 bg-warm-50 border-warm-200 text-center">
          <div className="text-[11px] text-concrete-600">총 예상 가격</div>
          <div className="text-2xl font-bold text-warm-700">
            {formatPrice(nights * listing.pricePerDay, listing.currency)}
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="p-4 space-y-2">
        <Button
          variant="primary"
          size="lg"
          full
          onClick={() => showToast({ kind: "success", title: "문의가 호스트에게 전달되었어요" })}
        >
          💌 호스트에게 문의하기
        </Button>
        <Button
          variant="secondary"
          size="lg"
          full
          onClick={() => {
            if (typeof navigator !== "undefined" && (navigator as any).share) {
              (navigator as any).share({
                title: listing.buildingName,
                text: desc.slice(0, 100),
                url: typeof window !== "undefined" ? window.location.href : "",
              });
            } else {
              showToast({ kind: "info", title: "공유 링크 복사됨" });
            }
          }}
        >
          🔗 공유하기
        </Button>
      </div>
    </div>
  );
}
