"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  addReply,
  deleteReply,
  getBuilding,
  getProfileByName,
  getRepliesByBuilding,
  getReviews,
  getServices,
  getUser,
  hasLiked,
  likePostOnce,
  uid,
} from "@/lib/storage";
import { heroClass } from "@/lib/display";
import type { Building, Review, Service } from "@/types";
import { LoadingIntro } from "@/components/LoadingHouse";
import { BuildingPhoto } from "@/components/Illustrations";

function Star({ value, size = "md" }: { value: number; size?: "sm" | "md" | "lg" }) {
  const sz = size === "sm" ? "text-sm" : size === "lg" ? "text-2xl" : "text-base";
  return (
    <span className={`${sz} tracking-tight`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={i < Math.round(value) ? "text-warm-500" : "text-concrete-200"}
        >
          ★
        </span>
      ))}
    </span>
  );
}

const CATEGORY_LABEL: Record<keyof Review["ratings"], string> = {
  noise: "소음",
  clean: "청결",
  facility: "시설",
  management: "관리",
  safety: "안전",
};

export default function BuildingPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [mounted, setMounted] = useState(false);
  const [building, setBuilding] = useState<Building | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [replies, setReplies] = useState<import("@/types").ReviewReply[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [tab, setTab] = useState<"review" | "service" | "info">("review");
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [replyOpen, setReplyOpen] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    if (!getUser()) {
      router.replace("/onboarding");
      return;
    }
    const b = getBuilding(params.id);
    if (!b) {
      router.replace("/");
      return;
    }
    setBuilding(b);
    setReviews(getReviews(b.id));
    setReplies(getRepliesByBuilding(b.id));
    setServices(getServices().filter((s) => s.buildingIds?.includes(b.id) || s.sigungu === b.sigungu));
  }, [router, params.id]);

  const submitReply = (reviewId: string) => {
    if (!building) return;
    const text = (replyDrafts[reviewId] || "").trim();
    if (!text) return;
    // 가짜 임대인/관리소 사용자처럼 동작
    const authorKind = Math.random() < 0.5 ? "landlord" : "manager";
    const authorName = authorKind === "landlord" ? "김집주" : "상암오벨리스크 관리사무소";
    addReply({
      id: uid(),
      reviewId,
      buildingId: building.id,
      authorKind,
      authorName,
      content: text,
      createdAt: Date.now(),
    });
    setReplyDrafts({ ...replyDrafts, [reviewId]: "" });
    setReplyOpen(null);
    setReplies(getRepliesByBuilding(building.id));
  };

  if (!mounted || !building) {
    return <LoadingIntro />;
  }

  // 건물에 연결된 임대인/관리소 추정
  const landlord = getProfileByName("landlord", "김집주");
  const manager = getProfileByName("manager", "상암오벨리스크 관리사무소");

  return (
    <div className="bg-white min-h-screen">
      {/* 헤더 (히어로) */}
      <div className={`${heroClass.warm} px-4 pt-4 pb-5 border-b border-concrete-100`}>
        <button onClick={() => router.back()} className="text-lg mb-3 text-concrete-600">‹</button>

        <div className="flex items-start justify-between gap-2 mb-2">
          <h1 className="text-xl font-bold text-concrete-900 leading-tight">{building.name}</h1>
          <div className="text-right shrink-0">
            <div className="flex items-center gap-1 justify-end">
              <span className="text-2xl font-bold text-warm-600">{building.ratingAvg.toFixed(1)}</span>
              <span className="text-xs text-concrete-500">/ 5</span>
            </div>
            <div className="text-[11px] text-concrete-500">리뷰 {building.ratingCount}개</div>
          </div>
        </div>
        <div className="text-xs text-concrete-500 mb-3">📍 {building.address}</div>

        {/* 시세 */}
        {building.priceDeposit && building.priceMonthly && (
          <div className="warm-card p-3 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-concrete-500">최근 시세</div>
              <div className="text-sm font-semibold text-concrete-900 mt-0.5">
                보증금 {building.priceDeposit} / 월세 {building.priceMonthly}
              </div>
            </div>
            <Link
              href="/review/write"
              className="cta-primary h-9 px-4 text-sm rounded-pill flex items-center"
            >
              ✍️ 리뷰 쓰기
            </Link>
          </div>
        )}

        {/* 평점 요약 */}
        <div className="mt-3 warm-card p-3">
          <div className="grid grid-cols-5 gap-2 text-center">
            {(["noise", "clean", "facility", "management", "safety"] as const).map((k) => (
              <div key={k}>
                <div className="text-[11px] text-concrete-500 mb-0.5">
                  {CATEGORY_LABEL[k]}
                </div>
                <div className="text-sm font-bold text-warm-700">
                  {building[`rating${k.charAt(0).toUpperCase() + k.slice(1)}` as keyof Building] as number}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 운영자 정보 */}
      <div className="px-4 py-3 border-b border-concrete-100 grid grid-cols-2 gap-2">
        {landlord && (
          <Link
            href={`/landlord/${landlord.id}`}
            className="warm-card p-3 active:bg-ink-50"
          >
            <div className="text-[10px] text-concrete-500 mb-0.5">임대인</div>
            <div className="text-sm font-semibold">{landlord.name}</div>
            <div className="text-[11px] text-warm-700">⭐ {landlord.ratingAvg.toFixed(1)}</div>
          </Link>
        )}
        {manager && (
          <Link
            href={`/manager/${manager.id}`}
            className="warm-card p-3 active:bg-sage-50"
          >
            <div className="text-[10px] text-concrete-500 mb-0.5">관리소</div>
            <div className="text-sm font-semibold">{manager.name}</div>
            <div className="text-[11px] text-sage-700">⭐ {manager.ratingAvg.toFixed(1)}</div>
          </Link>
        )}
      </div>

      {/* 탭 */}
      <div className="sticky top-12 z-20 bg-white border-b border-concrete-100">
        <div className="flex">
          {([
            ["review", `리뷰 ${reviews.length}`],
            ["service", `편의 서비스 ${services.length}`],
            ["info", "건물 정보"],
          ] as const).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setTab(k as any)}
              className={`flex-1 h-11 text-sm border-b-2 ${
                tab === k
                  ? "border-warm-500 text-warm-700 font-semibold"
                  : "border-transparent text-concrete-500"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {tab === "review" && (
        <div>
          {reviews.length === 0 ? (
            <div className="p-12 text-center text-concrete-400 text-sm">
              첫 리뷰를 작성해 보세요.
            </div>
          ) : (
            <div className="divide-y divide-concrete-100">
              {reviews.map((r) => (
                <article key={r.id} className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-warm-300 to-warm-500 flex items-center justify-center text-white text-xs font-bold">
                      {r.authorNickname.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold">{r.authorNickname}</div>
                      <div className="text-[11px] text-concrete-500">
                        {r.likedAs} · {r.period} 거주
                      </div>
                    </div>
                    <Star value={r.rating} size="sm" />
                  </div>
                  <div className="text-[15px] font-bold text-concrete-900 mb-1">
                    {r.summary}
                  </div>
                  <div className="text-sm text-concrete-700 leading-relaxed mb-2">
                    {r.content}
                  </div>
                  {r.pros.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {r.pros.map((p) => (
                        <span key={p} className="text-[11px] px-2 py-0.5 bg-sage-50 text-sage-700 rounded-pill">
                          + {p}
                        </span>
                      ))}
                    </div>
                  )}
                  {r.cons.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {r.cons.map((p) => (
                        <span key={p} className="text-[11px] px-2 py-0.5 bg-coral-50 text-coral-600 rounded-pill">
                          - {p}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-[11px] text-concrete-500">
                    <span>#{r.category}</span>
                    <span>·</span>
                    <span>👍 {r.likes}</span>
                  </div>
                  {/* 답글 */}
                  {replies.filter((rp) => rp.reviewId === r.id).map((rp) => (
                    <div
                      key={rp.id}
                      className="mt-3 ml-3 pl-3 border-l-2 border-warm-200 bg-warm-50/40 rounded-r-soft p-3"
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-pill font-semibold ${
                          rp.authorKind === "manager" ? "bg-sage-100 text-sage-700" : "bg-ink-100 text-ink-700"
                        }`}>
                          {rp.authorKind === "manager" ? "관리소" : "임대인"} 공식
                        </span>
                        <span className="text-xs font-semibold text-concrete-900">{rp.authorName}</span>
                      </div>
                      <div className="text-xs text-concrete-700 leading-relaxed">{rp.content}</div>
                    </div>
                  ))}

                  {/* 답글 작성 폼 */}
                  {replyOpen === r.id ? (
                    <div className="mt-3 ml-3 p-3 bg-warm-50/30 border border-warm-200 rounded-soft">
                      <textarea
                        value={replyDrafts[r.id] || ""}
                        onChange={(e) => setReplyDrafts({ ...replyDrafts, [r.id]: e.target.value })}
                        rows={2}
                        placeholder="답글을 남겨주세요. (임대인/관리소 시점)"
                        className="w-full text-xs border border-concrete-200 rounded-soft p-2 bg-white focus:outline-none focus:border-warm-500 resize-none"
                      />
                      <div className="flex gap-1.5 mt-2 justify-end">
                        <button
                          onClick={() => setReplyOpen(null)}
                          className="h-7 px-3 text-xs text-concrete-600 active:bg-concrete-100 rounded"
                        >
                          취소
                        </button>
                        <button
                          onClick={() => submitReply(r.id)}
                          className="h-7 px-3 text-xs font-semibold bg-warm-500 text-white rounded active:bg-warm-600"
                        >
                          등록
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setReplyOpen(r.id)}
                      className="mt-2 ml-1 text-[11px] text-warm-700 font-semibold"
                    >
                      💬 답글 쓰기
                    </button>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "service" && (
        <div className="p-3 space-y-2">
          {services.length === 0 ? (
            <div className="p-12 text-center text-concrete-400 text-sm">
              등록된 서비스가 없어요.
            </div>
          ) : (
            services.map((s) => (
              <Link
                key={s.id}
                href={`/service/${s.id}`}
                className="warm-card p-3 flex items-center gap-3"
              >
                <div className="w-12 h-12 rounded-soft bg-warm-50 flex items-center justify-center text-2xl">
                  {s.category === "clean" && "🧹"}
                  {s.category === "move" && "🚛"}
                  {s.category === "as" && "🔧"}
                  {s.category === "delivery" && "📦"}
                  {s.category === "utility" && "📡"}
                  {s.category === "finance" && "💳"}
                  {s.category === "food" && "🍱"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 mb-0.5">
                    <span className="text-sm font-semibold truncate">{s.name}</span>
                    <span className="text-[11px] text-warm-700">⭐ {s.rating}</span>
                  </div>
                  <div className="text-[11px] text-concrete-500 truncate">{s.description}</div>
                  <div className="text-[11px] text-warm-700 font-semibold mt-0.5">
                    {s.price}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      )}

      {tab === "info" && (
        <div className="p-4 space-y-3">
          <div className="warm-card p-4">
            <h3 className="text-sm font-bold mb-3 text-concrete-900">기본 정보</h3>
            <dl className="text-sm">
              <Row label="준공연도" value={building.builtYear ? `${building.builtYear}년` : "-"} />
              <Row label="총 세대수" value={building.totalUnits ? `${building.totalUnits}세대` : "-"} />
              <Row label="층수" value={building.floors ? `${building.floors}층` : "-"} />
              <Row label="주차" value={building.parking ? "가능" : "불가"} />
            </dl>
          </div>
          {building.options && building.options.length > 0 && (
            <div className="warm-card p-4">
              <h3 className="text-sm font-bold mb-3 text-concrete-900">옵션</h3>
              <div className="flex flex-wrap gap-1.5">
                {building.options.map((o) => (
                  <span key={o} className="text-xs px-2.5 py-1 bg-concrete-100 text-concrete-700 rounded-pill">
                    {o}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="p-4">
        <Link
          href="/review/write"
          className="cta-primary w-full h-12 rounded-soft flex items-center justify-center text-sm"
        >
          ✍️ 이 건물 리뷰 쓰기
        </Link>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-concrete-100 last:border-0">
      <dt className="text-concrete-500 text-xs">{label}</dt>
      <dd className="text-concrete-900 font-medium">{value}</dd>
    </div>
  );
}
