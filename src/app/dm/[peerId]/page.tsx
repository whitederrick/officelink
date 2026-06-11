"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getDMBetween,
  getUser,
  markThreadRead,
  sendDM,
  uid,
} from "@/lib/storage";
import { RoleBadge } from "@/components/Badges";
import type { DMMessage, User } from "@/types";
import { LoadingIntro } from "@/components/LoadingHouse";

function timeStr(ts: number) {
  const d = new Date(ts);
  return `${d.getHours().toString().padStart(2, "0")}:${d
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
}

export default function DMRoomPage() {
  const router = useRouter();
  const params = useParams<{ peerId: string }>();
  const peerId = decodeURIComponent(params.peerId);

  const [mounted, setMounted] = useState(false);
  const [me, setMe] = useState<User | null>(null);
  const [peer, setPeer] = useState<{ id: string; nickname: string; role: User["role"] } | null>(null);
  const [msgs, setMsgs] = useState<DMMessage[]>([]);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    setMounted(true);
    const u = getUser();
    if (!u) {
      router.replace("/onboarding");
      return;
    }
    setMe(u);

    // 기존 메시지에서 peer 정보 추출
    const existing = getDMBetween(u.id, peerId);
    let peerInfo = { id: peerId, nickname: peerId, role: "tenant" as User["role"] };
    if (existing.length > 0) {
      const last = existing[existing.length - 1];
      const isFromPeer = last.fromId === peerId;
      peerInfo = {
        id: peerId,
        nickname: isFromPeer ? last.fromNickname : last.toNickname,
        role: isFromPeer ? last.fromRole : last.toRole,
      };
    }
    setPeer(peerInfo);
    setMsgs(existing);
    markThreadRead(u.id, peerId);
  }, [router, peerId]);

  const send = () => {
    if (!me || !peer) return;
    if (!draft.trim()) return;
    const m: DMMessage = {
      id: uid(),
      fromId: me.id,
      fromNickname: me.nickname,
      fromRole: me.role,
      toId: peer.id,
      toNickname: peer.nickname,
      toRole: peer.role,
      content: draft.trim(),
      read: false,
      createdAt: Date.now(),
    };
    sendDM(m);
    setMsgs(getDMBetween(me.id, peer.id));
    setDraft("");
  };

  if (!mounted || !me || !peer) {
    return <LoadingIntro />;
  }

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <div className="sticky top-12 z-20 bg-white border-b border-gray-100 px-4 h-12 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-lg">‹</button>
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <span className="text-sm font-semibold truncate">{peer.nickname}</span>
          <RoleBadge role={peer.role} size="xs" />
        </div>
      </div>

      <div className="flex-1 px-4 py-3 space-y-2 overflow-y-auto" style={{ minHeight: 0 }}>
        {msgs.length === 0 ? (
          <div className="py-12 text-center text-xs text-gray-400">
            쪽지를 보내 대화를 시작해보세요.
          </div>
        ) : (
          msgs.map((m) => {
            const mine = m.fromId === me.id;
            return (
              <div
                key={m.id}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    mine
                      ? "bg-officelink-primary text-white rounded-br-sm"
                      : "bg-gray-100 text-gray-900 rounded-bl-sm"
                  }`}
                >
                  <div className="whitespace-pre-wrap break-words">{m.content}</div>
                  <div
                    className={`text-[10px] mt-0.5 ${
                      mine ? "text-blue-100" : "text-gray-400"
                    }`}
                  >
                    {timeStr(m.createdAt)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="sticky bottom-16 bg-white border-t border-gray-200">
        <div className="px-3 py-2 flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="쪽지를 입력하세요."
            className="flex-1 h-10 px-3 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-officelink-primary"
          />
          <button
            onClick={send}
            disabled={!draft.trim()}
            className={`h-10 px-4 text-sm rounded-full font-semibold ${
              draft.trim()
                ? "bg-officelink-primary text-white"
                : "bg-gray-100 text-gray-400"
            }`}
          >
            전송
          </button>
        </div>
      </div>
    </div>
  );
}
