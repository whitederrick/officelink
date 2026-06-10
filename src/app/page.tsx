"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getAddresses,
  getBuildings,
  getChannels,
  getPosts,
  getUser,
} from "@/lib/storage";
import { PostCard } from "@/components/PostCard";
import { RoleBadge } from "@/components/Badges";
import type { Channel, Post, UserRole } from "@/types";
import { LoadingIntro } from "@/components/LoadingHouse";

const PUBLIC_KINDS: Channel["kind"][] = ["public"];

export default function HomePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!getUser()) router.replace("/onboarding");
  }, [router]);

  const data = useMemo(() => {
    if (!mounted) return null;
    const user = getUser();
    if (!user) return null;

    const addresses = getAddresses(user.id);
    const allChannels = getChannels();
    const allPosts = getPosts();
    const allBuildings = getBuildings();
    const hotBuildings = allBuildings
      .filter((b: any) => b.ratingCount > 0)
      .sort((a: any, b: any) => b.ratingAvg - a.ratingAvg)
      .slice(0, 3);

    // 내 채널 (오피스텔 + 지역) — 사용자가 가진 주소의 scope
    const myScopes = new Set<string>();
    for (const a of addresses) {
      myScopes.add(`building:${a.detail}`);
      myScopes.add(`region:${a.sigungu}:${a.dong}`);
    }
    const myChannels = allChannels.filter((c) => myScopes.has(c.scopeKey));

    // 공용 채널
    const publicChannels = allChannels.filter((c) => c.kind === "public");

    // 인기 글 (likes + comment*2 + views 가중치, 최근 30일)
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const hot = [...allPosts]
      .filter((p) => p.createdAt >= cutoff)
      .sort((a, b) => {
        const sa = a.likes + a.commentCount * 2 + a.views * 0.1;
        const sb = b.likes + b.commentCount * 2 + b.views * 0.1;
        return sb - sa;
      })
      .slice(0, 5);

    return { user, myChannels, publicChannels, hot, allChannels, allBuildings, hotBuildings };
  }, [mounted]);

  if (!mounted || !data) {
    return <LoadingIntro />;
  }

  const { user, myChannels, publicChannels, hot, allChannels, hotBuildings } = data;
  const channelMap = new Map(allChannels.map((c) => [c.id, c]));

  return (
    <div className="bg-white">
      {/* 인사 */}
      <div className="px-4 pt-4 pb-3 bg-gradient-to-b from-blue-50 to-white">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-base font-semibold">
            안녕하세요, {user.nickname}님
          </span>
          <RoleBadge role={user.role} />
        </div>
        <p className="text-xs text-gray-500">오늘 우리 동네는 어떤 소식이 있을까요?</p>
      </div>

      {/* 검색 바 */}
      <Link
        href="/search"
        className="mx-4 mt-3 flex items-center gap-2 h-10 px-3 bg-concrete-100 rounded-pill text-sm text-concrete-500"
      >
        <span>🔍</span>
        <span>건물·리뷰·서비스를 검색해 보세요</span>
      </Link>

      {/* 인기 건물 */}
      {hotBuildings && hotBuildings.length > 0 && (
        <section className="px-4 pt-4">
          <div className="flex items-baseline justify-between mb-2">
            <h2 className="text-sm font-bold text-concrete-900">🏢 인기 건물</h2>
            <Link href="/buildings" className="text-[11px] text-warm-700 font-semibold">
              전체 보기 ›
            </Link>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
            {hotBuildings.map((b) => (
              <Link
                key={b.id}
                href={`/building/${b.id}`}
                className="warm-card p-3 shrink-0 w-44 active:scale-95 transition"
              >
                <div className="text-[10px] text-concrete-500 mb-0.5 truncate">{b.sigungu} {b.dong}</div>
                <div className="text-sm font-bold text-concrete-900 line-clamp-2 leading-tight mb-1">{b.name}</div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-warm-600">{b.ratingAvg.toFixed(1)}</span>
                  <span className="text-[10px] text-concrete-500">리뷰 {b.ratingCount}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 빠른 메뉴 (건물/리뷰/서비스) */}
      <section className="px-4 pt-3">
        <div className="grid grid-cols-3 gap-2">
          <Link
            href="/buildings"
            className="warm-card p-3 flex flex-col items-center text-center"
          >
            <div className="text-2xl mb-1">🏢</div>
            <div className="text-xs font-semibold text-concrete-900">건물</div>
            <div className="text-[10px] text-concrete-500">리뷰·평점</div>
          </Link>
          <Link
            href="/services"
            className="warm-card p-3 flex flex-col items-center text-center"
          >
            <div className="text-2xl mb-1">🛎</div>
            <div className="text-xs font-semibold text-concrete-900">서비스</div>
            <div className="text-[10px] text-concrete-500">청소·AS·이사</div>
          </Link>
          <Link
            href="/review/write"
            className="warm-card p-3 flex flex-col items-center text-center bg-warm-50 border-warm-200"
          >
            <div className="text-2xl mb-1">✍️</div>
            <div className="text-xs font-semibold text-warm-700">리뷰 쓰기</div>
            <div className="text-[10px] text-concrete-500">도움 주기</div>
          </Link>
        </div>
      </section>

      {/* 내 채널 */}
      <section className="px-4 pt-4 pb-2">
        <div className="flex items-baseline justify-between mb-2">
          <h2 className="text-sm font-bold text-gray-900">내 채널</h2>
          <span className="text-[11px] text-gray-400">주소 기반 자동 개설</span>
        </div>
        {myChannels.length === 0 ? (
          <div className="text-xs text-gray-400 py-4">
            아직 등록된 주소가 없어요. 프로필에서 주소를 추가해보세요.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {myChannels.map((c) => (
              <Link
                key={c.id}
                href={`/channel/${c.id}`}
                className="p-3 border border-gray-200 rounded-xl hover:border-officelink-primary"
              >
                <div className="text-[11px] text-gray-400 mb-0.5">
                  {c.kind === "tenant-building" || c.kind === "landlord-building" || c.kind === "manager-building"
                    ? "🏢 오피스텔"
                    : "📍 동네"}
                </div>
                <div className="text-xs font-semibold text-gray-900 line-clamp-2 leading-snug">
                  {c.title}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 인기 글 */}
      <section className="px-4 pt-4 pb-2">
        <h2 className="text-sm font-bold text-gray-900 mb-2">🔥 인기 글</h2>
        {hot.length === 0 ? (
          <div className="text-xs text-gray-400 py-4">아직 인기 글이 없어요.</div>
        ) : (
          <div className="-mx-4 border-y border-gray-100">
            {hot.map((p) => {
              const ch = channelMap.get(p.channelId);
              return (
                <PostCard
                  key={p.id}
                  post={p}
                  channelTitle={ch?.title}
                />
              );
            })}
          </div>
        )}
      </section>

      {/* 공용 채널 */}
      <section className="px-4 pt-4 pb-6">
        <h2 className="text-sm font-bold text-gray-900 mb-2">우리 동네 공개 채널</h2>
        <div className="grid grid-cols-2 gap-2">
          {publicChannels.map((c) => (
            <Link
              key={c.id}
              href={`/channel/${c.id}`}
              className="p-3 border border-gray-200 rounded-xl hover:border-officelink-primary"
            >
              <div className="text-[11px] text-gray-400 mb-0.5">{c.category}</div>
              <div className="text-xs font-semibold text-gray-900 line-clamp-2 leading-snug">
                {c.title}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
