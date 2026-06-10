"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  addAddress,
  clearUser,
  getAddresses,
  getUser,
  removeAddress,
  resetAll,
  uid,
} from "@/lib/storage";
import { ensureChannelsForAddress } from "@/lib/channels";
import { RoleBadge } from "@/components/Badges";
import type { Address, UserRole } from "@/types";
import { LoadingIntro } from "@/components/LoadingHouse";

export default function ProfilePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [user, setU] = useState<ReturnType<typeof getUser>>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddr, setShowAddr] = useState(false);

  // 주소 추가 폼
  const [role, setRole] = useState<UserRole>("tenant");
  const [sido, setSido] = useState("서울특별시");
  const [sigungu, setSigungu] = useState("마포구");
  const [dong, setDong] = useState("상암동");
  const [detail, setDetail] = useState("");
  const [label, setLabel] = useState("");

  const reload = () => {
    const u = getUser();
    setU(u);
    setAddresses(getAddresses(u?.id));
  };

  useEffect(() => {
    setMounted(true);
    if (!getUser()) {
      router.replace("/onboarding");
      return;
    }
    reload();
  }, [router]);

  const onAdd = () => {
    if (!user) return;
    if (!detail.trim()) {
      alert("상세 주소(오피스텔/건물명)를 입력해주세요.");
      return;
    }
    const a: Address = {
      id: uid(),
      userId: user.id,
      role,
      sido: sido.trim(),
      sigungu: sigungu.trim(),
      dong: dong.trim(),
      detail: detail.trim(),
      label: label.trim() || (role === "tenant" ? "거주지" : role === "landlord" ? "임대지" : "관리지"),
      isPrimary: false,
      createdAt: Date.now(),
    };
    addAddress(a);
    ensureChannelsForAddress(a);
    setDetail("");
    setLabel("");
    reload();
  };

  const onDelete = (id: string) => {
    if (!confirm("이 주소를 삭제할까요? 해당 채널에서 자동 개설된 채널은 유지됩니다.")) return;
    removeAddress(id);
    reload();
  };

  const onReset = () => {
    if (!confirm("모든 데이터를 초기화하고 처음부터 시작할까요?")) return;
    resetAll();
    clearUser();
    router.replace("/onboarding");
  };

  if (!mounted || !user) {
    return <LoadingIntro />;
  }

  return (
    <div className="bg-white min-h-screen">
      {/* 프로필 카드 */}
      <div className="px-4 py-5 border-b border-gray-100 flex items-center gap-3">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center text-white text-xl font-bold">
          {user.nickname.charAt(0)}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold">{user.nickname}</span>
            <RoleBadge role={user.role} />
          </div>
          <div className="text-xs text-gray-500">익명 동네주민</div>
        </div>
      </div>

      {/* 내 활동 */}
      <section className="px-4 py-4 border-b border-gray-100">
        <h2 className="text-sm font-bold mb-3">내 활동</h2>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-3 border border-gray-200 rounded-xl">
            <div className="text-lg font-bold">{addresses.length}</div>
            <div className="text-[11px] text-gray-500">내 주소</div>
          </div>
          <div className="p-3 border border-gray-200 rounded-xl">
            <div className="text-lg font-bold">0</div>
            <div className="text-[11px] text-gray-500">작성 글</div>
          </div>
          <div className="p-3 border border-gray-200 rounded-xl">
            <div className="text-lg font-bold">0</div>
            <div className="text-[11px] text-gray-500">댓글</div>
          </div>
        </div>
      </section>

      {/* 주소 관리 */}
      <section className="px-4 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold">내 주소 / 채널</h2>
          <button
            onClick={() => setShowAddr((s) => !s)}
            className="text-xs text-officelink-primary font-semibold"
          >
            {showAddr ? "닫기" : "+ 추가"}
          </button>
        </div>

        {addresses.length === 0 ? (
          <div className="text-xs text-gray-400 py-3">등록된 주소가 없어요.</div>
        ) : (
          <div className="space-y-2">
            {addresses.map((a) => (
              <div
                key={a.id}
                className="p-3 border border-gray-200 rounded-xl flex items-center gap-2"
              >
                <RoleBadge role={a.role} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{a.label}</div>
                  <div className="text-[11px] text-gray-500 truncate">
                    {a.sido} {a.sigungu} {a.dong} · {a.detail}
                  </div>
                </div>
                <button
                  onClick={() => onDelete(a.id)}
                  className="text-[11px] text-gray-400"
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        )}

        {showAddr && (
          <div className="mt-4 p-3 border border-dashed border-gray-300 rounded-xl space-y-2">
            <div className="flex gap-1.5">
              {(["tenant", "landlord", "manager"] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`flex-1 h-8 text-xs rounded-full border ${
                    role === r
                      ? "bg-officelink-primary text-white border-officelink-primary"
                      : "bg-white text-gray-600 border-gray-200"
                  }`}
                >
                  {r === "tenant" ? "임차인" : r === "landlord" ? "임대인" : "관리인"}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                value={sido}
                onChange={(e) => setSido(e.target.value)}
                placeholder="시/도"
                className="h-9 px-2 border border-gray-200 rounded text-xs"
              />
              <input
                value={sigungu}
                onChange={(e) => setSigungu(e.target.value)}
                placeholder="시/군/구"
                className="h-9 px-2 border border-gray-200 rounded text-xs"
              />
              <input
                value={dong}
                onChange={(e) => setDong(e.target.value)}
                placeholder="동"
                className="h-9 px-2 border border-gray-200 rounded text-xs"
              />
              <input
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                placeholder="오피스텔/건물명"
                className="h-9 px-2 border border-gray-200 rounded text-xs"
              />
            </div>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="라벨 (선택, 예: 2번째 거주지)"
              className="w-full h-9 px-2 border border-gray-200 rounded text-xs"
            />
            <button
              onClick={onAdd}
              className="w-full h-9 bg-officelink-primary text-white text-sm font-semibold rounded-lg"
            >
              주소 추가
            </button>
          </div>
        )}
      </section>

      {/* 메뉴 */}
      <section className="px-4 py-4 border-b border-gray-100 space-y-1">
        <button
          onClick={() => router.push("/my-posts")}
          className="w-full flex items-center justify-between px-3 h-11 border border-gray-200 rounded-lg text-sm active:bg-gray-50"
        >
          <span>✍️ 내가 쓴 글</span>
          <span className="text-gray-400">›</span>
        </button>
        <button
          onClick={() => router.push("/my-reviews")}
          className="w-full flex items-center justify-between px-3 h-11 border border-gray-200 rounded-lg text-sm active:bg-gray-50"
        >
          <span>🏠 내가 쓴 리뷰</span>
          <span className="text-gray-400">›</span>
        </button>
        <button
          onClick={() => router.push("/bookmarks")}
          className="w-full flex items-center justify-between px-3 h-11 border border-gray-200 rounded-lg text-sm active:bg-gray-50"
        >
          <span>⭐ 저장한 글</span>
          <span className="text-gray-400">›</span>
        </button>
        <button
          onClick={() => router.push("/liked")}
          className="w-full flex items-center justify-between px-3 h-11 border border-gray-200 rounded-lg text-sm active:bg-gray-50"
        >
          <span>👍 좋아요한 글</span>
          <span className="text-gray-400">›</span>
        </button>
        <button
          onClick={() => router.push("/favorite")}
          className="w-full flex items-center justify-between px-3 h-11 border border-gray-200 rounded-lg text-sm active:bg-gray-50"
        >
          <span>🏘 관심 거주지</span>
          <span className="text-gray-400">›</span>
        </button>
        <button
          onClick={() => router.push("/notifications")}
          className="w-full flex items-center justify-between px-3 h-11 border border-gray-200 rounded-lg text-sm active:bg-gray-50"
        >
          <span>🔔 알림</span>
          <span className="text-gray-400">›</span>
        </button>
        <button
          onClick={() => router.push("/dm")}
          className="w-full flex items-center justify-between px-3 h-11 border border-gray-200 rounded-lg text-sm active:bg-gray-50"
        >
          <span>💬 쪽지함</span>
          <span className="text-gray-400">›</span>
        </button>
        <button
          onClick={() => router.push("/checklist")}
          className="w-full flex items-center justify-between px-3 h-11 border border-gray-200 rounded-lg text-sm active:bg-gray-50"
        >
          <span>📋 이사 체크리스트</span>
          <span className="text-gray-400">›</span>
        </button>
        <button
          onClick={() => router.push("/stats")}
          className="w-full flex items-center justify-between px-3 h-11 border border-gray-200 rounded-lg text-sm active:bg-gray-50"
        >
          <span>📊 내 활동 통계</span>
          <span className="text-gray-400">›</span>
        </button>
        <button
          onClick={() => router.push("/settings")}
          className="w-full flex items-center justify-between px-3 h-11 border border-gray-200 rounded-lg text-sm active:bg-gray-50"
        >
          <span>⚙️ 설정</span>
          <span className="text-gray-400">›</span>
        </button>
        <button
          onClick={() => router.push("/help")}
          className="w-full flex items-center justify-between px-3 h-11 border border-gray-200 rounded-lg text-sm active:bg-gray-50"
        >
          <span>❓ 도움말</span>
          <span className="text-gray-400">›</span>
        </button>
        <button
          onClick={() => router.push("/notices")}
          className="w-full flex items-center justify-between px-3 h-11 border border-gray-200 rounded-lg text-sm active:bg-gray-50"
        >
          <span>📢 공지사항</span>
          <span className="text-gray-400">›</span>
        </button>
      </section>

      {/* 설정 */}
      <section className="px-4 py-4 space-y-2">
        <button
          onClick={onReset}
          className="w-full h-11 border border-gray-200 rounded-lg text-sm text-gray-600"
        >
          🗑️ 모든 데이터 초기화
        </button>
        <div className="text-[11px] text-gray-400 text-center pt-2">
          OFFICELINK MVP · v0.1 · localStorage 기반
        </div>
      </section>
    </div>
  );
}
