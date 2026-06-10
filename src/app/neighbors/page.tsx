"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getBuilding, getUser, getAddresses, uid } from "@/lib/storage";
import { PageHeader } from "@/components/PageHeader";
import { LoadingIntro } from "@/components/LoadingHouse";
import { EmptyState } from "@/components/EmptyState";
import { showToast } from "@/lib/toast";
import { RoleBadge } from "@/components/Badges";
import type { Building, UserRole } from "@/types";

const NICKNAMES_BY_ROLE: Record<UserRole, string[]> = {
  tenant: ["새벽산책러", "분위기좋아", "조용한호수", "퇴근후맥주", "동네고양이집사", "혼자영화", "1인분요리사", "새벽형 인간"],
  landlord: ["김집주", "이월세", "월세왕", "안경잡이집주인", "오피스텔운영자"],
  manager: ["관리소직원", "AS센터", "엘베수리기사", "택배보관맨", "야간당직"],
};

function timeAgo(ts: number) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return "방금";
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}

export default function NeighborsPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const buildingId = sp.get("building") || "";
  const [mounted, setMounted] = useState(false);
  const [building, setBuilding] = useState<Building | null>(null);
  const [neighbors, setNeighbors] = useState<{ id: string; nickname: string; role: UserRole; lastActive: number }[]>([]);

  useEffect(() => {
    setMounted(true);
    if (!getUser()) {
      router.replace("/onboarding");
      return;
    }
    const b = getBuilding(buildingId);
    if (!b) {
      router.replace("/");
      return;
    }
    setBuilding(b);
    // 가짜 이웃 생성 (건물 + 역할별)
    const me = getUser();
    if (!me) return;
    const others: { id: string; nickname: string; role: UserRole; lastActive: number }[] = [];
    const roles: UserRole[] = ["tenant", "landlord", "manager"];
    for (let i = 0; i < 12; i++) {
      const r = roles[Math.floor(Math.random() * 3)];
      const nicks = NICKNAMES_BY_ROLE[r];
      others.push({
        id: uid(),
        nickname: nicks[Math.floor(Math.random() * nicks.length)],
        role: r,
        lastActive: Date.now() - Math.floor(Math.random() * 86400 * 7 * 1000),
      });
    }
    setNeighbors(others);
  }, [router, buildingId]);

  if (!mounted || !building) return <LoadingIntro />;

  const byRole = (role: UserRole) => neighbors.filter((n) => n.role === role);

  return (
    <div className="bg-white min-h-screen">
      <PageHeader
        title="주변 이웃"
        subtitle={`${building.name} · 익명 ${neighbors.length}명`}
        back="history"
      />

      <div className="p-4 space-y-4">
        <div className="warm-card p-4 bg-soft-gradient">
          <div className="text-sm font-bold text-concrete-900 mb-1">
            🏘 익명 이웃 목록
          </div>
          <div className="text-xs text-concrete-600">
            같은 건물/지역의 사람들이에요. 모두 익명 닉네임으로 표시돼요.
          </div>
        </div>

        {(["tenant", "landlord", "manager"] as UserRole[]).map((role) => {
          const list = byRole(role);
          if (list.length === 0) return null;
          return (
            <section key={role}>
              <h2 className="text-sm font-bold text-concrete-900 mb-2 flex items-center gap-2">
                <RoleBadge role={role} />
                <span>{list.length}명</span>
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {list.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => showToast({ kind: "info", title: `${n.nickname}에게 DM 보내기 (데모)` })}
                    className="warm-card p-3 flex items-center gap-2 text-left active:scale-95 transition"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-warm-300 to-warm-500 flex items-center justify-center text-white text-sm font-bold">
                      {n.nickname.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-concrete-900 truncate">
                        {n.nickname}
                      </div>
                      <div className="text-[10px] text-concrete-500">
                        {timeAgo(n.lastActive)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          );
        })}

        <div className="text-[11px] text-concrete-400 text-center py-2">
          ※ 모든 이웃은 익명 닉네임으로, 실제 사용자 정보는 공개되지 않아요.
        </div>
      </div>
    </div>
  );
}
