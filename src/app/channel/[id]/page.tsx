"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  getChannel,
  getPostsByChannel,
  getUser,
} from "@/lib/storage";
import { PostCard } from "@/components/PostCard";
import type { Channel } from "@/types";
import { LoadingIntro } from "@/components/LoadingHouse";

export default function ChannelPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [mounted, setMounted] = useState(false);
  const [channel, setChannel] = useState<Channel | null>(null);

  useEffect(() => {
    setMounted(true);
    if (!getUser()) {
      router.replace("/onboarding");
      return;
    }
    const c = getChannel(params.id);
    if (!c) {
      router.replace("/");
      return;
    }
    setChannel(c);
  }, [router, params.id]);

  const posts = useMemo(() => {
    if (!channel) return [];
    return getPostsByChannel(channel.id);
  }, [channel, mounted]);

  if (!mounted || !channel) {
    return <LoadingIntro />;
  }

  return (
    <div className="bg-white min-h-screen">
      {/* 헤더 */}
      <div className="sticky top-12 z-20 bg-white border-b border-gray-100 px-4 h-12 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-lg">‹</button>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold truncate">{channel.title}</div>
        </div>
        <Link
          href={`/write?channel=${channel.id}`}
          className="text-xs text-officelink-primary font-semibold"
        >
          글쓰기
        </Link>
      </div>

      {/* 채널 정보 */}
      <div className="px-4 py-4 bg-gradient-to-b from-blue-50 to-white border-b border-gray-100">
        <div className="text-base font-bold mb-1">{channel.title}</div>
        {channel.description && (
          <div className="text-xs text-gray-500 mb-2">{channel.description}</div>
        )}
        {channel.category && (
          <span className="inline-block text-[11px] px-2 py-0.5 bg-white border border-gray-200 rounded-full text-gray-600">
            #{channel.category}
          </span>
        )}
      </div>

      {/* 글 목록 */}
      {posts.length === 0 ? (
        <div className="p-12 text-center">
          <div className="text-3xl mb-2">📭</div>
          <div className="text-sm text-gray-500">아직 글이 없어요.</div>
          <Link
            href={`/write?channel=${channel.id}`}
            className="inline-block mt-3 text-xs text-officelink-primary font-semibold"
          >
            첫 글 작성하기 →
          </Link>
        </div>
      ) : (
        <div>
          {posts.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      )}
    </div>
  );
}
