"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  addPoll,
  getBuildings,
  getChannels,
  getPolls,
  getUser,
  uid,
  votePoll,
} from "@/lib/storage";
import { PageHeader } from "@/components/PageHeader";
import { LoadingIntro } from "@/components/LoadingHouse";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/Button";
import { showToast } from "@/lib/toast";
import type { Building, Channel, Poll } from "@/types";

export default function PollsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [showForm, setShowForm] = useState(false);

  // 폼
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [multiple, setMultiple] = useState(false);
  const [scope, setScope] = useState<"global" | "building" | "channel">("global");
  const [scopeId, setScopeId] = useState("");
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);

  const reload = () => setPolls(getPolls());

  useEffect(() => {
    setMounted(true);
    if (!getUser()) {
      router.replace("/onboarding");
      return;
    }
    setBuildings(getBuildings());
    setChannels(getChannels());
    reload();
  }, [router]);

  if (!mounted) return <LoadingIntro />;

  const submit = () => {
    if (!question.trim()) {
      showToast({ kind: "warning", title: "질문을 입력해주세요" });
      return;
    }
    const validOptions = options.map((o) => o.trim()).filter(Boolean);
    if (validOptions.length < 2) {
      showToast({ kind: "warning", title: "선택지를 2개 이상 입력해주세요" });
      return;
    }
    const me = getUser();
    if (!me) return;
    addPoll({
      id: uid(),
      question: question.trim(),
      options: validOptions.map((text) => ({ id: uid(), text, votes: 0 })),
      voters: [],
      multiple,
      buildingId: scope === "building" ? scopeId : undefined,
      channelId: scope === "channel" ? scopeId : undefined,
      createdAt: Date.now(),
    });
    setQuestion("");
    setOptions(["", ""]);
    setMultiple(false);
    setScope("global");
    setShowForm(false);
    reload();
    showToast({ kind: "success", title: "투표가 등록됐어요" });
  };

  const onVote = (poll: Poll, optionIds: string[]) => {
    const me = getUser();
    if (!me) return;
    const ok = votePoll(poll.id, optionIds, me.id);
    if (ok) {
      showToast({ kind: "success", title: "투표 완료!" });
      reload();
    } else {
      showToast({ kind: "warning", title: "이미 투표했어요" });
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <PageHeader
        title="익명 투표"
        subtitle="우리 동네 의견 모아보기"
        back="history"
        right={
          <button
            onClick={() => setShowForm(!showForm)}
            className="text-xs text-warm-700 font-semibold px-2"
          >
            {showForm ? "닫기" : "+ 만들기"}
          </button>
        }
      />

      {showForm && (
        <div className="p-4 border-b border-concrete-100 bg-warm-50/30 space-y-3">
          <div>
            <label className="text-xs font-semibold text-concrete-700 mb-1 block">질문</label>
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="예: 이 동네 가장 아쉬운 점이 뭐예요?"
              className="w-full h-11 px-3 border border-concrete-200 rounded-soft text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-concrete-700 mb-1 block">선택지</label>
            <div className="space-y-2">
              {options.map((opt, i) => (
                <div key={i} className="flex gap-1.5">
                  <input
                    value={opt}
                    onChange={(e) => {
                      const next = [...options];
                      next[i] = e.target.value;
                      setOptions(next);
                    }}
                    placeholder={`선택지 ${i + 1}`}
                    className="flex-1 h-10 px-3 border border-concrete-200 rounded-soft text-sm"
                  />
                  {options.length > 2 && (
                    <button
                      onClick={() => setOptions(options.filter((_, idx) => idx !== i))}
                      className="w-10 h-10 text-concrete-400"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              {options.length < 6 && (
                <button
                  onClick={() => setOptions([...options, ""])}
                  className="text-xs text-warm-700 font-semibold"
                >
                  + 선택지 추가
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-concrete-700 mb-1 block">범위</label>
            <div className="flex gap-1.5">
              {(["global", "building", "channel"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setScope(s)}
                  className={`flex-1 h-9 text-xs rounded-soft border ${
                    scope === s
                      ? "bg-warm-500 text-white border-warm-500"
                      : "bg-white text-concrete-600 border-concrete-200"
                  }`}
                >
                  {s === "global" ? "전체" : s === "building" ? "건물" : "채널"}
                </button>
              ))}
            </div>
            {scope === "building" && (
              <select
                value={scopeId}
                onChange={(e) => setScopeId(e.target.value)}
                className="w-full h-10 mt-2 px-3 border border-concrete-200 rounded-soft text-sm"
              >
                <option value="">건물 선택</option>
                {buildings.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            )}
            {scope === "channel" && (
              <select
                value={scopeId}
                onChange={(e) => setScopeId(e.target.value)}
                className="w-full h-10 mt-2 px-3 border border-concrete-200 rounded-soft text-sm"
              >
                <option value="">채널 선택</option>
                {channels.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            )}
          </div>

          <label className="flex items-center gap-2 text-xs text-concrete-700">
            <input type="checkbox" checked={multiple} onChange={(e) => setMultiple(e.target.checked)} />
            복수 선택 허용
          </label>

          <Button variant="primary" size="md" full onClick={submit}>
            📊 투표 만들기
          </Button>
        </div>
      )}

      <div className="p-3 space-y-3">
        {polls.length === 0 ? (
          <EmptyState
            kind="empty"
            title="아직 투표가 없어요"
            description="우리 동네 의견을 모아볼 수 있는 익명 투표예요."
            action={{ label: "투표 만들기", onClick: () => setShowForm(true) }}
          />
        ) : (
          polls.map((p) => <PollCard key={p.id} poll={p} onVote={onVote} />)
        )}
      </div>
    </div>
  );
}

function PollCard({ poll, onVote }: { poll: Poll; onVote: (p: Poll, optionIds: string[]) => void }) {
  const [mounted, setMounted] = useState(false);
  const [me, setMe] = useState<ReturnType<typeof getUser>>(null);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
    setMe(getUser());
  }, []);

  if (!mounted) return null;
  const voted = me ? poll.voters.includes(me.id) : false;
  const total = poll.options.reduce((s, o) => s + o.votes, 0);

  return (
    <div className="warm-card p-4">
      <h3 className="text-sm font-bold text-concrete-900 mb-3">{poll.question}</h3>
      <div className="space-y-1.5">
        {poll.options.map((opt) => {
          const pct = total === 0 ? 0 : (opt.votes / total) * 100;
          const isSelected = selected.includes(opt.id);
          if (voted) {
            return (
              <div key={opt.id} className="relative">
                <div
                  className="absolute inset-0 bg-warm-100 rounded-soft transition-all"
                  style={{ width: `${pct}%` }}
                />
                <div className="relative flex items-center justify-between p-2.5 text-sm">
                  <span className="font-medium text-concrete-900">{opt.text}</span>
                  <span className="text-xs text-concrete-600 font-semibold">
                    {opt.votes}표 ({pct.toFixed(0)}%)
                  </span>
                </div>
              </div>
            );
          }
          return (
            <button
              key={opt.id}
              onClick={() => {
                if (poll.multiple) {
                  setSelected(
                    isSelected
                      ? selected.filter((s) => s !== opt.id)
                      : [...selected, opt.id],
                  );
                } else {
                  setSelected([opt.id]);
                }
              }}
              className={`w-full p-2.5 text-left rounded-soft border-2 text-sm transition ${
                isSelected
                  ? "border-warm-500 bg-warm-50"
                  : "border-concrete-200 bg-white"
              }`}
            >
              <span className="font-medium">{opt.text}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-[11px] text-concrete-500">
          {voted ? `총 ${total}명 참여` : `${poll.multiple ? "복수 선택" : "단일 선택"}`}
        </span>
        {!voted && (
          <Button
            variant="primary"
            size="sm"
            disabled={selected.length === 0}
            onClick={() => onVote(poll, selected)}
          >
            투표
          </Button>
        )}
      </div>
    </div>
  );
}
