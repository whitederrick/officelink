"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  addASRequest,
  getAddresses,
  getBuildings,
  getProfileByName,
  getUser,
  uid,
} from "@/lib/storage";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { LoadingIntro } from "@/components/LoadingHouse";
import { Button, LinkButton } from "@/components/Button";
import type { Address, Building } from "@/types";

const AS_CATEGORIES = [
  { value: "보일러", emoji: "🔥", hint: "난방 안 됨, 온수 안 나옴" },
  { value: "도어락", emoji: "🔒", hint: "잠김/열림 이상, 배터리 교체" },
  { value: "싱크대/배수", emoji: "🚰", hint: "막힘, 누수" },
  { value: "창문/베란다", emoji: "🪟", hint: "닫힘 불량, 유리 파손" },
  { value: "에어컨", emoji: "❄️", hint: "냉방/제어 불량" },
  { value: "전기/조명", emoji: "💡", hint: "안 켜짐, 합선" },
  { value: "가스레인지", emoji: "🍳", hint: "점화 불량" },
  { value: "기타", emoji: "🛠", hint: "기타 수리 필요" },
];

const TIME_SLOTS = [
  "오늘 오전 (9-12시)",
  "오늘 오후 (12-18시)",
  "내일 오전 (9-12시)",
  "내일 오후 (12-18시)",
  "일정 조율 가능",
];

