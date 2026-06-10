"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getChannels, getPosts, getUser } from "@/lib/storage";
import { PostCard } from "@/components/PostCard";
import type { Post } from "@/types";
import { LoadingIntro } from "@/components/LoadingHouse";

const CATEGORIES = ["전체", "자유", "공동구매", "중고거래", "무료나눔", "소모임", "꿀팁", "민원", "질문"];

export default function FeedPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState<string>("전체");

  useEffect(() => {
    setMounted(true);
    if (!getUser()) router.replace("/onboarding");
  }, [router]);

  const posts = useMemo<Post[]>(() => {
    if (!mounted) return [];
    return getPosts().sort((a, b) => b.createdAt - a.createdAt);
  }, [mounted]);

  const channels = useMemo(() => {
    if (!mounted) return new Map<string, string>();
    return new Map(getChannels().map((c) => [c.id, c.title]));
  }, [mounted]);

  if (!mounted) {
    return <LoadingIntro />;
  }

  const filtered =
    active === "전체" ? posts : posts.filter((p) => p.category === active);

  return (
    <div className="bg-white">
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-lg font-bold mb-1">전체 피드</h1>
        <p className="text-xs text-gray-500">우리 동네 모든 채널의 최신 글</p>
      </div>

      {/* 카테고리 필터 */}
      <div className="sticky top-12 z-20 bg-white border-b border-gray-100">
        <div className="flex gap-1.5 overflow-x-auto px-4 py-2 no-scrollbar">
          {CATEGORIES.map((c) => {
            const isActive = active === c;
            return (
              <button
                key={c}
                onClick={() => setActive(c)}
                className={`shrink-0 px-3 h-7 text-xs rounded-full border ${
                  isActive
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

      {filtered.length === 0 ? (
        <div className="p-8 text-center text-gray-400 text-sm">
          이 카테고리에는 아직 글이 없어요.
        </div>
      ) : (
        <div className="-mx-0">
          {filtered.map((p) => (
            <PostCard
              key={p.id}
              post={p}
              channelTitle={channels.get(p.channelId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
