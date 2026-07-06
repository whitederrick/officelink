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
import { Icon, type IconName } from "@/components/Icon";
import { LoadingIntro } from "@/components/LoadingHouse";

const quickActions: {
  href: string;
  icon: IconName;
  label: string;
  description: string;
}[] = [
  {
    href: "/buildings",
    icon: "building",
    label: "건물 찾기",
    description: "실거주 리뷰",
  },
  {
    href: "/stays",
    icon: "globe",
    label: "단기 거주",
    description: "언어별 매물",
  },
  {
    href: "/review/write",
    icon: "pen",
    label: "리뷰 작성",
    description: "경험 공유",
  },
  {
    href: "/events",
    icon: "calendar",
    label: "동네 모임",
    description: "새로운 연결",
  },
];

const buildingSkins = [
  "from-zinc-950 via-slate-900 to-slate-700",
  "from-stone-900 via-zinc-800 to-neutral-600",
  "from-slate-800 via-slate-700 to-zinc-500",
];

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
    const hotBuildings = [...allBuildings]
      .filter((building) => building.ratingCount > 0)
      .sort((a, b) => b.ratingAvg - a.ratingAvg)
      .slice(0, 5);

    const myScopes = new Set<string>();
    for (const address of addresses) {
      myScopes.add(`building:${address.detail}`);
      myScopes.add(`region:${address.sigungu}:${address.dong}`);
    }

    const myChannels = allChannels.filter((channel) => myScopes.has(channel.scopeKey));
    const primaryScopes = new Set<string>();
    const primaryAddress = addresses.find((address) => address.isPrimary) ?? addresses[0];
    if (primaryAddress) {
      primaryScopes.add(`building:${primaryAddress.detail}`);
      primaryScopes.add(`region:${primaryAddress.sigungu}:${primaryAddress.dong}`);
    }

    const channelStatus = new Map(
      myChannels.map((channel) => [
        channel.id,
        user.role === "tenant"
          ? primaryScopes.has(channel.scopeKey)
            ? "거주 중"
            : "관심 지역"
          : "운영 중",
      ]),
    );

    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const hotPosts = [...allPosts]
      .filter((post) => post.createdAt >= cutoff)
      .sort(
        (a, b) =>
          b.likes + b.commentCount * 2 + b.views * 0.1 -
          (a.likes + a.commentCount * 2 + a.views * 0.1),
      )
      .slice(0, 3);

    return {
      user,
      primaryAddress,
      hotBuildings,
      hotPosts,
      myChannels,
      channelStatus,
      channelMap: new Map(allChannels.map((channel) => [channel.id, channel])),
    };
  }, [mounted]);

  if (!mounted || !data) return <LoadingIntro />;

  const { user, primaryAddress, hotBuildings, hotPosts, myChannels, channelStatus, channelMap } = data;

  return (
    <div className="min-h-screen bg-[#f6f6f3] pb-6 text-zinc-950">
      <section className="border-b border-zinc-200/80 bg-[#f8f8f5]">
        <div className="mx-auto w-full max-w-6xl px-4 pb-6 pt-5 min-[390px]:px-5 md:px-8 md:pb-8 md:pt-8">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                {primaryAddress ? `${primaryAddress.dong} 기준` : "OFFICELINK"}
              </p>
              <h1 className="max-w-[560px] text-[28px] font-semibold leading-[1.08] tracking-[-0.06em] text-zinc-950 min-[390px]:text-[31px] md:text-[44px]">
                오늘 필요한 동네 정보를 간결하게 확인하세요.
              </h1>
              <p className="mt-3 text-[13px] leading-5 text-zinc-500 md:text-sm">
                {user.nickname}님에게 맞춘 건물 리뷰, 생활 서비스, 커뮤니티 소식입니다.
              </p>
            </div>
            <Link
              href="/profile"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-zinc-300 bg-zinc-950 text-sm font-semibold text-white shadow-sm"
            >
              {user.nickname.slice(0, 1)}
            </Link>
          </div>

          <Link
            href="/search"
            className="flex h-[52px] items-center gap-3 rounded-full border border-zinc-200 bg-white px-4 text-sm text-zinc-500 shadow-[0_10px_30px_rgba(24,24,27,0.04)] transition active:scale-[0.99]"
          >
            <Icon name="search" className="h-5 w-5 text-zinc-400" />
            <span className="min-w-0 flex-1 truncate">건물, 동네, 생활 서비스를 검색하세요</span>
            <span className="hidden rounded-full bg-zinc-100 px-3 py-1 text-[10px] font-semibold text-zinc-500 min-[390px]:block">
              검색
            </span>
          </Link>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pt-4 min-[390px]:px-5 md:px-8 md:pt-5">
        <div className="grid grid-cols-2 gap-2.5 min-[400px]:grid-cols-4 md:gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group flex min-h-[88px] flex-col justify-between rounded-[22px] border border-zinc-200 bg-white p-3 shadow-[0_8px_24px_rgba(24,24,27,0.04)] transition hover:-translate-y-0.5 hover:border-zinc-300 active:scale-[0.98] md:min-h-[100px] md:p-4"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-800 transition group-hover:bg-zinc-950 group-hover:text-white">
                <Icon name={action.icon} className="h-4.5 w-4.5" />
              </span>
              <span>
                <span className="block text-[13px] font-semibold tracking-[-0.03em] text-zinc-950">
                  {action.label}
                </span>
                <span className="mt-0.5 block text-[10px] text-zinc-500">{action.description}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pt-7 min-[390px]:px-5 md:px-8">
        <SectionTitle title="요즘 주목받는 공간" href="/buildings" />
        <div className="-mx-4 flex gap-2.5 overflow-x-auto px-4 pb-2 no-scrollbar min-[390px]:-mx-5 min-[390px]:px-5 md:mx-0 md:grid md:grid-cols-3 md:gap-3 md:overflow-visible md:px-0 xl:grid-cols-5">
          {hotBuildings.map((building, index) => (
            <Link
              key={building.id}
              href={`/building/${building.id}`}
              className="w-[36vw] min-w-[128px] max-w-[154px] shrink-0 overflow-hidden rounded-[22px] border border-zinc-200 bg-white shadow-[0_10px_28px_rgba(24,24,27,0.05)] md:w-auto md:max-w-none"
            >
              <div className={`relative h-20 bg-gradient-to-br p-3 ${buildingSkins[index % buildingSkins.length]}`}>
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full border border-white/10" />
                <span className="relative inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-medium text-white/85 backdrop-blur">
                  <Icon name="mapPin" className="h-3 w-3" />
                  {building.dong}
                </span>
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="line-clamp-2 text-[13px] font-semibold leading-tight tracking-[-0.03em] text-white">
                    {building.name}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3">
                <div>
                  <p className="text-[9px] text-zinc-400">{building.sigungu}</p>
                  <p className="mt-0.5 text-[10px] font-medium text-zinc-600">
                    리뷰 {building.ratingCount}개
                  </p>
                </div>
                <div className="flex items-center gap-0.5 rounded-full bg-zinc-100 px-1.5 py-1 text-zinc-700">
                  <Icon name="star" className="h-3 w-3 fill-current" />
                  <span className="text-[11px] font-semibold">{building.ratingAvg.toFixed(1)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pt-5 min-[390px]:px-5 md:px-8">
        <div className="relative overflow-hidden rounded-[24px] border border-zinc-800 bg-zinc-950 p-4 text-white shadow-[0_18px_45px_rgba(24,24,27,0.16)] md:p-5">
          <div className="absolute -right-14 -top-16 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10">
              <Icon name="globe" className="h-5 w-5 text-zinc-200" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-zinc-400">Stay in Seoul</p>
              <h2 className="mt-0.5 text-[15px] font-semibold tracking-[-0.03em]">언어가 통하는 단기 거주</h2>
              <p className="mt-1 truncate text-[10px] text-zinc-400">출장, 유학, 워홀을 위한 가구 완비 공간</p>
            </div>
            <Link
              href="/stays"
              className="inline-flex h-9 shrink-0 items-center gap-1 rounded-full bg-white px-3 text-[10px] font-semibold text-zinc-950"
            >
              둘러보기
              <Icon name="arrowRight" className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {myChannels.length > 0 && (
        <section className="mx-auto w-full max-w-6xl px-4 pt-7 min-[390px]:px-5 md:px-8">
          <SectionTitle title="내 주변 커뮤니티" href="/feed" />
          <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
            {myChannels.slice(0, 4).map((channel) => {
              const status = channelStatus.get(channel.id);
              return (
                <Link
                  key={channel.id}
                  href={`/channel/${channel.id}`}
                  className="rounded-[22px] border border-zinc-200 bg-white p-3 shadow-[0_8px_24px_rgba(24,24,27,0.04)] transition hover:border-zinc-300 active:scale-[0.98]"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-800">
                      <Icon
                        name={channel.kind.includes("building") ? "building" : "users"}
                        className="h-[17px] w-[17px]"
                      />
                    </span>
                    <span
                      className={`rounded-full border px-2 py-1 text-[9px] font-semibold ${
                        status === "거주 중"
                          ? "border-zinc-900 bg-zinc-950 text-white"
                          : "border-zinc-200 bg-zinc-50 text-zinc-500"
                      }`}
                    >
                      {status}
                    </span>
                  </div>
                  <p className="line-clamp-2 text-[13px] font-semibold leading-snug tracking-[-0.02em] text-zinc-950">
                    {channel.title}
                  </p>
                  <p className="mt-1 text-[9px] text-zinc-400">
                    {channel.kind.includes("building") ? "건물 채널" : "지역 채널"}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <section className="mx-auto w-full max-w-6xl px-4 pb-5 pt-7 min-[390px]:px-5 md:px-8">
        <SectionTitle title="지금 이웃들의 이야기" href="/feed" />
        <div className="overflow-hidden rounded-[24px] border border-zinc-200 bg-white shadow-[0_10px_28px_rgba(24,24,27,0.04)] md:grid md:grid-cols-3">
          {hotPosts.map((post, index) => (
            <Link
              key={post.id}
              href={`/post/${post.id}`}
              className={`block p-3.5 transition active:bg-zinc-50 md:min-h-[118px] ${
                index > 0 ? "border-t border-zinc-100 md:border-l md:border-t-0" : ""
              }`}
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-full bg-zinc-100 px-2 py-1 text-[10px] font-semibold text-zinc-600">
                  {post.category}
                </span>
                <span className="truncate text-[10px] text-zinc-400">
                  {channelMap.get(post.channelId)?.title}
                </span>
              </div>
              <p className="line-clamp-1 text-sm font-semibold tracking-[-0.02em] text-zinc-950">
                {post.title}
              </p>
              <div className="mt-2 flex items-center gap-3 text-[10px] text-zinc-400">
                <span>{post.authorNickname}</span>
                <span>좋아요 {post.likes}</span>
                <span>댓글 {post.commentCount}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function SectionTitle({ title, href }: { title: string; href: string }) {
  return (
    <div className="mb-2.5 flex items-center justify-between">
      <h2 className="text-[17px] font-semibold tracking-[-0.04em] text-zinc-950">{title}</h2>
      <Link href={href} className="flex items-center gap-1 text-[11px] font-medium text-zinc-400">
        전체 보기
        <Icon name="arrowRight" className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
