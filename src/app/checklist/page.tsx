"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/storage";
import { PageHeader } from "@/components/PageHeader";
import { LoadingIntro } from "@/components/LoadingHouse";
import { showToast } from "@/lib/toast";

const CHECK_KEY = "officelink:checklist";

const ITEMS = [
  { id: "c1", emoji: "📝", text: "계약서 작성 (보증금, 월세, 기간 명시)" },
  { id: "c2", emoji: "💰", text: "보증금 송금 (계좌 확인 필수)" },
  { id: "c3", emoji: "🔑", text: "입주일자와 열쇠 수령 일정 확정" },
  { id: "c4", emoji: "📦", text: "이사 업체 예약 (2-3주 전)" },
  { id: "c5", emoji: "🧹", text: "입주 청소 예약 (이사 전/후)" },
  { id: "c6", emoji: "📡", text: "인터넷 설치 예약 (입주 1주일 전)" },
  { id: "c7", emoji: "🔥", text: "도시가스 신청" },
  { id: "c8", emoji: "💡", text: "전기 신청" },
  { id: "c9", emoji: "🚿", text: "수도 신청" },
  { id: "c10", emoji: "🏠", text: "관리사무소 입주 신고" },
  { id: "c11", emoji: "🚚", text: "주차 등록 (차량 보유 시)" },
  { id: "c12", emoji: "📮", text: "우편물 주소 변경 (주민센터)" },
  { id: "c13", emoji: "🪪", text: "신분증 주소지 변경" },
  { id: "c14", emoji: "🏥", text: "주민등록등본 주소 변경 (필요시)" },
  { id: "c15", emoji: "🏦", text: "은행 주소 변경" },
  { id: "c16", emoji: "📋", text: "퇴거 시 원상복구 체크리스트 작성" },
];

function loadChecks(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(CHECK_KEY) || "{}");
  } catch {
    return {};
  }
}
function saveChecks(c: Record<string, boolean>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CHECK_KEY, JSON.stringify(c));
}

export default function ChecklistPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [checks, setChecks] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setMounted(true);
    if (!getUser()) {
      router.replace("/onboarding");
      return;
    }
    setChecks(loadChecks());
  }, [router]);

  if (!mounted) return <LoadingIntro />;

  const toggle = (id: string) => {
    const next = { ...checks, [id]: !checks[id] };
    setChecks(next);
    saveChecks(next);
    if (next[id]) {
      showToast({ kind: "success", title: "체크 완료!", description: "잘하고 있어요 👏" });
    }
  };

  const reset = () => {
    if (!confirm("모든 체크를 해제할까요?")) return;
    setChecks({});
    saveChecks({});
    showToast({ kind: "info", title: "초기화됐어요" });
  };

  const done = Object.values(checks).filter(Boolean).length;
  const pct = Math.round((done / ITEMS.length) * 100);

  return (
    <div className="bg-white min-h-screen">
      <PageHeader title="이사 체크리스트" subtitle={`${done}/${ITEMS.length} 완료 (${pct}%)`} back="history" />

      {/* 진행률 바 */}
      <div className="px-4 py-3">
        <div className="h-2 bg-concrete-100 rounded-pill overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-warm-400 to-warm-500 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="p-3 space-y-2">
        {ITEMS.map((it) => {
          const on = !!checks[it.id];
          return (
            <button
              key={it.id}
              onClick={() => toggle(it.id)}
              className={`w-full p-3 rounded-soft border-2 flex items-center gap-3 text-left transition ${
                on
                  ? "border-sage-300 bg-sage-50"
                  : "border-concrete-200 bg-white"
              }`}
            >
              <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 transition ${
                on ? "bg-sage-500 border-sage-500" : "border-concrete-300"
              }`}>
                {on && <span className="text-white text-sm font-bold">✓</span>}
              </div>
              <span className="text-lg shrink-0">{it.emoji}</span>
              <span className={`text-sm flex-1 ${on ? "line-through text-concrete-500" : "text-concrete-900 font-medium"}`}>
                {it.text}
              </span>
            </button>
          );
        })}
      </div>

      <div className="p-4">
        <button
          onClick={reset}
          className="w-full h-11 text-sm font-medium text-concrete-500 bg-white border border-concrete-200 rounded-soft active:bg-concrete-50"
        >
          ↻ 모두 초기화
        </button>
      </div>

      {pct === 100 && (
        <div className="px-4 pb-6">
          <div className="warm-card p-4 bg-sage-50 border-sage-200 text-center">
            <div className="text-3xl mb-2">🎉</div>
            <div className="text-sm font-bold text-sage-700">모두 완료!</div>
            <div className="text-xs text-concrete-600 mt-1">
              이사 준비 끝! 새 집에서 좋은 일만 가득하세요 🏠
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
