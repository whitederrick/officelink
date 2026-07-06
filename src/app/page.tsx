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
  className: string;
}[] = [
  {
    href: "/buildings",
    icon: "building",
    label: "건물 찾기",
    description: "실거주 리뷰",
    className: "bg-indigo-50 text-indigo-600",
  },
  {
    href: "/stays",
    icon: "globe",
    label: "단기 거주",
    description: "다국어 매물",
    className: "bg-cyan-50 text-cyan-600",
  },
  {
    href: "/review/write",
    icon: "pen",
    label: "리뷰 작성",
    description: "경험 공유",
    className: "bg-violet-50 text-violet-600",
  },
  {
    href: "/events",
    icon: "calendar",
    label: "동네 모임",
    description: "새로운 연결",
    className: "bg-rose-50 text-rose-600",
  },
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
      .slice(0, 4);

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
          ? primaryScopes.has(channel.scopeKey) ? "거주 중" : "관심 지역"
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
    <div className="min-h-screen bg-slate-50 pb-6">
      <section className="overflow-hidden bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 pb-6 pt-5 min-[390px]:px-5 md:px-8 md:pb-8 md:pt-8">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="mb-1 text-[13px] font-medium text-slate-500">
              {primaryAddress
                ? `${primaryAddress.dong}에서의 오늘`
                : "나에게 맞는 공간을 발견하세요"}
            </p>
            <h1 className="text-[24px] font-extrabold leading-tight tracking-[-0.045em] text-slate-950 min-[390px]:text-[26px] md:text-[32px]">
              안녕하세요, {user.nickname}님
            </h1>
          </div>
          <Link
            href="/profile"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-sm font-bold text-white shadow-lg shadow-indigo-200"
          >
            {user.nickname.slice(0, 1)}
          </Link>
        </div>

        <Link
          href="/search"
          className="flex h-[52px] items-center gap-3 rounded-2xl bg-slate-100 px-4 text-sm text-slate-500 transition active:scale-[0.99]"
        >
          <Icon name="search" className="h-5 w-5 text-slate-400" />
          <span className="min-w-0 flex-1 truncate">건물, 동네, 생활 서비스를 검색하세요</span>
          <span className="hidden rounded-lg bg-white px-2 py-1 text-[10px] font-semibold text-slate-400 shadow-sm min-[390px]:block">
            검색
          </span>
        </Link>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pt-4 min-[390px]:px-5 md:px-8 md:pt-5">
        <div className="grid grid-cols-2 gap-3 min-[400px]:grid-cols-4 md:gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group flex min-h-[94px] flex-col items-center justify-center rounded-2xl bg-white px-2 py-3 shadow-[0_1px_3px_rgba(15,23,42,0.05)] ring-1 ring-slate-200/70 transition active:scale-95 md:min-h-[104px]"
            >
              <span className={`mb-1.5 flex h-9 w-9 items-center justify-center rounded-xl ${action.className}`}>
                <Icon name={action.icon} className="h-5 w-5" />
              </span>
              <span className="text-[12px] font-bold tracking-[-0.02em] text-slate-800">
                {action.label}
              </span>
              <span className="mt-0.5 text-[9px] text-slate-400">{action.description}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pt-6 min-[390px]:px-5 md:px-8">
        <SectionTitle title="요즘 주목받는 공간" href="/buildings" />
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 no-scrollbar min-[390px]:-mx-5 min-[390px]:px-5 md:mx-0 md:grid md:grid-cols-3 md:gap-3 md:overflow-visible md:px-0 xl:grid-cols-4">
          {hotBuildings.map((building, index) => (
            <Link
              key={building.id}
              href={`/building/${building.id}`}
              className="w-[38vw] min-w-[132px] max-w-[164px] shrink-0 overflow-hidden rounded-2xl bg-white shadow-[0_5px_20px_rgba(15,23,42,0.07)] ring-1 ring-slate-200/60 md:w-auto md:max-w-none"
            >
              <div
                className={`relative h-24 p-3 ${
                  index % 3 === 0
                    ? "bg-gradient-to-br from-indigo-500 to-violet-600"
                    : index % 3 === 1
                      ? "bg-gradient-to-br from-cyan-500 to-blue-600"
                      : "bg-gradient-to-br from-slate-700 to-slate-950"
                }`}
              >
                <div className="absolute -right-7 -top-8 h-24 w-24 rounded-full border border-white/15" />
                <span className="relative inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[9px] font-semibold text-white backdrop-blur">
                  <Icon name="mapPin" className="h-3 w-3" />
                  {building.dong}
                </span>
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="line-clamp-2 text-[14px] font-extrabold leading-tight tracking-[-0.03em] text-white md:text-base">
                    {building.name}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3">
                <div>
                  <p className="text-[9px] text-slate-400">{building.sigungu}</p>
                  <p className="mt-0.5 text-[10px] font-semibold text-slate-600">
                    리뷰 {building.ratingCount}개
                  </p>
                </div>
                <div className="flex items-center gap-0.5 rounded-lg bg-amber-50 px-1.5 py-1 text-amber-600">
                  <Icon name="star" className="h-3 w-3 fill-current" />
                  <span className="text-[11px] font-extrabold">{building.ratingAvg.toFixed(1)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pt-5 min-[390px]:px-5 md:px-8">
        <div className="relative overflow-hidden rounded-[20px] bg-slate-950 p-4 text-white shadow-lg shadow-slate-300 md:p-5">
          <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-indigo-500/30 blur-2xl" />
          <div className="relative flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
              <Icon name="globe" className="h-5 w-5 text-indigo-300" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-indigo-300">Stay in Seoul</p>
              <h2 className="mt-0.5 text-[15px] font-extrabold tracking-[-0.03em]">언어가 통하는 단기 거주</h2>
              <p className="mt-1 truncate text-[10px] text-slate-400">출장·유학·워홀을 위한 가구 완비 공간</p>
            </div>
            <Link
              href="/stays"
              className="inline-flex h-9 shrink-0 items-center gap-1 rounded-xl bg-white px-3 text-[10px] font-bold text-slate-950"
            >
              보기
              <Icon name="arrowRight" className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {myChannels.length > 0 && (
        <section className="mx-auto w-full max-w-6xl px-4 pt-6 min-[390px]:px-5 md:px-8">
          <SectionTitle title="내 주변 커뮤니티" href="/feed" />
          <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
            {myChannels.slice(0, 4).map((channel) => (
              <Link
                key={channel.id}
                href={`/channel/${channel.id}`}
                className="rounded-2xl bg-white p-3 ring-1 ring-slate-200/70 transition active:scale-[0.98]"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Icon
                    name={channel.kind.includes("building") ? "building" : "users"}
                    className="h-[18px] w-[18px]"
                  />
                </span>
                  <span className={`rounded-full px-2 py-1 text-[9px] font-bold ${
                    channelStatus.get(channel.id) === "거주 중"
                      ? "bg-emerald-50 text-emerald-600"
                      : channelStatus.get(channel.id) === "운영 중"
                        ? "bg-indigo-50 text-indigo-600"
                        : "bg-slate-100 text-slate-500"
                  }`}>
                    {channelStatus.get(channel.id)}
                  </span>
                </div>
                <p className="line-clamp-2 text-[13px] font-bold leading-snug text-slate-800">
                  {channel.title}
                </p>
                <p className="mt-1 text-[9px] text-slate-400">
                  {channel.kind.includes("building") ? "건물 채널" : "지역 채널"}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto w-full max-w-6xl px-4 pb-5 pt-6 min-[390px]:px-5 md:px-8">
        <SectionTitle title="지금 이웃들의 이야기" href="/feed" />
        <div className="overflow-hidden rounded-[22px] bg-white ring-1 ring-slate-200/70 md:grid md:grid-cols-3">
          {hotPosts.map((post, index) => (
            <Link
              key={post.id}
              href={`/post/${post.id}`}
              className={`block p-3.5 transition active:bg-slate-50 md:min-h-[120px] ${
                index > 0 ? "border-t border-slate-100 md:border-l md:border-t-0" : ""
              }`}
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500">
                  {post.category}
                </span>
                <span className="truncate text-[10px] text-slate-400">
                  {channelMap.get(post.channelId)?.title}
                </span>
              </div>
              <p className="line-clamp-1 text-sm font-bold tracking-[-0.02em] text-slate-900">
                {post.title}
              </p>
              <div className="mt-2 flex items-center gap-3 text-[10px] text-slate-400">
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
      <h2 className="text-[16px] font-extrabold tracking-[-0.035em] text-slate-950">{title}</h2>
      <Link href={href} className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
        전체 보기
        <Icon name="arrowRight" className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
