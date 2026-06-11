"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { addAddress, getUser, setUser, uid } from "@/lib/storage";
import { ensureChannelsForAddress } from "@/lib/channels";
import type { Address, UserRole } from "@/types";

const ROLE_OPTIONS: { value: UserRole; label: string; emoji: string; desc: string }[] = [
  { value: "tenant", label: "임차인", emoji: "🧑", desc: "오피스텔에 살아요" },
  { value: "landlord", label: "임대인", emoji: "🏢", desc: "건물/집을 빌려줘요" },
  { value: "manager", label: "관리인", emoji: "🔧", desc: "관리사무소에서 일해요" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [nickname, setNickname] = useState("");
  const [role, setRole] = useState<UserRole | null>(null);

  // 주소
  const [sido, setSido] = useState("서울특별시");
  const [sigungu, setSigungu] = useState("마포구");
  const [dong, setDong] = useState("상암동");
  const [detail, setDetail] = useState("상암오벨리스크 2차");

  useEffect(() => {
    const u = getUser();
    if (u) router.replace("/");
  }, [router]);

  const next = () => {
    if (step === 1) {
      if (nickname.trim().length < 2) {
        alert("닉네임은 2글자 이상 입력해주세요.");
        return;
      }
      if (!role) {
        alert("역할을 선택해주세요.");
        return;
      }
      setStep(2);
      return;
    }
    if (!detail.trim()) {
      alert("상세 주소(오피스텔명)를 입력해주세요.");
      return;
    }

    // 1) 유저 저장
    const user = {
      id: uid(),
      nickname: nickname.trim(),
      role: role!,
      createdAt: Date.now(),
    };
    setUser(user);

    // 2) 주소 저장
    const addr: Address = {
      id: uid(),
      userId: user.id,
      role: role!,
      sido: sido.trim(),
      sigungu: sigungu.trim(),
      dong: dong.trim(),
      detail: detail.trim(),
      label: "현재 활동지",
      isPrimary: true,
      createdAt: Date.now(),
    };
    addAddress(addr);

    // 3) 채널 자동 개설
    ensureChannelsForAddress(addr);

    router.push("/");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <div className="px-5 pt-10 pb-6">
        <div className="text-2xl font-bold tracking-tight mb-1">
          <span className="text-officelink-primary">OFFICE</span>
          <span className="text-officelink-dark">LINK</span>
        </div>
        <p className="text-sm text-gray-500">
          오피스텔 동네 익명 커뮤니티
        </p>
      </div>

      {step === 1 ? (
        <div className="px-5 space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-1">닉네임을 정해주세요</h2>
            <p className="text-xs text-gray-500 mb-3">
              다른 사람에게 보여지는 이름이에요. 익명으로 활동해요.
            </p>
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={12}
              placeholder="예: 조용한호수"
              className="w-full h-12 px-4 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-officelink-primary"
            />
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-1">어떤 역할이에요?</h2>
            <p className="text-xs text-gray-500 mb-3">
              역할에 따라 자동으로 맞는 채널이 개설돼요.
            </p>
            <div className="space-y-2">
              {ROLE_OPTIONS.map((r) => {
                const active = role === r.value;
                return (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border text-left transition ${
                      active
                        ? "border-officelink-primary bg-blue-50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <div className="text-2xl">{r.emoji}</div>
                    <div className="flex-1">
                      <div className="font-semibold">{r.label}</div>
                      <div className="text-xs text-gray-500">{r.desc}</div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 ${
                        active
                          ? "border-officelink-primary bg-officelink-primary"
                          : "border-gray-300"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={next}
            className="w-full h-12 bg-officelink-primary text-white font-semibold rounded-lg"
          >
            다음
          </button>

          <div className="text-center">
            <Link href="/" className="text-xs text-gray-400 underline">
              다음에 할게요
            </Link>
          </div>
        </div>
      ) : (
        <div className="px-5 space-y-5">
          <div>
            <h2 className="text-lg font-semibold mb-1">주소를 알려주세요</h2>
            <p className="text-xs text-gray-500 mb-3">
              같은 주소 사람들이 모이는 채널이 자동으로 만들어져요.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500">시/도</label>
                <input
                  value={sido}
                  onChange={(e) => setSido(e.target.value)}
                  className="mt-1 w-full h-11 px-3 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-500">시/군/구</label>
                  <input
                    value={sigungu}
                    onChange={(e) => setSigungu(e.target.value)}
                    className="mt-1 w-full h-11 px-3 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">동</label>
                  <input
                    value={dong}
                    onChange={(e) => setDong(e.target.value)}
                    className="mt-1 w-full h-11 px-3 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500">상세 주소 (오피스텔/건물명)</label>
                <input
                  value={detail}
                  onChange={(e) => setDetail(e.target.value)}
                  placeholder="예: 상암오벨리스크 2차"
                  className="mt-1 w-full h-11 px-3 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setStep(1)}
              className="flex-1 h-12 bg-gray-100 text-gray-700 font-semibold rounded-lg"
            >
              이전
            </button>
            <button
              onClick={next}
              className="flex-[2] h-12 bg-officelink-primary text-white font-semibold rounded-lg"
            >
              시작하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
