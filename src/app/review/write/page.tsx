"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  addReview,
  getBuildings,
  getUser,
  uid,
} from "@/lib/storage";
import type { Building, Review, ReviewCategory } from "@/types";
import { LoadingIntro } from "@/components/LoadingHouse";

const CATEGORIES: ReviewCategory[] = [
  "소음", "청결", "시설", "관리", "주차", "채광", "구조", "동네",
];

const PROS_TAGS = [
  "깨끗함", "조용함", "보안 우수", "주변시설", "역세권", "신축", "구조 좋음", "수납 좋음",
  "채광 좋음", "친절", "응답 빠름", "저렴", "1인가구 최적", "상권 좋음", "관리 잘됨",
];
const CONS_TAGS = [
  "주차 부족", "소음", "엘리베이터 느림", "옛 느낌", "좁은 평면", "보증금 부담",
  "여름 더움", "겨울 추움", "관리소 응답 느림", "AS 지연", "채광 부족", "시끄러운 동네",
];

function Rating({ value, onChange, size = "lg" }: { value: number; onChange: (v: number) => void; size?: "sm" | "md" | "lg" }) {
  const cls = size === "lg" ? "text-3xl" : size === "md" ? "text-2xl" : "text-base";
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          className={`${cls} leading-none transition active:scale-110 ${
            i <= value ? "text-warm-500" : "text-concrete-200"
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function ReviewWritePage() {
  const router = useRouter();
  const sp = useSearchParams();
  const presetBuilding = sp.get("building");

  const [mounted, setMounted] = useState(false);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [buildingId, setBuildingId] = useState("");

  const [rating, setRating] = useState(4);
  const [ratings, setRatings] = useState<Review["ratings"]>({
    noise: 4, clean: 4, facility: 4, management: 4, safety: 4,
  });
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<ReviewCategory>("시설");
  const [likedAs, setLikedAs] = useState("1인가구");
  const [period, setPeriod] = useState("6개월");
  const [pros, setPros] = useState<string[]>([]);
  const [cons, setCons] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
    if (!getUser()) {
      router.replace("/onboarding");
      return;
    }
    const bs = getBuildings();
    setBuildings(bs);
    if (presetBuilding && bs.find((b) => b.id === presetBuilding)) {
      setBuildingId(presetBuilding);
    } else if (bs.length > 0) {
      setBuildingId(bs[0].id);
    }
  }, [router, presetBuilding]);

  const toggle = (arr: string[], v: string) =>
    arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

  const canSubmit = useMemo(
    () => buildingId && summary.trim().length >= 5 && content.trim().length >= 20,
    [buildingId, summary, content],
  );

  const submit = () => {
    if (!canSubmit) {
      alert("건물을 선택하고, 한줄평(5자 이상)과 상세리뷰(20자 이상)를 입력해주세요.");
      return;
    }
    const u = getUser();
    if (!u) return;
    addReview({
      id: uid(),
      buildingId,
      authorId: u.id,
      authorNickname: u.nickname,
      authorRole: u.role,
      rating,
      ratings,
      summary: summary.trim(),
      content: content.trim(),
      pros,
      cons,
      category,
      likedAs,
      period,
      likes: 0,
      createdAt: Date.now(),
    });
    router.push(`/building/${buildingId}`);
  };

  if (!mounted) {
    return <LoadingIntro />;
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="sticky top-12 z-20 bg-white border-b border-concrete-100 px-4 h-12 flex items-center justify-between">
        <button onClick={() => router.back()} className="text-sm text-concrete-600">
          취소
        </button>
        <h1 className="text-sm font-semibold">리뷰 작성</h1>
        <button
          onClick={submit}
          disabled={!canSubmit}
          className={`text-sm font-semibold ${
            canSubmit ? "text-warm-600" : "text-concrete-300"
          }`}
        >
          등록
        </button>
      </div>

      <div className="px-4 py-4 space-y-5">
        {/* 건물 선택 */}
        <div>
          <label className="text-xs font-semibold text-concrete-700 mb-2 block">어떤 건물인가요?</label>
          <select
            value={buildingId}
            onChange={(e) => setBuildingId(e.target.value)}
            className="w-full h-11 px-3 border border-concrete-200 rounded-soft text-sm bg-white focus:outline-none focus:border-warm-500"
          >
            {buildings.length === 0 && <option value="">건물이 없어요</option>}
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        {/* 전체 별점 */}
        <div className="warm-card p-4">
          <label className="text-xs font-semibold text-concrete-700 mb-2 block">전체 만족도</label>
          <div className="flex items-center gap-3">
            <Rating value={rating} onChange={setRating} />
            <span className="text-sm text-concrete-500">{rating} / 5</span>
          </div>
        </div>

        {/* 카테고리별 별점 */}
        <div className="warm-card p-4">
          <label className="text-xs font-semibold text-concrete-700 mb-3 block">항목별 평가</label>
          <div className="space-y-2">
            {([
              ["noise", "소음"],
              ["clean", "청결"],
              ["facility", "시설"],
              ["management", "관리"],
              ["safety", "안전"],
            ] as const).map(([k, label]) => (
              <div key={k} className="flex items-center justify-between">
                <span className="text-sm text-concrete-700 w-14">{label}</span>
                <Rating
                  value={ratings[k]}
                  onChange={(v) => setRatings({ ...ratings, [k]: v })}
                  size="sm"
                />
              </div>
            ))}
          </div>
        </div>

        {/* 한줄평 */}
        <div>
          <label className="text-xs font-semibold text-concrete-700 mb-2 block">
            한줄평 <span className="text-coral-500">*</span>
          </label>
          <input
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            maxLength={40}
            placeholder="예: 1인 가구 최적, 깨끗하고 관리 잘됨"
            className="w-full h-11 px-3 border border-concrete-200 rounded-soft text-sm focus:outline-none focus:border-warm-500"
          />
          <div className="text-[11px] text-concrete-400 text-right mt-1">{summary.length}/40</div>
        </div>

        {/* 상세 리뷰 */}
        <div>
          <label className="text-xs font-semibold text-concrete-700 mb-2 block">
            상세 리뷰 <span className="text-coral-500">*</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            placeholder="실거주 경험을 바탕으로 구체적으로 적어주시면 도움이 많이 돼요."
            className="w-full text-sm leading-relaxed border border-concrete-200 rounded-soft p-3 focus:outline-none focus:border-warm-500 resize-none"
          />
          <div className="text-[11px] text-concrete-400 text-right mt-1">{content.length}자</div>
        </div>

        {/* 장점/단점 태그 */}
        <div>
          <label className="text-xs font-semibold text-concrete-700 mb-2 block">👍 좋았던 점</label>
          <div className="flex flex-wrap gap-1.5">
            {PROS_TAGS.map((t) => {
              const on = pros.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setPros(toggle(pros, t))}
                  className={`text-xs px-3 h-7 rounded-pill border transition ${
                    on
                      ? "bg-sage-500 text-white border-sage-500"
                      : "bg-white text-concrete-600 border-concrete-200"
                  }`}
                >
                  {on ? "✓ " : ""}{t}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-concrete-700 mb-2 block">👎 아쉬운 점</label>
          <div className="flex flex-wrap gap-1.5">
            {CONS_TAGS.map((t) => {
              const on = cons.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setCons(toggle(cons, t))}
                  className={`text-xs px-3 h-7 rounded-pill border transition ${
                    on
                      ? "bg-coral-500 text-white border-coral-500"
                      : "bg-white text-concrete-600 border-concrete-200"
                  }`}
                >
                  {on ? "✓ " : ""}{t}
                </button>
              );
            })}
          </div>
        </div>

        {/* 메타 */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-semibold text-concrete-700 mb-2 block">어떤 가구?</label>
            <select
              value={likedAs}
              onChange={(e) => setLikedAs(e.target.value)}
              className="w-full h-10 px-3 border border-concrete-200 rounded-soft text-sm bg-white"
            >
              {["1인가구", "커플", "재택근무", "직장인", "학생"].map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-concrete-700 mb-2 block">거주 기간</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full h-10 px-3 border border-concrete-200 rounded-soft text-sm bg-white"
            >
              {["3개월", "6개월", "1년", "1년 6개월", "2년", "2년 이상"].map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-concrete-700 mb-2 block">카테고리</label>
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            {CATEGORIES.map((c) => {
              const on = category === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`shrink-0 px-3 h-7 text-xs rounded-pill border ${
                    on
                      ? "bg-ink-600 text-white border-ink-600"
                      : "bg-white text-concrete-600 border-concrete-200"
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>

        <div className="text-[11px] text-concrete-400 pt-2">
          ※ 익명으로 등록되며, 허위/비방성 리뷰는 관리자에 의해 삭제될 수 있어요.
        </div>
      </div>
    </div>
  );
}
