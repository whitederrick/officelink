"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { addEvent, getUser, uid } from "@/lib/storage";
import { PageHeader } from "@/components/PageHeader";
import { LoadingIntro } from "@/components/LoadingHouse";
import { Button } from "@/components/Button";
import { showToast } from "@/lib/toast";

export default function NewEventPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState<"meetup" | "party" | "sports" | "study" | "food" | "other">("meetup");
  const [location, setLocation] = useState("");
  const [startsAt, setStartsAt] = useState(() => {
    const d = new Date(Date.now() + 3 * 86400_000);
    return d.toISOString().slice(0, 16);
  });
  const [max, setMax] = useState(10);

  useEffect(() => {
    setMounted(true);
    if (!getUser()) {
      router.replace("/onboarding");
      return;
    }
  }, [router]);

  if (!mounted) return <LoadingIntro />;

  const submit = () => {
    if (!title.trim() || !location.trim() || !desc.trim()) {
      showToast({ kind: "warning", title: "필수 항목을 입력해주세요" });
      return;
    }
    addEvent({
      id: uid(),
      hostId: getUser()!.id,
      hostNickname: getUser()!.nickname,
      title: title.trim(),
      description: desc.trim(),
      category,
      location: location.trim(),
      startsAt: new Date(startsAt).getTime(),
      maxParticipants: max,
      participants: [],
      createdAt: Date.now(),
    });
    showToast({ kind: "success", title: "이벤트 생성됨" });
    router.push("/events");
  };

  return (
    <div className="bg-white min-h-screen">
      <PageHeader title="이벤트 만들기" back="history" />
      <div className="p-4 space-y-3">
        <div>
          <label className="text-xs font-semibold text-concrete-700 mb-2 block">제목</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="🌸 상암동 벚꽃 산책" className="w-full h-11 px-3 border border-concrete-200 rounded-soft text-sm" />
        </div>
        <div>
          <label className="text-xs font-semibold text-concrete-700 mb-2 block">설명</label>
          <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={4} className="w-full text-sm leading-relaxed border border-concrete-200 rounded-soft p-3 resize-none" />
        </div>
        <div>
          <label className="text-xs font-semibold text-concrete-700 mb-2 block">카테고리</label>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              ["meetup", "👋 만남"],
              ["party", "🎉 파티"],
              ["sports", "🏃 스포츠"],
              ["study", "📚 스터디"],
              ["food", "🍱 식사"],
              ["other", "✨ 기타"],
            ].map(([k, label]) => (
              <button
                key={k}
                type="button"
                onClick={() => setCategory(k as any)}
                className={`p-2 text-xs rounded-soft border ${
                  category === k ? "bg-warm-500 text-white border-warm-500" : "bg-white border-concrete-200 text-concrete-600"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-concrete-700 mb-2 block">장소</label>
          <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="DMC역 2번 출구 앞" className="w-full h-11 px-3 border border-concrete-200 rounded-soft text-sm" />
        </div>
        <div>
          <label className="text-xs font-semibold text-concrete-700 mb-2 block">일시</label>
          <input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} className="w-full h-11 px-3 border border-concrete-200 rounded-soft text-sm" />
        </div>
        <div>
          <label className="text-xs font-semibold text-concrete-700 mb-2 block">최대 인원</label>
          <input type="number" value={max} onChange={(e) => setMax(parseInt(e.target.value) || 1)} className="w-full h-11 px-3 border border-concrete-200 rounded-soft text-sm" />
        </div>
        <Button variant="primary" size="lg" full onClick={submit}>이벤트 만들기</Button>
      </div>
    </div>
  );
}
