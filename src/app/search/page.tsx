"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getBuildings, getChannels, getPosts, getServices, getUser } from "@/lib/storage";
import { PostCard } from "@/components/PostCard";
import type { Building, Channel, Post, Service } from "@/types";
import { LoadingIntro } from "@/components/LoadingHouse";

export default function SearchPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const initial = sp.get("q") || "";
  const [mounted, setMounted] = useState(false);
  const [q, setQ] = useState(initial);
  const [tab, setTab] = useState<"all" | "post" | "channel" | "building" | "service">("all");

  useEffect(() => {
    setMounted(true);
    if (!getUser()) router.replace("/onboarding");
  }, [router]);

  const allPosts = useMemo(() => (mounted ? getPosts() : []), [mounted]);
  const allChannels = useMemo(() => (mounted ? getChannels() : []), [mounted]);
  const allBuildings = useMemo(() => (mounted ? getBuildings() : []), [mounted]);
  const allServices = useMemo(() => (mounted ? getServices() : []), [mounted]);

  const matchedPosts: Post[] = useMemo(() => {
    if (!q.trim()) return [];
    const k = q.trim().toLowerCase();
    return allPosts.filter(
      (p) =>
        p.title.toLowerCase().includes(k) ||
        p.content.toLowerCase().includes(k) ||
        p.authorNickname.toLowerCase().includes(k),
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

  const total = matchedPosts.length + matchedChannels.length + matchedBuildings.length + matchedServices.length;

  const channelMap = new Map(allChannels.map((c) => [c.id, c.title]));

  if (!mounted) {
    return <LoadingIntro />;
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="sticky top-12 z-20 bg-white border-b border-gray-100 px-4 h-12 flex items-center gap-2">
        <button onClick={() => router.back()} className="text-lg">‹</button>
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="글, 채널, 닉네임 검색"
          className="flex-1 h-9 px-3 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-officelink-primary"
        />
      </div>

      {!q.trim() ? (
        <div className="p-8 text-center text-xs text-gray-400">
          검색어를 입력해보세요.
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
                  <Link
                    key={b.id}
                    href={`/building/${b.id}`}
                    className="warm-card p-3 block"
                  >
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
                  <Link
                    key={s.id}
                    href={`/service/${s.id}`}
                    className="warm-card p-3 block"
                  >
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
                  <Link
                    key={c.id}
                    href={`/channel/${c.id}`}
                    className="warm-card p-3 block"
                  >
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
                  <PostCard
                    key={p.id}
                    post={p}
                    channelTitle={channelMap.get(p.channelId)}
                  />
                ))}
              </div>
            </section>
          )}

          {total === 0 && (
            <div className="p-12 text-center text-sm text-concrete-400">
              “{q}”에 대한 결과가 없어요.
            </div>
          )}
        </>
      )}
    </div>
  );
}
