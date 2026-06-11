"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getPosts, getReviews, getUser, getLikedPosts, getBookmarks } from "@/lib/storage";
import { PageHeader } from "@/components/PageHeader";
import { LoadingIntro } from "@/components/LoadingHouse";

interface Stats {
  posts: number;
  comments: number;
  reviews: number;
  likesReceived: number;
  likesGiven: number;
  bookmarks: number;
  topCategory: string | null;
  activeDays: number;
}

export default function StatsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    setMounted(true);
    const u = getUser();
    if (!u) {
      router.replace("/onboarding");
      return;
    }
    const posts = getPosts();
    const reviews = getReviews();
    const liked = getLikedPosts();
    const bookmarked = getBookmarks();
    const myPosts = posts.filter((p) => p.authorId === u.id);
    const myReviews = reviews.filter((r) => r.authorId === u.id);
    const totalComments = myPosts.reduce((s, p) => s + p.commentCount, 0);
    const likesReceived = myPosts.reduce((s, p) => s + p.likes, 0);
    const catCount: Record<string, number> = {};
    for (const p of myPosts) {
      catCount[p.category] = (catCount[p.category] || 0) + 1;
    }
    const topCategory = Object.entries(catCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
    const days = new Set(
      [...myPosts, ...myReviews].map((x) => new Date(x.createdAt).toDateString()),
    ).size;
    setStats({
      posts: myPosts.length,
      comments: totalComments,
      reviews: myReviews.length,
      likesReceived,
      likesGiven: liked.length,
      bookmarks: bookmarked.length,
      topCategory,
      activeDays: days,
    });
  }, [router]);

  if (!mounted || !stats) return <LoadingIntro />;

  const achievements = [
    { id: "first-post", emoji: "✍️", name: "첫 글", got: stats.posts > 0 },
    { id: "first-review", emoji: "🏠", name: "첫 리뷰", got: stats.reviews > 0 },
    { id: "social", emoji: "💬", name: "10개 댓글", got: stats.comments >= 10 },
    { id: "popular", emoji: "🔥", name: "좋아요 50+", got: stats.likesReceived >= 50 },
    { id: "collector", emoji: "⭐", name: "5개 저장", got: stats.bookmarks >= 5 },
    { id: "active", emoji: "📅", name: "7일 활동", got: stats.activeDays >= 7 },
  ];

  return (
    <div className="bg-white min-h-screen">
      <PageHeader title="내 활동 통계" subtitle="OFFICELINK에서의 발자취" back="history" />

      {/* 상단 카드 */}
      <div className="p-4">
        <div className="warm-card p-5 bg-soft-gradient">
          <div className="text-xs text-concrete-500 mb-1">활동 점수</div>
          <div className="text-3xl font-bold text-warm-600">
            {stats.posts * 10 + stats.reviews * 20 + stats.likesReceived + stats.comments * 2}
          </div>
          <div className="text-[11px] text-concrete-500 mt-1">
            {stats.activeDays}일 동안 활동
          </div>
        </div>
      </div>

      {/* 4개 지표 그리드 */}
      <section className="px-4">
        <div className="grid grid-cols-2 gap-2">
          <Metric emoji="✍️" label="작성한 글" value={stats.posts} />
          <Metric emoji="🏠" label="작성한 리뷰" value={stats.reviews} />
          <Metric emoji="💬" label="받은 댓글" value={stats.comments} />
          <Metric emoji="👍" label="받은 좋아요" value={stats.likesReceived} highlight />
        </div>
      </section>

      {/* 상세 */}
      <section className="px-4 pt-4">
        <h2 className="text-sm font-bold text-concrete-900 mb-2">📊 상세</h2>
        <div className="warm-card divide-y divide-concrete-100">
          <Row label="좋아요 누른 글" value={stats.likesGiven} />
          <Row label="저장한 글" value={stats.bookmarks} />
          {stats.topCategory && <Row label="가장 많이 쓴 카테고리" value={stats.topCategory} />}
          <Row label="활동한 날 수" value={`${stats.activeDays}일`} />
        </div>
      </section>

      {/* 업적 */}
      <section className="px-4 pt-4 pb-6">
        <h2 className="text-sm font-bold text-concrete-900 mb-2">🏆 업적</h2>
        <div className="grid grid-cols-3 gap-2">
          {achievements.map((a) => (
            <div
              key={a.id}
              className={`warm-card p-3 text-center transition ${
                a.got ? "bg-warm-50 border-warm-200" : "opacity-40"
              }`}
            >
              <div className="text-3xl mb-1">{a.emoji}</div>
              <div className="text-[11px] font-semibold text-concrete-900">{a.name}</div>
              <div className="text-[10px] text-concrete-500 mt-0.5">
                {a.got ? "달성!" : "미달성"}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Metric({ emoji, label, value, highlight }: { emoji: string; label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`warm-card p-4 ${highlight ? "bg-warm-50 border-warm-200" : ""}`}>
      <div className="text-2xl mb-1">{emoji}</div>
      <div className={`text-2xl font-bold ${highlight ? "text-warm-600" : "text-concrete-900"}`}>{value}</div>
      <div className="text-[11px] text-concrete-500 mt-0.5">{label}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="p-3 flex items-center justify-between">
      <span className="text-sm text-concrete-700">{label}</span>
      <span className="text-sm font-semibold text-concrete-900">{value}</span>
    </div>
  );
}
