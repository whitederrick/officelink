"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getGroupRooms, getUser } from "@/lib/storage";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { LoadingIntro } from "@/components/LoadingHouse";
import { Button } from "@/components/Button";
import { showToast } from "@/lib/toast";
import type { GroupRoom } from "@/types";

export default function GroupsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [rooms, setRooms] = useState<GroupRoom[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🌐");
  const [desc, setDesc] = useState("");

  useEffect(() => {
    setMounted(true);
    if (!getUser()) {
      router.replace("/onboarding");
      return;
    }
    setRooms(getGroupRooms(getUser()!.id));
  }, [router]);

  if (!mounted) return <LoadingIntro />;

  const onCreate = () => {
    if (!name.trim()) {
      showToast({ kind: "warning", title: "방 이름을 입력해주세요" });
      return;
    }
    const id = "gr-" + Date.now();
    const room: GroupRoom = {
      id,
      name: `${emoji} ${name.trim()}`,
      description: desc.trim(),
      emoji,
      members: [getUser()!.id],
      createdAt: Date.now(),
      lastMessageAt: Date.now(),
      lastMessagePreview: "(새 방)",
    };
    const all = JSON.parse(localStorage.getItem("officelink:groups") || "[]");
    all.push(room);
    localStorage.setItem("officelink:groups", JSON.stringify(all));
    showToast({ kind: "success", title: "그룹 방 생성됨" });
    router.push(`/groups/${id}`);
  };

  return (
    <div className="bg-white min-h-screen">
      <PageHeader title="👥 그룹 채팅" back="history" right={
        <button onClick={() => setShowNew(!showNew)} className="text-sm text-warm-600 font-semibold">
          {showNew ? "취소" : "+ 새로"}
        </button>
      } />

      {showNew && (
        <div className="p-4 bg-warm-50 border-b border-warm-200 space-y-2">
          <div className="flex gap-2">
            <select value={emoji} onChange={(e) => setEmoji(e.target.value)} className="w-16 h-11 px-2 border border-concrete-200 rounded-soft text-2xl text-center">
              {["🌐","🍱","☕","🎮","📚","🏃","🎨","🎵","💼","🐶"].map((e) => <option key={e}>{e}</option>)}
            </select>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="방 이름"
              className="flex-1 h-11 px-3 border border-concrete-200 rounded-soft text-sm"
            />
          </div>
          <input
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="방 설명 (선택)"
            className="w-full h-10 px-3 border border-concrete-200 rounded-soft text-sm"
          />
          <Button variant="primary" size="md" full onClick={onCreate}>방 만들기</Button>
        </div>
      )}

      <div className="p-3">
        {rooms.length === 0 ? (
          <EmptyState kind="empty" title="참여 중인 그룹이 없어요" description="새 그룹을 만들거나 이웃에게 초대를 받아보세요." />
        ) : (
          <div className="space-y-2">
            {rooms.map((r) => (
              <button
                key={r.id}
                onClick={() => router.push(`/groups/${r.id}`)}
                className="w-full warm-card p-3 flex items-center gap-3 active:scale-[0.99] transition text-left"
              >
                <div className="w-12 h-12 rounded-soft bg-gradient-to-br from-warm-300 to-warm-500 flex items-center justify-center text-2xl shrink-0">
                  {r.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-concrete-900 truncate">{r.name}</div>
                  <div className="text-xs text-concrete-500 truncate">
                    {r.lastMessagePreview} · 멤버 {r.members.length}명
                  </div>
                </div>
                <div className="text-[10px] text-concrete-400 shrink-0">
                  {new Date(r.lastMessageAt).toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" })}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
