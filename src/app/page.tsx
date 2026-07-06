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
  code: string;
}[] = [
  {
    href: "/buildings",
    icon: "building",
    label: "건물 찾기",
    description: "실거주 리뷰와 평점",
    code: "BLD",
  },
  {
    href: "/stays",
    icon: "globe",
    label: "단기 거주",
    description: "언어가 통하는 매물",
    code: "STY",
  },
  {
    href: "/review/write",
    icon: "pen",
    label: "리뷰 작성",
    description: "내 경험을 기록",
    code: "REV",
  },
  {
    href: "/events",
    icon: "calendar",
    label: "동네 모임",
    description: "생활권 연결",
    code: "LNK",
  },
];

const buildingSkins = [
  "from-[#172033] via-[#25324a] to-[#52607a]",
  "from-[#20342d] via-[#3d5549] to-[#7a876e]",
  "from-[#2d3340] via-[#4b5668] to-[#89929d]",
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
    <div className="min-h-screen bg-[#eef2ed] pb-6 text-[#172033]">
      <section className="urban-grid-bg relative overflow-hidden border-b border-[#dfe5dd]">
        <div className="absolute right-5 top-5 hidden h-24 w-24 rounded-full border border-[#172033]/10 md:block" />
        <div className="mx-auto w-full max-w-6xl px-4 pb-7 pt-5 min-[390px]:px-5 md:px-8 md:pb-10 md:pt-9">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="mb-3 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#b9d765]" />
                <p className="brand-kicker">
                  {primaryAddress ? `${primaryAddress.dong} live grid` : "officelink urban grid"}
                </p>
              </div>
              <h1 className="max-w-[650px] text-[32px] font-semibold leading-[1.04] tracking-[-0.06em] text-[#172033] min-[390px]:text-[36px] md:text-[52px]">
                내 건물과 동네를 한눈에 관리하는 생활 지도.
              </h1>
              <p className="mt-4 max-w-[520px] text-[15px] leading-6 text-[#59665e] md:text-[16px]">
                {user.nickname}님에게 필요한 리뷰, 서비스, 커뮤니티 연결을 도시의 좌표처럼 정리했습니다.
              </p>
            </div>
            <Link
              href="/profile"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#172033]/15 bg-[#172033] text-sm font-semibold text-white shadow-[0_14px_32px_rgba(23,32,51,0.2)]"
            >
              {user.nickname.slice(0, 1)}
            </Link>
          </div>

          <div className="brand-card rounded-[28px] p-2">
            <Link
              href="/search"
              className="flex h-[58px] items-center gap-3 rounded-[22px] bg-white px-4 text-[15px] text-[#59665e] transition active:scale-[0.99]"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#edf5cc] text-[#172033]">
                <Icon name="search" className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1 truncate">건물, 동네, 생활 서비스를 검색하세요</span>
              <span className="hidden rounded-full border border-[#dfe5dd] px-3 py-1 text-[12px] font-semibold text-[#59665e] min-[390px]:block">
                Search
              </span>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pt-4 min-[390px]:px-5 md:px-8 md:pt-5">
        <div className="grid grid-cols-2 gap-2.5 min-[400px]:grid-cols-4 md:gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group relative min-h-[108px] overflow-hidden rounded-[24px] border border-[#dfe5dd] bg-white p-4 shadow-[0_10px_28px_rgba(23,32,51,0.045)] transition hover:-translate-y-0.5 hover:border-[#b9d765] active:scale-[0.98]"
            >
              <div className="absolute left-0 top-0 h-1 w-full bg-[#b9d765] opacity-0 transition group-hover:opacity-100" />
              <div className="mb-3 flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#eef2ed] text-[#25324a] transition group-hover:bg-[#172033] group-hover:text-white">
                  <Icon name={action.icon} className="h-5 w-5" />
                </span>
                <span className="text-[11px] font-bold tracking-[0.14em] text-[#9aa69d]">{action.code}</span>
              </div>
              <span className="block text-[15px] font-semibold tracking-[-0.03em] text-[#172033]">
                {action.label}
              </span>
              <span className="mt-1 block text-[13px] text-[#657269]">{action.description}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pt-8 min-[390px]:px-5 md:px-8">
        <SectionTitle title="요즘 주목받는 공간" href="/buildings" code="SPACES" />
        <div className="-mx-4 flex gap-2.5 overflow-x-auto px-4 pb-2 no-scrollbar min-[390px]:-mx-5 min-[390px]:px-5 md:mx-0 md:grid md:grid-cols-3 md:gap-3 md:overflow-visible md:px-0 xl:grid-cols-5">
          {hotBuildings.map((building, index) => (
            <Link
              key={building.id}
              href={`/building/${building.id}`}
              className="w-[37vw] min-w-[136px] max-w-[166px] shrink-0 overflow-hidden rounded-[24px] border border-[#dfe5dd] bg-white shadow-[0_12px_30px_rgba(23,32,51,0.055)] md:w-auto md:max-w-none"
            >
              <div className={`relative h-24 bg-gradient-to-br p-3 ${buildingSkins[index % buildingSkins.length]}`}>
                <div className="brand-accent-line absolute bottom-0 left-0 h-1 w-full" />
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full border border-white/10" />
                <span className="relative inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-medium text-white/85 backdrop-blur">
                  <Icon name="mapPin" className="h-3 w-3" />
                  {building.dong}
                </span>
                <div className="absolute bottom-4 left-3 right-3">
                  <p className="line-clamp-2 text-[15px] font-semibold leading-tight tracking-[-0.03em] text-white">
                    {building.name}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3">
                <div>
                  <p className="text-[11px] text-[#7b877f]">{building.sigungu}</p>
                  <p className="mt-0.5 text-[13px] font-medium text-[#59665e]">
                    리뷰 {building.ratingCount}개
                  </p>
                </div>
                <div className="flex items-center gap-0.5 rounded-full bg-[#edf5cc] px-2 py-1 text-[#25324a]">
                  <Icon name="star" className="h-3 w-3 fill-current" />
                  <span className="text-[12px] font-semibold">{building.ratingAvg.toFixed(1)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pt-5 min-[390px]:px-5 md:px-8">
        <div className="relative overflow-hidden rounded-[28px] border border-[#25324a] bg-[#172033] p-4 text-white shadow-[0_20px_50px_rgba(23,32,51,0.2)] md:p-5">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.055)_1px,transparent_1px)] bg-[length:24px_24px]" />
          <div className="absolute -right-14 -top-16 h-44 w-44 rounded-full bg-[#b9d765]/20 blur-2xl" />
          <div className="relative flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-[#d8ed92]">
              <Icon name="globe" className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#d8ed92]">Stay Network</p>
              <h2 className="mt-0.5 text-[18px] font-semibold tracking-[-0.03em]">언어가 통하는 단기 거주</h2>
              <p className="mt-1 truncate text-[13px] text-white/65">출장, 유학, 워홀을 위한 가구 완비 공간</p>
            </div>
            <Link
              href="/stays"
              className="inline-flex h-10 shrink-0 items-center gap-1 rounded-full bg-[#b9d765] px-3.5 text-[13px] font-semibold text-[#172033]"
            >
              둘러보기
              <Icon name="arrowRight" className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {myChannels.length > 0 && (
        <section className="mx-auto w-full max-w-6xl px-4 pt-8 min-[390px]:px-5 md:px-8">
          <SectionTitle title="내 주변 커뮤니티" href="/feed" code="LOCAL" />
          <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
            {myChannels.slice(0, 4).map((channel) => {
              const status = channelStatus.get(channel.id);
              return (
                <Link
                  key={channel.id}
                  href={`/channel/${channel.id}`}
                  className="rounded-[24px] border border-[#dfe5dd] bg-white p-4 shadow-[0_10px_28px_rgba(23,32,51,0.045)] transition hover:border-[#b9d765] active:scale-[0.98]"
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#eef2ed] text-[#25324a]">
                      <Icon
                        name={channel.kind.includes("building") ? "building" : "users"}
                        className="h-[18px] w-[18px]"
                      />
                    </span>
                    <span
                      className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${
                        status === "거주 중"
                          ? "border-[#172033] bg-[#172033] text-white"
                          : "border-[#dfe5dd] bg-[#fbfbf8] text-[#657269]"
                      }`}
                    >
                      {status}
                    </span>
                  </div>
                  <p className="line-clamp-2 text-[15px] font-semibold leading-snug tracking-[-0.02em] text-[#172033]">
                    {channel.title}
                  </p>
                  <p className="mt-1 text-[13px] text-[#7b877f]">
                    {channel.kind.includes("building") ? "건물 채널" : "지역 채널"}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <section className="mx-auto w-full max-w-6xl px-4 pb-5 pt-8 min-[390px]:px-5 md:px-8">
        <SectionTitle title="지금 이웃들의 이야기" href="/feed" code="FEED" />
        <div className="overflow-hidden rounded-[28px] border border-[#dfe5dd] bg-white shadow-[0_12px_30px_rgba(23,32,51,0.045)] md:grid md:grid-cols-3">
          {hotPosts.map((post, index) => (
            <Link
              key={post.id}
              href={`/post/${post.id}`}
              className={`block p-4 transition active:bg-[#f7f9f4] md:min-h-[124px] ${
                index > 0 ? "border-t border-[#edf1eb] md:border-l md:border-t-0" : ""
              }`}
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-full bg-[#edf5cc] px-2.5 py-1 text-[12px] font-semibold text-[#59665e]">
                  {post.category}
                </span>
                <span className="truncate text-[12px] text-[#7b877f]">
                  {channelMap.get(post.channelId)?.title}
                </span>
              </div>
              <p className="line-clamp-1 text-[15px] font-semibold tracking-[-0.02em] text-[#172033]">
                {post.title}
              </p>
              <div className="mt-2 flex items-center gap-3 text-[12px] text-[#7b877f]">
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

function SectionTitle({ title, href, code }: { title: string; href: string; code: string }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div>
        <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#9aa69d]">{code}</p>
        <h2 className="text-[20px] font-semibold tracking-[-0.045em] text-[#172033]">{title}</h2>
      </div>
      <Link href={href} className="flex items-center gap-1 text-[13px] font-semibold text-[#59665e]">
        전체 보기
        <Icon name="arrowRight" className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
