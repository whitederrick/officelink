"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getGroupMessages, getGroupRoom, getUser, sendGroupMessage } from "@/lib/storage";
import { PageHeader } from "@/components/PageHeader";
import { LoadingIntro } from "@/components/LoadingHouse";
import { showToast } from "@/lib/toast";
import type { GroupMessage, GroupRoom, User } from "@/types";

function timeAgo(t: number) {
  const diff = Date.now() - t;
  if (diff < 60_000) return "방금";
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)}분 전`;
  if (diff < 86400_000) return `${Math.floor(diff / 3600_000)}시간 전`;
  return `${Math.floor(diff / 86400_000)}일 전`;
}

export default function GroupRoomPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [mounted, setMounted] = useState(false);
  const [room, setRoom] = useState<GroupRoom | null>(null);
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [me, setMe] = useState<User | null>(null);
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const u = getUser();
    if (!u) {
      router.replace("/onboarding");
      return;
    }
    setMe(u);
    const r = getGroupRoom(params.id);
    if (!r) {
      router.replace("/groups");
      return;
    }
    setRoom(r);
    setMessages(getGroupMessages(r.id));
  }, [router, params.id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  if (!mounted || !room || !me) return <LoadingIntro />;

  const onSend = () => {
    if (!text.trim()) return;
    const msg: GroupMessage = {
      id: "gm-" + Date.now(),
      roomId: room.id,
      authorId: me.id,
      authorNickname: me.nickname,
      authorRole: me.role,
      content: text.trim(),
      createdAt: Date.now(),
    };
    sendGroupMessage(msg);
    setMessages((m) => [...m, msg]);
    setText("");
  };

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <PageHeader
        title={room.name}
        subtitle={`👥 ${room.members.length}명`}
        back="history"
      />

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2" style={{ minHeight: "60vh" }}>
        {messages.length === 0 ? (
          <div className="text-center text-concrete-400 text-sm py-8">
            첫 메시지를 남겨보세요 👋
          </div>
        ) : (
          messages.map((m) => {
            const mine = m.authorId === me.id;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"} gap-2`}>
                {!mine && (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-warm-300 to-warm-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {m.authorNickname.charAt(0)}
                  </div>
                )}
                <div className={`max-w-[75%] ${mine ? "items-end" : "items-start"} flex flex-col`}>
                  {!mine && <div className="text-[10px] text-concrete-500 mb-0.5">{m.authorNickname}</div>}
                  <div
                    className={`px-3 py-2 rounded-2xl text-sm leading-relaxed break-words ${
                      mine
                        ? "bg-warm-500 text-white rounded-br-sm"
                        : "bg-concrete-100 text-concrete-900 rounded-bl-sm"
                    }`}
                  >
                    {m.content}
                  </div>
                  <div className="text-[10px] text-concrete-400 mt-0.5">{timeAgo(m.createdAt)}</div>
                </div>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      {/* 입력 바 */}
      <div className="border-t border-concrete-100 p-2 flex items-end gap-2 bg-white sticky bottom-0">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          placeholder="메시지 입력..."
          rows={1}
          className="flex-1 px-3 py-2 border border-concrete-200 rounded-pill text-sm resize-none focus:outline-none focus:border-warm-500"
        />
        <button
          onClick={onSend}
          disabled={!text.trim()}
          className="shrink-0 w-10 h-10 rounded-full bg-warm-500 text-white disabled:bg-concrete-200 flex items-center justify-center"
        >
          <span className="text-lg">↑</span>
        </button>
      </div>
    </div>
  );
}
