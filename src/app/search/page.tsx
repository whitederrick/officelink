"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getBuildings, getChannels, getPosts, getServices, getUser } from "@/lib/storage";
import { PostCard } from "@/components/PostCard";
import { PageHeader } from "@/components/PageHeader";
import { LoadingIntro } from "@/components/LoadingHouse";
import { EmptyState } from "@/components/EmptyState";
import { popularTags } from "@/lib/hashtag";
import type { Building, Channel, Post, Service } from "@/types";

export default function SearchPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const initial = sp.get("q") || "";
  const [mounted, setMounted] = useState(false);
  const [q, setQ] = useState(initial);
  const [tab, setTab] = useState<"all" | "post" | "channel" | "building" | "service" | "tag">("all");
  const [showSuggest, setShowSuggest] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    if (!getUser()) router.replace("/onboarding");
  }, [router]);

  const allPosts = useMemo(() => (mounted ? getPosts() : []), [mounted]);
  const allChannels = useMemo(() => (mounted ? getChannels() : []), [mounted]);
  const allBuildings = useMemo(() => (mounted ? getBuildings() : []), [mounted]);
  const allServices = useMemo(() => (mounted ? getServices() : []), [mounted]);

  // 자동완성 후보
  const suggestions = useMemo(() => {
    if (!q.trim() || q.length < 1) return [];
    const k = q.trim().toLowerCase();
    const out: { type: string; label: string; sub: string; href: string }[] = [];

    // 태그
    for (const t of popularTags()) {
      if (t.toLowerCase().includes(k)) {
        out.push({ type: "🏷", label: `#${t}`, sub: "인기 태그", href: `/search?q=${encodeURIComponent("#" + t)}` });
      }
    }
    // 건물
    for (const b of allBuildings) {
      if (b.name.toLowerCase().includes(k)) {
        out.push({ type: "🏢", label: b.name, sub: b.address, href: `/building/${b.id}` });
      }
    }
    // 서비스
    for (const s of allServices) {
      if (s.name.toLowerCase().includes(k)) {
        out.push({ type: "🛎", label: s.name, sub: s.description, href: `/service/${s.id}` });
      }
    }
    return out.slice(0, 6);
  }, [q, allBuildings, allServices]);

  const matchedPosts: Post[] = useMemo(() => {
    if (!q.trim()) return [];
    const k = q.trim().toLowerCase();
    return allPosts.filter(
      (p) =>
        p.title.toLowerCase().includes(k) ||
        p.content.toLowerCase().includes(k) ||
        p.authorNickname.toLowerCase().includes(k) ||
        p.category.toLowerCase().includes(k),
    );
  }, [q, allPosts]);

  const matchedChannels: Channel[] = useMemo(() => {
    if (!q.trim()) return [];
    const k = q.trim().toLowerCase();
    return allChannels.filter(
      (c) =>
        c.title.toLowerCase().includes(k) ||
        (c.description || "").toLowerCase().includes(k) ||
        (c.category || "").toLowerCase().includes(k),
    );
  }, [q, allChannels]);

  const matchedBuildings: Building[] = useMemo(() => {
    if (!q.trim()) return [];
    const k = q.trim().toLowerCase();
    return allBuildings.filter(
      (b) =>
        b.name.toLowerCase().includes(k) ||
        b.address.toLowerCase().includes(k) ||
        b.dong.toLowerCase().includes(k),
    );
  }, [q, allBuildings]);

  const matchedServices: Service[] = useMemo(() => {
    if (!q.trim()) return [];
    const k = q.trim().toLowerCase();
    return allServices.filter(
      (s) =>
        s.name.toLowerCase().includes(k) ||
        s.description.toLowerCase().includes(k) ||
        s.tags.some((t) => t.toLowerCase().includes(k)),
    );
  }, [q, allServices]);

  // 해시태그 검색
  const tagPosts: Post[] = useMemo(() => {
    if (!q.startsWith("#")) return [];
    const tag = q.slice(1).toLowerCase();
    if (!tag) return [];
    return allPosts.filter((p) => p.content.toLowerCase().includes("#" + tag));
  }, [q, allPosts]);

  const total = matchedPosts.length + matchedChannels.length + matchedBuildings.length + matchedServices.length;
  const channelMap = new Map(allChannels.map((c) => [c.id, c.title]));

  if (!mounted) return <LoadingIntro />;

  return (
    <div className="bg-white min-h-screen">
      <PageHeader title="검색" subtitle="건물·리뷰·서비스·태그" back="history" />

      <div className="sticky top-12 z-20 bg-white border-b border-concrete-100 px-4 py-2">
        <div className="relative">
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setShowSuggest(true);
            }}
            onFocus={() => setShowSuggest(true)}
            onBlur={() => setTimeout(() => setShowSuggest(false), 200)}
            placeholder="건물명, 주소, #태그, 닉네임"
            className="w-full h-11 px-4 pl-10 border border-concrete-200 rounded-pill text-sm focus:outline-none focus:border-warm-500"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-concrete-400">🔍</span>
          {q && (
            <button
              onClick={() => setQ("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-concrete-400 text-sm"
            >
              ✕
            </button>
          )}

          {/* 자동완성 드롭다운 */}
          {showSuggest && suggestions.length > 0 && (
            <div className="absolute top-12 left-0 right-0 bg-white border border-concrete-200 rounded-soft shadow-lg z-30 overflow-hidden">
              {suggestions.map((s, i) => (
                <Link
                  key={i}
                  href={s.href}
                  onClick={() => setShowSuggest(false)}
                  className="flex items-center gap-2 px-3 py-2.5 active:bg-concrete-50 border-b border-concrete-100 last:border-0"
                >
                  <span className="text-base">{s.type}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-concrete-900 truncate">{s.label}</div>
                    <div className="text-[11px] text-concrete-500 truncate">{s.sub}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* 인기 태그 */}
        {!q && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {popularTags().slice(0, 8).map((t) => (
              <Link
                key={t}
                href={`/search?q=${encodeURIComponent("#" + t)}`}
                className="text-[11px] px-2 py-0.5 bg-concrete-100 text-concrete-600 rounded-pill"
              >
                #{t}
              </Link>
            ))}
          </div>
        )}
      </div>

      {!q.trim() ? (
        <div className="p-8 text-center text-xs text-concrete-400">
          검색어를 입력하거나 인기 태그를 눌러보세요.
        </div>
      ) : q.startsWith("#") ? (
        <div>
          <div className="px-4 py-2 text-xs text-concrete-500">
            🏷 태그 {q}: {tagPosts.length}개 글
          </div>
          {tagPosts.length === 0 ? (
            <EmptyState
              kind="empty"
              title="이 태그를 쓴 글이 없어요"
              description="첫 번째 글을 작성해 보세요!"
              action={{ label: "글 쓰기", href: "/write" }}
            />
          ) : (
            <div>
              {tagPosts.map((p) => (
                <PostCard key={p.id} post={p} channelTitle={channelMap.get(p.channelId)} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="px-4 pt-3 flex gap-1.5 overflow-x-auto no-scrollbar">
            {([
              ["all", `전체 ${total}`],
              ["post", `글 ${matchedPosts.length}`],
              ["channel", `채널 ${matchedChannels.length}`],
              ["building", `건물 ${matchedBuildings.length}`],
              ["service", `서비스 ${matchedServices.length}`],
            ] as const).map(([t, label]) => {
              const active = tab === t;
              return (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`shrink-0 px-3 h-7 text-xs rounded-pill border ${
                    active
                      ? "bg-warm-500 text-white border-warm-500"
                      : "bg-white text-concrete-600 border-concrete-200"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {(tab === "all" || tab === "building") && matchedBuildings.length > 0 && (
            <section className="px-4 py-3">
              <h2 className="text-sm font-bold mb-2 text-concrete-900">🏢 건물</h2>
              <div className="space-y-2">
                {matchedBuildings.map((b) => (
                  <Link key={b.id} href={`/building/${b.id}`} className="warm-card p-3 block">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold">{b.name}</div>
                        <div className="text-[11px] text-concrete-500 truncate">{b.address}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-bold text-warm-600">{b.ratingAvg.toFixed(1)}</div>
                        <div className="text-[10px] text-concrete-500">{b.ratingCount}개</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {(tab === "all" || tab === "service") && matchedServices.length > 0 && (
            <section className="px-4 py-3 border-t border-concrete-100">
              <h2 className="text-sm font-bold mb-2 text-concrete-900">🛎 서비스</h2>
              <div className="space-y-2">
                {matchedServices.map((s) => (
                  <Link key={s.id} href={`/service/${s.id}`} className="warm-card p-3 block">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold">{s.name}</div>
                        <div className="text-[11px] text-concrete-500 truncate">{s.description}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-bold text-warm-600">{s.price}</div>
                        <div className="text-[10px] text-warm-700">⭐ {s.rating}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {(tab === "all" || tab === "channel") && matchedChannels.length > 0 && (
            <section className="px-4 py-3 border-t border-concrete-100">
              <h2 className="text-sm font-bold mb-2 text-concrete-900">📢 채널</h2>
              <div className="space-y-2">
                {matchedChannels.map((c) => (
                  <Link key={c.id} href={`/channel/${c.id}`} className="warm-card p-3 block">
                    <div className="text-[11px] text-concrete-400 mb-0.5">
                      {c.category || (c.kind.includes("public") ? "공개" : "전용")}
                    </div>
                    <div className="text-sm font-semibold">{c.title}</div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {(tab === "all" || tab === "post") && matchedPosts.length > 0 && (
            <section className="py-2 border-t border-concrete-100">
              <h2 className="text-sm font-bold mb-2 px-4 text-concrete-900">💬 글</h2>
              <div>
                {matchedPosts.map((p) => (
                  <PostCard key={p.id} post={p} channelTitle={channelMap.get(p.channelId)} />
                ))}
              </div>
            </section>
          )}

          {total === 0 && (
            <EmptyState
              kind="empty"
              title="검색 결과가 없어요"
              description={`“${q}”에 대한 결과가 없어요.`}
            />
          )}
        </>
      )}
    </div>
  );
}
