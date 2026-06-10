"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getBookmarks, getChannels, getPosts, getUser } from "@/lib/storage";
import { PostCard } from "@/components/PostCard";
import type { Post } from "@/types";
import { LoadingIntro } from "@/components/LoadingHouse";

export default function BookmarksPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!getUser()) router.replace("/onboarding");
  }, [router]);

  const posts: Post[] = useMemo(() => {
    if (!mounted) return [];
    const ids = new Set(getBookmarks());
    return getPosts()
      .filter((p) => ids.has(p.id))
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [mounted]);

  const channels = useMemo(
    () => (mounted ? new Map(getChannels().map((c) => [c.id, c.title])) : new Map()),
    [mounted],
  );

  if (!mounted) {
    return <LoadingIntro />;
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="sticky top-12 z-20 bg-white border-b border-gray-100 px-4 h-12 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-lg">‹</button>
        <div className="text-sm font-semibold">저장한 글</div>
      </div>

      {posts.length === 0 ? (
        <div className="p-12 text-center">
          <div className="text-3xl mb-2">⭐</div>
          <div className="text-sm text-gray-500">아직 저장한 글이 없어요.</div>
          <div className="text-[11px] text-gray-400 mt-1">
            게시글의 ☆ 저장 버튼을 눌러보세요.
          </div>
        </div>
      ) : (
        <div>
          {posts.map((p) => (
            <PostCard key={p.id} post={p} channelTitle={channels.get(p.channelId)} />
          ))}
        </div>
      )}
    </div>
  );
}
