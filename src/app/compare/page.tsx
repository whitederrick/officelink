"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getBuildings, getUser } from "@/lib/storage";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { LoadingIntro } from "@/components/LoadingHouse";
import type { Building } from "@/types";

function Stars({ value }: { value: number }) {
  return (
    <span className="text-warm-500">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < Math.round(value) ? "" : "text-concrete-200"}>★</span>
      ))}
    </span>
  );
}

export default function ComparePage() {
  const router = useRouter();
  const sp = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [a, setA] = useState<string>("");
  const [b, setB] = useState<string>("");

  useEffect(() => {
    setMounted(true);
    if (!getUser()) {
      router.replace("/onboarding");
      return;
    }
    const list = getBuildings();
    setBuildings(list);
    const qa = sp.get("a");
    const qb = sp.get("b");
    if (qa && list.find((x) => x.id === qa)) setA(qa);
    else if (list[0]) setA(list[0].id);
    if (qb && list.find((x) => x.id === qb)) setB(qb);
    else if (list[1]) setB(list[1].id);
    else if (list[0]) setB(list[0].id);
  }, [router, sp]);

  if (!mounted) return <LoadingIntro />;

  const ba = buildings.find((x) => x.id === a);
  const bb = buildings.find((x) => x.id === b);

  return (
    <div className="bg-white min-h-screen">
      <PageHeader title="건물 비교" subtitle="두 건물 나란히 보기" back="history" />

      <div className="p-3 space-y-3">
        {/* 선택 */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[11px] font-semibold text-concrete-500 mb-1 block">A</label>
            <select
              value={a}
              onChange={(e) => setA(e.target.value)}
              className="w-full h-10 px-2 border border-concrete-200 rounded-soft text-xs bg-white"
            >
              {buildings.map((x) => (
                <option key={x.id} value={x.id}>{x.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-semibold text-concrete-500 mb-1 block">B</label>
            <select
              value={b}
              onChange={(e) => setB(e.target.value)}
              className="w-full h-10 px-2 border border-concrete-200 rounded-soft text-xs bg-white"
            >
              {buildings.map((x) => (
                <option key={x.id} value={x.id}>{x.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 비교 카드 */}
        {ba && bb ? (
          <>
            <div className="grid grid-cols-2 gap-2">
              {[ba, bb].map((x, i) => (
                <div key={x.id} className="warm-card p-3">
                  <div className="text-[10px] text-concrete-500 mb-1">건물 {i === 0 ? "A" : "B"}</div>
                  <div className="text-sm font-bold text-concrete-900 leading-tight mb-1">{x.name}</div>
                  <div className="text-[10px] text-concrete-500 mb-2 line-clamp-2">{x.address}</div>
                  <div className="text-xl font-bold text-warm-600">{x.ratingAvg.toFixed(1)}</div>
                  <div className="text-[10px] text-concrete-500">리뷰 {x.ratingCount}개</div>
                </div>
              ))}
            </div>

            {/* 항목별 비교 */}
            <div className="warm-card p-3">
              <h3 className="text-sm font-bold text-concrete-900 mb-3">항목별 평점</h3>
              <div className="space-y-2">
                {([
                  ["소음", "ratingNoise"],
                  ["청결", "ratingClean"],
                  ["시설", "ratingFacility"],
                  ["관리", "ratingManagement"],
                  ["안전", "ratingSafety"],
                ] as const).map(([label, key]) => {
                  const va = ba[key] as number;
                  const vb = bb[key] as number;
                  const winner = va > vb ? "A" : va < vb ? "B" : "tie";
                  return (
                    <div key={label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-concrete-700">{label}</span>
                        {winner !== "tie" && (
                          <span className="text-[10px] text-warm-700 font-semibold">
                            {winner} 우세
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Bar value={va} highlight={winner === "A"} />
                        <Bar value={vb} highlight={winner === "B"} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 기본 정보 비교 */}
            <div className="warm-card p-3">
              <h3 className="text-sm font-bold text-concrete-900 mb-3">기본 정보</h3>
              <div className="space-y-2">
                <CompareRow
                  label="준공연도"
                  a={ba.builtYear ? `${ba.builtYear}년` : "-"}
                  b={bb.builtYear ? `${bb.builtYear}년` : "-"}
                />
                <CompareRow
                  label="총 세대수"
                  a={ba.totalUnits ? `${ba.totalUnits}세대` : "-"}
                  b={bb.totalUnits ? `${bb.totalUnits}세대` : "-"}
                />
                <CompareRow
                  label="층수"
                  a={ba.floors ? `${ba.floors}층` : "-"}
                  b={bb.floors ? `${bb.floors}층` : "-"}
                />
                <CompareRow
                  label="주차"
                  a={ba.parking ? "가능" : "불가"}
                  b={bb.parking ? "가능" : "불가"}
                />
                <CompareRow
                  label="시세 (보증금/월세)"
                  a={ba.priceDeposit ? `${ba.priceDeposit}/${ba.priceMonthly}` : "-"}
                  b={bb.priceDeposit ? `${bb.priceDeposit}/${bb.priceMonthly}` : "-"}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Link
                href={`/building/${ba.id}`}
                className="h-11 flex items-center justify-center text-sm font-semibold bg-warm-500 text-white rounded-soft"
              >
                A 자세히 보기
              </Link>
              <Link
                href={`/building/${bb.id}`}
                className="h-11 flex items-center justify-center text-sm font-semibold bg-ink-600 text-white rounded-soft"
              >
                B 자세히 보기
              </Link>
            </div>
          </>
        ) : (
          <EmptyState
            kind="empty"
            title="비교할 건물을 선택해주세요"
            description="두 건물 모두 선택하면 항목별 비교가 시작돼요."
          />
        )}
      </div>
    </div>
  );
}

function Bar({ value, highlight }: { value: number; highlight: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-concrete-100 rounded-pill overflow-hidden">
        <div
          className={`h-full ${highlight ? "bg-warm-500" : "bg-concrete-300"}`}
          style={{ width: `${(value / 5) * 100}%` }}
        />
      </div>
      <span className={`text-xs font-semibold w-6 text-right ${highlight ? "text-warm-700" : "text-concrete-500"}`}>
        {value.toFixed(1)}
      </span>
    </div>
  );
}

function CompareRow({ label, a, b }: { label: string; a: string; b: string }) {
  return (
    <div>
      <div className="text-[11px] text-concrete-500 mb-1">{label}</div>
      <div className="grid grid-cols-2 gap-2">
        <div className="text-sm font-semibold text-concrete-900 bg-warm-50 px-2 py-1.5 rounded text-center">
          {a}
        </div>
        <div className="text-sm font-semibold text-concrete-900 bg-ink-50 px-2 py-1.5 rounded text-center">
          {b}
        </div>
      </div>
    </div>
  );
}
