"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  addManagementFee,
  getBuildings,
  getManagementFees,
  getUser,
  uid,
} from "@/lib/storage";
import { canAccessRole, roleHome } from "@/lib/access";
import { PageHeader } from "@/components/PageHeader";
import { LoadingIntro } from "@/components/LoadingHouse";
import { Button } from "@/components/Button";
import { showToast } from "@/lib/toast";
import type { Building, ManagementFee } from "@/types";

export default function FeesPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [buildingId, setBuildingId] = useState("");
  const [unitNumber, setUnitNumber] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [base, setBase] = useState(120000);
  const [utilities, setUtilities] = useState(30000);
  const [fees, setFees] = useState<ManagementFee[]>([]);

  useEffect(() => {
    setMounted(true);
    const user = getUser();
    if (!user) {
      router.replace("/onboarding");
      return;
    }
    if (!canAccessRole(user.role, ["manager"])) {
      router.replace(roleHome(user.role));
      return;
    }
    const bs = getBuildings();
    setBuildings(bs);
    const qb = sp.get("building");
    if (qb && bs.find((b) => b.id === qb)) {
      setBuildingId(qb);
    } else if (bs.length > 0) {
      setBuildingId(bs[0].id);
    }
  }, [router, sp]);

  useEffect(() => {
    if (buildingId) setFees(getManagementFees(buildingId));
  }, [buildingId]);

  if (!mounted) return <LoadingIntro />;

  const total = base + utilities;

  const submit = () => {
    if (!buildingId) {
      showToast({ kind: "warning", title: "건물을 선택해주세요" });
      return;
    }
    addManagementFee({
      id: uid(),
      buildingId,
      unitNumber: unitNumber.trim() || undefined,
      year,
      month,
      base,
      utilities,
      total,
      paid: false,
      createdAt: Date.now(),
    });
    setFees(getManagementFees(buildingId));
    showToast({ kind: "success", title: "관리비 등록됨", description: `${total.toLocaleString()}원` });
  };

  return (
    <div className="bg-white min-h-screen">
      <PageHeader title="관리비 입력" back="history" />

      <div className="p-4 space-y-4">
        <div>
          <label className="text-xs font-semibold text-concrete-700 mb-2 block">건물</label>
          <select
            value={buildingId}
            onChange={(e) => setBuildingId(e.target.value)}
            className="w-full h-12 px-3 border border-concrete-200 rounded-soft text-sm bg-white focus:outline-none focus:border-warm-500"
          >
            {buildings.length === 0 && <option value="">건물이 없어요</option>}
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-concrete-700 mb-2 block">호수 (선택)</label>
          <input
            value={unitNumber}
            onChange={(e) => setUnitNumber(e.target.value)}
            placeholder="예: 803호"
            className="w-full h-12 px-3 border border-concrete-200 rounded-soft text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-semibold text-concrete-700 mb-2 block">연도</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value) || year)}
              className="w-full h-12 px-3 border border-concrete-200 rounded-soft text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-concrete-700 mb-2 block">월</label>
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="w-full h-12 px-3 border border-concrete-200 rounded-soft text-sm bg-white"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>{m}월</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-concrete-700 mb-2 block">기본 관리비 (원)</label>
          <input
            type="number"
            value={base}
            onChange={(e) => setBase(parseInt(e.target.value) || 0)}
            className="w-full h-12 px-3 border border-concrete-200 rounded-soft text-sm"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-concrete-700 mb-2 block">공과금 (원)</label>
          <input
            type="number"
            value={utilities}
            onChange={(e) => setUtilities(parseInt(e.target.value) || 0)}
            className="w-full h-12 px-3 border border-concrete-200 rounded-soft text-sm"
          />
        </div>

        <div className="warm-card p-4 bg-warm-50 border-warm-200">
          <div className="text-xs text-concrete-600 mb-1">이번 달 합계</div>
          <div className="text-2xl font-bold text-warm-700">{total.toLocaleString()}원</div>
        </div>

        <Button variant="primary" size="lg" full onClick={submit}>
          💾 등록
        </Button>

        {/* 이력 */}
        {fees.length > 0 && (
          <div className="pt-4 border-t border-concrete-100">
            <h2 className="text-sm font-bold text-concrete-900 mb-2">📋 최근 관리비</h2>
            <div className="space-y-2">
              {fees.slice(0, 6).map((f) => (
                <div key={f.id} className="warm-card p-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-concrete-900">
                      {f.year}.{String(f.month).padStart(2, "0")}
                      {f.unitNumber && ` · ${f.unitNumber}`}
                    </div>
                    <div className="text-[11px] text-concrete-500">
                      기본 {f.base.toLocaleString()} + 공과금 {f.utilities.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-warm-700">{f.total.toLocaleString()}원</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
