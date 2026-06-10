"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  addPost,
  getAddresses,
  getChannels,
  getUser,
  uid,
} from "@/lib/storage";
import { ensureChannelsForAddress } from "@/lib/channels";
import type { Post, PostCategory } from "@/types";
import { LoadingIntro } from "@/components/LoadingHouse";

const CATEGORIES: PostCategory[] = [
  "자유",
  "공동구매",
  "중고거래",
  "무료나눔",
  "소모임",
  "꿀팁",
  "민원",
  "질문",
];

export default function WritePage() {
  const router = useRouter();
  const sp = useSearchParams();
  const presetChannelId = sp.get("channel");

  const [mounted, setMounted] = useState(false);
  const [user, setU] = useState<ReturnType<typeof getUser>>(null);
  const [channels, setChannels] = useState<ReturnType<typeof getChannels>>([]);

  const [channelId, setChannelId] = useState<string>("");
  const [category, setCategory] = useState<PostCategory>("자유");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    setMounted(true);
    const u = getUser();
    if (!u) {
      router.replace("/onboarding");
      return;
    }
    setU(u);

    // 사용자가 가진 주소에 해당하는 채널 + 공용 채널
    const addrs = getAddresses(u.id);
    const ch = getChannels();
    const myScopes = new Set<string>();
    for (const a of addrs) {
      myScopes.add(`building:${a.detail}`);
      myScopes.add(`region:${a.sigungu}:${a.dong}`);
    }
    const filtered = ch
      .filter((c) => myScopes.has(c.scopeKey) || c.kind === "public")
      .sort((a, b) => a.title.localeCompare(b.title));
    setChannels(filtered);

    if (presetChannelId && ch.find((c) => c.id === presetChannelId)) {
      setChannelId(presetChannelId);
    } else if (filtered.length > 0) {
      setChannelId(filtered[0].id);
    }
  }, [router, presetChannelId]);

  const canSubmit = useMemo(
    () => title.trim().length > 0 && content.trim().length > 0 && !!channelId,
    [title, content, channelId],
  );

  const submit = () => {
    if (!user) return;
    if (!canSubmit) {
      alert("채널/제목/내용을 모두 입력해주세요.");
      return;
    }
    const post: Post = {
      id: uid(),
      channelId,
      authorId: user.id,
      authorNickname: user.nickname,
      authorRole: user.role,
      category,
      title: title.trim(),
      content: content.trim(),
      likes: 0,
      commentCount: 0,
      views: 0,
      createdAt: Date.now(),
    };
    addPost(post);
    router.push(`/post/${post.id}`);
  };

  if (!mounted || !user) {
    return <LoadingIntro />;
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="sticky top-12 z-20 bg-white border-b border-gray-100 px-4 h-12 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-600"
        >
          취소
        </button>
        <h1 className="text-sm font-semibold">글쓰기</h1>
        <button
          onClick={submit}
          disabled={!canSubmit}
          className={`text-sm font-semibold ${
            canSubmit ? "text-officelink-primary" : "text-gray-300"
          }`}
        >
          등록
        </button>
      </div>

      <div className="px-4 py-4 space-y-4">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">채널</label>
          <select
            value={channelId}
            onChange={(e) => setChannelId(e.target.value)}
            className="w-full h-11 px-3 border border-gray-300 rounded-lg text-sm bg-white"
          >
            {channels.length === 0 && (
              <option value="">주소를 먼저 등록해주세요</option>
            )}
            {channels.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">카테고리</label>
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            {CATEGORIES.map((c) => {
              const active = category === c;
              return (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`shrink-0 px-3 h-7 text-xs rounded-full border ${
                    active
                      ? "bg-officelink-primary text-white border-officelink-primary"
                      : "bg-white text-gray-600 border-gray-200"
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={60}
            placeholder="제목을 입력해주세요."
            className="w-full text-base font-semibold border-b border-gray-200 py-2 focus:outline-none focus:border-officelink-primary"
          />
        </div>

        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            placeholder={`익명으로 ${user.nickname}(으)로 작성돼요.\n우리 동네 사람들과 이야기를 나눠보세요.`}
            className="w-full text-sm leading-relaxed border border-gray-200 rounded-lg p-3 focus:outline-none focus:border-officelink-primary resize-none"
          />
        </div>

        <div className="text-[11px] text-gray-400">
          ※ 익명 커뮤니티입니다. 비방/욕설/개인정보 노출은 삼가주세요.
        </div>
      </div>
    </div>
  );
}
