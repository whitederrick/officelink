"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  addBuildingNotice,
  getASRequests,
  getBuildingNotices,
  getBuildings,
  getManagementFees,
  getProfileByName,
  getUser,
  uid,
  deleteBuildingNotice,
} from "@/lib/storage";
import { calcBuildingStats } from "@/lib/stats";
import { PageHeader } from "@/components/PageHeader";
import { LoadingIntro } from "@/components/LoadingHouse";
import { EmptyState } from "@/components/EmptyState";
import { Sparkline, StarBar } from "@/components/Charts";
import { showToast } from "@/lib/toast";
import type { ASRequest, Building, BuildingNotice, BuildingStats, ManagementFee } from "@/types";

export default function ManagerDashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [asList, setAsList] = useState<ASRequest[]>([]);
  const [statsMap, setStatsMap] = useState<Record<string, BuildingStats>>({});
  const [notices, setNotices] = useState<Record<string, BuildingNotice[]>>({});
  const [fees, setFees] = useState<Record<string, ManagementFee[]>>({});
  const [showNoticeForm, setShowNoticeForm] = useState<string | null>(null);

  // 공지 작성 폼
  const [nTitle, setNTitle] = useState("");
  const [nContent, setNContent] = useState("");
  const [nImportant, setNImportant] = useState(false);

  useEffect(() => {
    setMounted(true);
    const u = getUser();
    if (!u) {
      router.replace("/onboarding");
      return;
    }
    const profile = getProfileByName("manager", "상암오벨리스크 관리사무소");
    const owned = profile ? getBuildings().filter((b) => profile.buildingIds.includes(b.id)) : [];
    setBuildings(owned);

    setAsList(getASRequests());
    const sm: Record<string, BuildingStats> = {};
    const nm: Record<string, BuildingNotice[]> = {};
    const fm: Record<string, ManagementFee[]> = {};
    for (const b of owned) {
      sm[b.id] = calcBuildingStats(b.id);
      nm[b.id] = getBuildingNotices(b.id);
      fm[b.id] = getManagementFees(b.id);
    }
    setStatsMap(sm);
    setNotices(nm);
    setFees(fm);
  }, [router]);

  if (!mounted) return <LoadingIntro />;

  const pending = asList.filter((a) => a.status === "received");
  const inProgress = asList.filter((a) => a.status === "in_progress");
  const done = asList.filter((a) => a.status === "done");

  const submitNotice = (buildingId: string) => {
    if (!nTitle.trim() || !nContent.trim()) {
      showToast({ kind: "warning", title: "제목과 내용을 입력해주세요" });
      return;
    }
    addBuildingNotice({
      id: uid(),
      buildingId,
      authorId: "manager-1",
      authorName: "상암오벨리스크 관리사무소",
      title: nTitle.trim(),
      content: nContent.trim(),
      important: nImportant,
      createdAt: Date.now(),
    });
    setNotices({ ...notices, [buildingId]: getBuildingNotices(buildingId) });
    setShowNoticeForm(null);
    setNTitle("");
    setNContent("");
    setNImportant(false);
    showToast({ kind: "success", title: "공지 등록됨" });
  };

  return (
    <div className="bg-white min-h-screen senior-mode">
      <PageHeader title="관리소 대시보드" subtitle="민원·AS·공지 관리" back="history" />

      {/* AS 현황 */}
      <section className="p-4">
        <h2 className="text-base font-bold text-concrete-900 mb-3">🔧 AS 현황</h2>
        <div className="grid grid-cols-3 gap-2">
          <div className="warm-card p-4 text-center bg-warm-50 border-warm-200">
            <div className="text-2xl font-bold text-warm-700">{pending.length}</div>
            <div className="text-[11px] text-concrete-600 mt-1">접수 대기</div>
          </div>
          <div className="warm-card p-4 text-center bg-ink-50 border-ink-200">
            <div className="text-2xl font-bold text-ink-700">{inProgress.length}</div>
            <div className="text-[11px] text-concrete-600 mt-1">처리 중</div>
          </div>
          <div className="warm-card p-4 text-center bg-sage-50 border-sage-200">
            <div className="text-2xl font-bold text-sage-700">{done.length}</div>
            <div className="text-[11px] text-concrete-600 mt-1">완료</div>
          </div>
        </div>
      </section>

      {/* AS 목록 */}
      {asList.length > 0 && (
        <section className="px-4 pt-2">
          <h2 className="text-base font-bold text-concrete-900 mb-3">📋 최근 AS 신청</h2>
          <div className="space-y-2">
            {asList.slice(0, 5).map((a) => (
              <div key={a.id} className="warm-card p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-concrete-900">{a.category}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-pill font-semibold ${
                    a.status === "received" ? "bg-warm-50 text-warm-700" :
                    a.status === "in_progress" ? "bg-ink-50 text-ink-700" :
                    a.status === "done" ? "bg-sage-50 text-sage-700" :
                    "bg-coral-50 text-coral-600"
                  }`}>
                    {a.status === "received" ? "접수" : a.status === "in_progress" ? "처리중" : a.status === "done" ? "완료" : "보류"}
                  </span>
                </div>
                <div className="text-xs text-concrete-600 mb-1">{a.buildingName}</div>
                <div className="text-xs text-concrete-700 line-clamp-2">{a.description}</div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[11px] text-concrete-500">{a.userNickname} · {a.phone}</span>
                  <span className="text-[11px] text-concrete-500">{a.preferredAt}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 건물별 평판/통계 */}
      <section className="px-4 pt-4">
        <h2 className="text-base font-bold text-concrete-900 mb-3">🏢 관리 건물</h2>
        {buildings.length === 0 ? (
          <EmptyState kind="empty" title="관리 건물이 없어요" />
        ) : (
          <div className="space-y-3">
            {buildings.map((b) => {
              const s = statsMap[b.id];
              return (
                <div key={b.id} className="warm-card p-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <Link href={`/building/${b.id}`} className="flex-1 min-w-0">
                      <div className="text-base font-bold text-concrete-900">{b.name}</div>
                      <div className="text-[11px] text-concrete-500 truncate">{b.address}</div>
                    </Link>
                    <div className="text-right shrink-0">
                      <div className="text-2xl font-bold text-sage-600">{b.ratingAvg.toFixed(1)}</div>
                      <div className="text-[11px] text-concrete-500">리뷰 {b.ratingCount}</div>
                    </div>
                  </div>
                  {s && s.totalReviews > 0 && (
                    <div className="mb-3">
                      {s.ratingDistribution.slice().reverse().map((d) => (
                        <StarBar key={d.star} star={d.star} count={d.count} total={s.totalReviews} />
                      ))}
                    </div>
                  )}

                  {/* 공지사항 관리 */}
                  <div className="border-t border-concrete-100 pt-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-concrete-900">📢 공지사항</span>
                      <button
                        onClick={() => setShowNoticeForm(showNoticeForm === b.id ? null : b.id)}
                        className="text-[11px] text-warm-700 font-semibold"
                      >
                        {showNoticeForm === b.id ? "닫기" : "+ 작성"}
                      </button>
                    </div>

                    {showNoticeForm === b.id && (
                      <div className="mb-3 p-3 bg-warm-50/50 rounded-soft space-y-2">
                        <input
                          value={nTitle}
                          onChange={(e) => setNTitle(e.target.value)}
                          placeholder="공지 제목"
                          className="w-full h-10 px-3 border border-concrete-200 rounded-soft text-sm focus:outline-none focus:border-warm-500"
                        />
                        <textarea
                          value={nContent}
                          onChange={(e) => setNContent(e.target.value)}
                          rows={3}
                          placeholder="공지 내용"
                          className="w-full text-sm border border-concrete-200 rounded-soft p-2 focus:outline-none focus:border-warm-500 resize-none"
                        />
                        <label className="flex items-center gap-2 text-xs text-concrete-700">
                          <input
                            type="checkbox"
                            checked={nImportant}
                            onChange={(e) => setNImportant(e.target.checked)}
                            className="w-4 h-4"
                          />
                          중요 공지로 표시
                        </label>
                        <button
                          onClick={() => submitNotice(b.id)}
                          className="w-full h-9 text-sm font-semibold bg-warm-500 text-white rounded-soft"
                        >
                          공지 등록
                        </button>
                      </div>
                    )}

                    {(notices[b.id] || []).length === 0 ? (
                      <div className="text-[11px] text-concrete-400 py-2">아직 공지가 없어요.</div>
                    ) : (
                      <div className="space-y-1.5">
                        {notices[b.id].slice(0, 3).map((n) => (
                          <div key={n.id} className="p-2 bg-concrete-50 rounded">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              {n.important && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded-pill bg-coral-500 text-white font-semibold">
                                  중요
                                </span>
                              )}
                              <span className="text-xs font-semibold text-concrete-900 truncate flex-1">
                                {n.title}
                              </span>
                              <button
                                onClick={() => {
                                  if (!confirm("삭제할까요?")) return;
                                  deleteBuildingNotice(n.id);
                                  setNotices({ ...notices, [b.id]: getBuildingNotices(b.id) });
                                }}
                                className="text-[10px] text-concrete-400"
                              >
                                ✕
                              </button>
                            </div>
                            <div className="text-[10px] text-concrete-500 line-clamp-1">{n.content}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 관리비 입력 */}
                  <div className="border-t border-concrete-100 pt-3 mt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-concrete-900">💰 관리비</span>
                      <Link
                        href={`/fees?building=${b.id}`}
                        className="text-[11px] text-warm-700 font-semibold"
                      >
                        입력/조회 →
                      </Link>
                    </div>
                    {(fees[b.id] || []).length > 0 && (
                      <div className="text-[11px] text-concrete-500 mt-1">
                        최근: {fees[b.id][0].year}.{String(fees[b.id][0].month).padStart(2, "0")} · {fees[b.id][0].total.toLocaleString()}원
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