export default function ASRequestPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [user, setU] = useState<ReturnType<typeof getUser>>(null);

  const [addrs, setAddrs] = useState<Address[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [addrId, setAddrId] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [preferredAt, setPreferredAt] = useState(TIME_SLOTS[0]);
  const [phone, setPhone] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setMounted(true);
    const u = getUser();
    if (!u) {
      router.replace("/onboarding");
      return;
    }
    setU(u);
    const a = getAddresses(u.id);
    setAddrs(a);
    setBuildings(getBuildings());
    if (a.length > 0) {
      setAddrId(a[0].id);
    }
  }, [router]);

  const selectedAddr = useMemo(() => addrs.find((a) => a.id === addrId), [addrs, addrId]);
  const selectedBuilding = useMemo(
    () => (selectedAddr ? buildings.find((b) => b.name === selectedAddr.detail) : null),
    [selectedAddr, buildings],
  );
  const manager = useMemo(
    () => (selectedBuilding ? getProfileByName("manager", "상암오벨리스크 관리사무소") : null),
    [selectedBuilding],
  );

  const canNext = useMemo(() => {
    if (step === 1) return !!addrId;
    if (step === 2) return !!category && description.trim().length >= 5;
    return true;
  }, [step, addrId, category, description]);

  if (!mounted || !user) return <LoadingIntro />;

  if (addrs.length === 0) {
    return (
      <div className="bg-white min-h-screen">
        <PageHeader title="AS 신청" back="history" />
        <EmptyState
          kind="empty"
          emoji="🏠"
          title="먼저 주소를 등록해주세요"
          description="주소를 등록해야 관리사무소로 AS 신청을 보낼 수 있어요."
          action={{ label: "주소 등록하기", href: "/profile" }}
        />
      </div>
    );
  }

  const submit = () => {
    if (!selectedAddr || !selectedBuilding) return;
    addASRequest({
      id: uid(),
      userId: user.id,
      userNickname: user.nickname,
      buildingId: selectedBuilding.id,
      buildingName: selectedBuilding.name,
      managerName: manager?.name || "관리사무소",
      category,
      description: description.trim(),
      preferredAt,
      phone: phone.trim() || "010-0000-0000",
      status: "received",
      createdAt: Date.now(),
    });
    setDone(true);
  };

  if (done) {
    return (
      <div className="bg-white min-h-screen">
        <PageHeader title="AS 신청" back="none" />
        <div className="px-4 py-8">
          <EmptyState
            kind="success"
            title="신청이 접수되었어요!"
            description={`${manager?.name || "관리사무소"}로 전달되었어요. 빠른 시일 내에 연락드릴 거예요.`}
            action={{ label: "우리 집 대시보드로", href: "/home" }}
            secondary={{ label: "신청 내역 보기", href: "/home" }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <PageHeader
        title="AS 신청"
        subtitle={`${step}/3 단계`}
        back="history"
      />

      {/* 진행 표시 */}
      <div className="px-4 py-3 flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`flex-1 h-1 rounded-pill ${
              s <= step ? "bg-warm-500" : "bg-concrete-200"
            }`}
          />
        ))}
      </div>

      <div className="px-4 pb-4 space-y-4">
        {step === 1 && (
          <>
            <div>
              <h2 className="text-lg font-bold text-concrete-900 mb-1">
                어느 집이에요?
              </h2>
              <p className="text-xs text-concrete-500 mb-3">
                등록된 주소 중 AS가 필요한 곳을 골라주세요.
              </p>
            </div>
            <div className="space-y-2">
              {addrs.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setAddrId(a.id)}
                  className={`w-full p-4 text-left rounded-soft border-2 transition ${
                    addrId === a.id
                      ? "border-warm-500 bg-warm-50"
                      : "border-concrete-200 bg-white"
                  }`}
                >
                  <div className="text-sm font-semibold text-concrete-900">{a.label}</div>
                  <div className="text-xs text-concrete-500 mt-0.5">
                    {a.sido} {a.sigungu} {a.dong} · {a.detail}
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div>
              <h2 className="text-lg font-bold text-concrete-900 mb-1">
                어떤 문제가 있으세요?
              </h2>
              <p className="text-xs text-concrete-500 mb-3">
                항목을 선택하고 상황을 자세히 적어주세요.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-concrete-700 mb-2 block">항목 선택</label>
              <div className="grid grid-cols-2 gap-2">
                {AS_CATEGORIES.map((c) => {
                  const on = category === c.value;
                  return (
                    <button
                      key={c.value}
                      onClick={() => setCategory(c.value)}
                      className={`p-3 rounded-soft border-2 text-left transition ${
                        on
                          ? "border-warm-500 bg-warm-50"
                          : "border-concrete-200 bg-white"
                      }`}
                    >
                      <div className="text-2xl mb-1">{c.emoji}</div>
                      <div className="text-sm font-semibold text-concrete-900">{c.value}</div>
                      <div className="text-[10px] text-concrete-500 mt-0.5">{c.hint}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-concrete-700 mb-2 block">
                상세 설명 <span className="text-coral-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="예: 어제부터 화장실 온수가 안 나오기 시작했어요."
                className="w-full text-sm leading-relaxed border border-concrete-200 rounded-soft p-3 focus:outline-none focus:border-warm-500 resize-none"
              />
              <div className="text-[11px] text-concrete-400 text-right mt-1">
                {description.length}자
              </div>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div>
              <h2 className="text-lg font-bold text-concrete-900 mb-1">
                연락처와 시간
              </h2>
              <p className="text-xs text-concrete-500 mb-3">
                관리사무소가 연락드릴 수 있는 정보를 입력해주세요.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-concrete-700 mb-2 block">
                연락처
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="010-0000-0000"
                inputMode="tel"
                className="w-full h-12 px-3 border border-concrete-200 rounded-soft text-base focus:outline-none focus:border-warm-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-concrete-700 mb-2 block">
                방문 희망 시간
              </label>
              <div className="space-y-2">
                {TIME_SLOTS.map((t) => {
                  const on = preferredAt === t;
                  return (
                    <button
                      key={t}
                      onClick={() => setPreferredAt(t)}
                      className={`w-full p-3 text-left rounded-soft border-2 text-sm transition ${
                        on
                          ? "border-warm-500 bg-warm-50 text-concrete-900 font-semibold"
                          : "border-concrete-200 bg-white text-concrete-700"
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 요약 */}
            <div className="warm-card p-4 bg-sage-50/30 border-sage-200">
              <h3 className="text-sm font-bold text-concrete-900 mb-2">📋 신청 내용</h3>
              <dl className="text-sm space-y-1">
                <Row label="건물" value={selectedBuilding?.name || "-"} />
                <Row label="항목" value={category} />
                <Row label="상세" value={description || "-"} />
                <Row label="시간" value={preferredAt} />
              </dl>
            </div>
          </>
        )}
      </div>

      {/* 하단 버튼 */}
      <div className="sticky bottom-0 bg-white border-t border-concrete-200 p-4 flex gap-2">
        {step > 1 && (
          <Button variant="secondary" size="lg" onClick={() => setStep((s) => (s - 1) as any)}>
            이전
          </Button>
        )}
        {step < 3 ? (
          <Button
            variant="primary"
            size="lg"
            full
            disabled={!canNext}
            onClick={() => setStep((s) => (s + 1) as any)}
          >
            다음
          </Button>
        ) : (
          <Button variant="primary" size="lg" full onClick={submit}>
            신청하기
          </Button>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <dt className="text-concrete-500 text-xs shrink-0">{label}</dt>
      <dd className="text-concrete-900 font-medium text-right text-xs flex-1 min-w-0 break-words">
        {value}
      </dd>
    </div>
  );
}
