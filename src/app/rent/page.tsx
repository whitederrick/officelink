"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser, uid } from "@/lib/storage";
import { PageHeader } from "@/components/PageHeader";
import { LoadingIntro } from "@/components/LoadingHouse";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/Button";
import { showToast } from "@/lib/toast";

interface RentEntry {
  id: string;
  tenantName: string;
  buildingName: string;
  unit: string;
  year: number;
  month: number;
  amount: number;
  received: boolean;
  receivedAt?: number;
  memo?: string;
}

const K_RENT = "officelink:rent";
const load = (): RentEntry[] => {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(K_RENT) || "[]");
  } catch {
    return [];
  }
};
const save = (data: RentEntry[]) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(K_RENT, JSON.stringify(data));
};

export default function RentPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [entries, setEntries] = useState<RentEntry[]>([]);
  const [showForm, setShowForm] = useState(false);

  // 폼
  const [tenantName, setTenantName] = useState("");
  const [buildingName, setBuildingName] = useState("상암오벨리스크 2차");
  const [unit, setUnit] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [amount, setAmount] = useState(65);
  const [memo, setMemo] = useState("");

  const reload = () => setEntries(load());

  useEffect(() => {
    setMounted(true);
    if (!getUser()) {
      router.replace("/onboarding");
      return;
    }
    reload();
  }, [router]);

  if (!mounted) return <LoadingIntro />;

  const submit = () => {
    if (!tenantName.trim() || !unit.trim()) {
      showToast({ kind: "warning", title: "세입자 이름과 호수를 입력해주세요" });
      return;
    }
    const e: RentEntry = {
      id: uid(),
      tenantName: tenantName.trim(),
      buildingName,
      unit: unit.trim(),
      year,
      month,
      amount: amount * 10000, // 만원 단위 → 원
      received: false,
      memo: memo.trim() || undefined,
    };
    const all = load();
    all.push(e);
    save(all);
    reload();
    setTenantName("");
    setUnit("");
    setMemo("");
    setShowForm(false);
    showToast({ kind: "success", title: "임대료 기록 추가됨" });
  };

  const markReceived = (id: string) => {
    const all = load();
    save(
      all.map((e) =>
        e.id === id ? { ...e, received: true, receivedAt: Date.now() } : e,
      ),
    );
    reload();
    showToast({ kind: "success", title: "수령 완료로 표시됨" });
  };

  const remove = (id: string) => {
    if (!confirm("삭제할까요?")) return;
    const all = load();
    save(all.filter((e) => e.id !== id));
    reload();
  };

  const totalReceived = entries
    .filter((e) => e.received)
    .reduce((s, e) => s + e.amount, 0);
  const totalPending = entries
    .filter((e) => !e.received)
    .reduce((s, e) => s + e.amount, 0);

  return (
    <div className="bg-white min-h-screen">
      <PageHeader
        title="임대료 수령"
        subtitle={`수령 ${(totalReceived / 10000).toFixed(0)}만 / 대기 ${(totalPending / 10000).toFixed(0)}만`}
        back="history"
        right={
          <button
            onClick={() => setShowForm(!showForm)}
            className="text-xs text-warm-700 font-semibold px-2"
          >
            {showForm ? "닫기" : "+ 추가"}
          </button>
        }
      />

      {showForm && (
        <div className="p-4 border-b border-concrete-100 bg-warm-50/30 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <input
              value={tenantName}
              onChange={(e) => setTenantName(e.target.value)}
              placeholder="세입자 이름"
              className="h-10 px-3 border border-concrete-200 rounded-soft text-sm"
            />
            <input
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="호수 (예: 803호)"
              className="h-10 px-3 border border-concrete-200 rounded-soft text-sm"
            />
          </div>
          <input
            value={buildingName}
            onChange={(e) => setBuildingName(e.target.value)}
            placeholder="건물명"
            className="w-full h-10 px-3 border border-concrete-200 rounded-soft text-sm"
          />
          <div className="grid grid-cols-3 gap-2">
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value) || year)}
              className="h-10 px-3 border border-concrete-200 rounded-soft text-sm"
            />
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="h-10 px-3 border border-concrete-200 rounded-soft text-sm bg-white"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>{m}월</option>
              ))}
            </select>
            <div className="flex items-center">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                placeholder="만원"
                className="w-full h-10 px-3 border border-concrete-200 rounded-soft text-sm"
              />
            </div>
          </div>
          <input
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="메모 (선택)"
            className="w-full h-10 px-3 border border-concrete-200 rounded-soft text-sm"
          />
          <div className="text-[11px] text-concrete-500 -mt-1">
            금액은 <strong>만원</strong> 단위로 입력해요. (예: 65 = 65만원)
          </div>
          <Button variant="primary" size="md" full onClick={submit}>
            💾 등록
          </Button>
        </div>
      )}

      {/* 요약 */}
      <div className="p-4 grid grid-cols-2 gap-2">
        <div className="warm-card p-4 bg-sage-50 border-sage-200">
          <div className="text-[11px] text-concrete-600">수령 완료</div>
          <div className="text-xl font-bold text-sage-700">
            {(totalReceived / 10000).toLocaleString()}만원
          </div>
        </div>
        <div className="warm-card p-4 bg-warm-50 border-warm-200">
          <div className="text-[11px] text-concrete-600">수령 대기</div>
          <div className="text-xl font-bold text-warm-700">
            {(totalPending / 10000).toLocaleString()}만원
          </div>
        </div>
      </div>

      {/* 기록 */}
      <div className="p-3 space-y-2">
        {entries.length === 0 ? (
          <EmptyState
            kind="empty"
            title="아직 임대료 기록이 없어요"
            description="월별 임대료를 등록하고 수령 여부를 관리하세요."
          />
        ) : (
          [...entries]
            .sort((a, b) => b.year - a.year || b.month - a.month)
            .map((e) => (
              <div key={e.id} className="warm-card p-3 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-soft flex items-center justify-center text-base ${
                  e.received ? "bg-sage-100" : "bg-warm-100"
                }`}>
                  {e.received ? "💰" : "⏳"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-concrete-900 truncate">
                    {e.tenantName} · {e.unit}
                  </div>
                  <div className="text-[11px] text-concrete-500 truncate">
                    {e.buildingName} · {e.year}.{String(e.month).padStart(2, "0")}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-bold text-concrete-900">
                    {(e.amount / 10000).toLocaleString()}만
                  </div>
                  {e.received ? (
                    <span className="text-[10px] text-sage-700">✓ 수령</span>
                  ) : (
                    <button
                      onClick={() => markReceived(e.id)}
                      className="text-[10px] text-warm-700 font-semibold"
                    >
                      수령 처리
                    </button>
                  )}
                </div>
                <button
                  onClick={() => remove(e.id)}
                  className="text-concrete-300 text-xs px-1"
                >
                  ✕
                </button>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
