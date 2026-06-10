"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { addReport, getUser, uid } from "@/lib/storage";
import { PageHeader } from "@/components/PageHeader";
import { LoadingIntro } from "@/components/LoadingHouse";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import type { Report } from "@/types";

const REASONS = [
  { value: "abuse", label: "욕설/비방", emoji: "🤬" },
  { value: "spam", label: "스팸/광고", emoji: "📢" },
  { value: "false", label: "허위 정보", emoji: "❌" },
  { value: "privacy", label: "개인정보 노출", emoji: "🔒" },
  { value: "illegal", label: "불법/범죄", emoji: "🚨" },
  { value: "other", label: "기타", emoji: "✏️" },
];

export default function ReportPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [user, setU] = useState<ReturnType<typeof getUser>>(null);
  const [targetType, setTargetType] = useState<Report["targetType"]>("post");
  const [targetId, setTargetId] = useState("");
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setMounted(true);
    const u = getUser();
    if (!u) {
      router.replace("/onboarding");
      return;
    }
    setU(u);
    setTargetId(sp.get("id") || "");
    const tt = sp.get("type") as Report["targetType"];
    if (tt) setTargetType(tt);
  }, [router, sp]);

  if (!mounted || !user) return <LoadingIntro />;

  const submit = () => {
    if (!reason) {
      alert("신고 사유를 선택해주세요.");
      return;
    }
    addReport({
      id: uid(),
      reporterId: user.id,
      targetType,
      targetId: targetId || "unknown",
      reason: REASONS.find((r) => r.value === reason)?.label || reason,
      description: description.trim() || undefined,
      createdAt: Date.now(),
    });
    setDone(true);
  };

  if (done) {
    return (
      <div className="bg-white min-h-screen">
        <PageHeader title="신고" back="none" />
        <EmptyState
          kind="success"
          title="신고가 접수되었어요"
          description="검토 후 적절한 조치가 취해져요. 감사합니다."
          action={{ label: "돌아가기", href: "/" }}
        />
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <PageHeader title="신고하기" subtitle="부적절한 콘텐츠/사용자" back="history" />

      <div className="p-4 space-y-4">
        <div>
          <h2 className="text-base font-bold text-concrete-900 mb-1">
            무엇이 문제인가요?
          </h2>
          <p className="text-xs text-concrete-500">
            신고는 익명으로 처리되며, 24시간 내에 검토됩니다.
          </p>
        </div>

        <div>
          <label className="text-xs font-semibold text-concrete-700 mb-2 block">
            신고 대상
          </label>
          <div className="grid grid-cols-4 gap-2">
            {([
              ["post", "게시글"],
              ["comment", "댓글"],
              ["review", "리뷰"],
              ["user", "사용자"],
            ] as const).map(([k, label]) => (
              <button
                key={k}
                onClick={() => setTargetType(k)}
                className={`h-10 text-xs rounded-soft border ${
                  targetType === k
                    ? "bg-coral-500 text-white border-coral-500"
                    : "bg-white text-concrete-600 border-concrete-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-concrete-700 mb-2 block">
            사유 선택
          </label>
          <div className="grid grid-cols-2 gap-2">
            {REASONS.map((r) => {
              const on = reason === r.value;
              return (
                <button
                  key={r.value}
                  onClick={() => setReason(r.value)}
                  className={`p-3 rounded-soft border-2 text-left transition ${
                    on
                      ? "border-coral-500 bg-coral-50"
                      : "border-concrete-200 bg-white"
                  }`}
                >
                  <div className="text-2xl mb-1">{r.emoji}</div>
                  <div className="text-sm font-semibold text-concrete-900">{r.label}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-concrete-700 mb-2 block">
            추가 설명 (선택)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="구체적인 상황을 알려주시면 처리에 도움이 돼요."
            className="w-full text-sm leading-relaxed border border-concrete-200 rounded-soft p-3 focus:outline-none focus:border-coral-500 resize-none"
          />
        </div>
      </div>

      <div className="sticky bottom-0 bg-white border-t border-concrete-200 p-4">
        <Button
          variant="danger"
          size="lg"
          full
          disabled={!reason}
          onClick={submit}
        >
          신고 접수하기
        </Button>
      </div>
    </div>
  );
}
