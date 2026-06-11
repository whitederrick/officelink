"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getChannels,
  getLikedPosts,
  getPosts,
  getUser,
} from "@/lib/storage";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { LoadingIntro } from "@/components/LoadingHouse";
import { PostCard } from "@/components/PostCard";
import type { Post } from "@/types";

export default function LikedPostsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [channelMap, setChannelMap] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    setMounted(true);
    if (!getUser()) {
      router.replace("/onboarding");
      return;
    }
    const ids = new Set(getLikedPosts());
    const all = getPosts().filter((p) => ids.has(p.id)).sort((a, b) => b.createdAt - a.createdAt);
    setPosts(all);
    setChannelMap(new Map(getChannels().map((c) => [c.id, c.title])));
  }, [router]);

  if (!mounted) return <LoadingIntro />;

  return (
    <div className="bg-white min-h-screen">
      <PageHeader title="좋아요한 글" back="history" />
      {posts.length === 0 ? (
        <EmptyState
          kind="empty"
          title="아직 좋아요한 글이 없어요"
          description="마음에 드는 글에 👍 를 눌러보세요. 여기에서 한 번에 볼 수 있어요."
          action={{ label: "피드 보기", href: "/feed" }}
        />
      ) : (
        <div>
          {posts.map((p) => (
            <PostCard key={p.id} post={p} channelTitle={channelMap.get(p.channelId)} />
          ))}
        </div>
      )}
    </div>
  );
}
