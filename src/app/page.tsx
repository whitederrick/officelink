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
  { href: "/buildings", icon: "building", label: "건물 리뷰", description: "실거주 평점 확인" },
  { href: "/stays", icon: "globe", label: "단기 거주", description: "언어별 매물 탐색" },
  { href: "/review/write", icon: "pen", label: "리뷰 쓰기", description: "경험 공유" },
  { href: "/events", icon: "calendar", label: "동네 모임", description: "생활권 연결" },
];

const buildingSkins = [
  "from-[#111827] via-[#1d2b53] to-[#0284c7]",
  "from-[#111827] via-[#3b1d65] to-[#7c3aed]",
  "from-[#0f172a] via-[#233876] to-[#38bdf8]",
  "from-[#131326] via-[#352064] to-[#2563eb]",
  "from-[#172033] via-[#1e3a8a] to-[#8b5cf6]",
];

function formatCount(value: number) {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return `${value}`;
}

function scopeLabel(scopeKey: string) {
  if (scopeKey.startsWith("building:")) return "거주 건물";
  if (scopeKey.startsWith("region:")) return "관심 지역";
  return "공개 채널";
}

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
    const primaryAddress = addresses.find((address) => address.isPrimary) ?? addresses[0];
    const primaryScopes = new Set<string>();
    if (primaryAddress) {
      primaryScopes.add(`building:${primaryAddress.detail}`);
      primaryScopes.add(`region:${primaryAddress.sigungu}:${primaryAddress.dong}`);
    }

    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const hotPosts = [...allPosts]
      .filter((post) => post.createdAt >= cutoff)
      .sort(
        (a, b) =>
          b.likes + b.commentCount * 2 + b.views * 0.1 -
          (a.likes + a.commentCount * 2 + a.views * 0.1),
      )
      .slice(0, 3);

    const channelStatus = new Map(
      myChannels.map((channel) => [
        channel.id,
        user.role === "tenant" && primaryScopes.has(channel.scopeKey)
          ? "거주 중"
          : scopeLabel(channel.scopeKey),
      ]),
    );

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
    <div className="min-h-screen bg-[#f7f9fc] pb-6 text-[#0f172a]">
      <section className="relative overflow-hidden border-b border-[#e2e8f0] bg-[radial-gradient(circle_at_15%_0%,rgba(56,189,248,0.24),transparent_34%),radial-gradient(circle_at_92%_10%,rgba(124,58,237,0.18),transparent_30%),linear-gradient(180deg,#ffffff_0%,#f7f9fc_100%)]">
        <div className="mx-auto w-full max-w-6xl px-5 pb-6 pt-6 md:px-8 md:pb-10 md:pt-10">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#dbeafe] bg-white/80 px-3 py-1.5 text-[12px] font-semibold text-[#1e3a8a] shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-[#38bdf8]" />
              {primaryAddress ? `${primaryAddress.dong} 생활권` : "OFFICELINK"}
            </div>
            <Link
              href="/profile"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#111827] text-[14px] font-bold text-white shadow-[0_16px_36px_rgba(15,23,42,0.22)]"
            >
              {user.nickname.slice(0, 1)}
            </Link>
          </div>

          <div className="grid gap-7 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
            <div>
              <h1 className="max-w-[680px] text-[34px] font-black leading-[1.02] tracking-[-0.07em] text-[#0f172a] min-[390px]:text-[40px] md:text-[60px]">
                내 건물과 동네를
                <br />
                한 화면에서 정리합니다.
              </h1>
              <p className="mt-4 max-w-[560px] text-[15px] leading-6 text-[#475569] md:text-[17px] md:leading-7">
                리뷰, 생활 서비스, 커뮤니티, 단기 거주 정보를 생활권 기준으로 모아
                필요한 순간 바로 움직일 수 있게 만듭니다.
              </p>
            </div>

            <div className="rounded-[30px] border border-white bg-[#0f172a] p-4 text-white shadow-[0_28px_80px_rgba(15,23,42,0.24)]">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#7dd3fc]">
                  Today Brief
                </span>
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-[12px] text-white/70">
                  {primaryAddress?.dong ?? "생활권"}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                <Metric label="공간" value={hotBuildings.length || 0} />
                <Metric label="채널" value={myChannels.length || 0} />
                <Metric label="피드" value={hotPosts.length || 0} />
              </div>
            </div>
          </div>

          <Link
            href="/search"
            className="mt-7 flex h-[62px] items-center gap-3 rounded-[24px] border border-[#e2e8f0] bg-white px-4 text-[15px] text-[#64748b] shadow-[0_18px_54px_rgba(15,23,42,0.08)] transition active:scale-[0.99] md:max-w-2xl"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eff6ff] text-[#2563eb]">
              <Icon name="search" className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1 truncate">건물, 동네, 생활 서비스를 검색하세요</span>
            <span className="rounded-full bg-[#111827] px-4 py-2 text-[13px] font-bold text-white">검색</span>
          </Link>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 pt-5 md:px-8">
        <div className="grid grid-cols-4 gap-2.5">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group rounded-[22px] border border-[#e2e8f0] bg-white p-3.5 shadow-[0_12px_34px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:border-[#bfdbfe] active:scale-[0.98] min-[390px]:p-4"
            >
              <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f1f5f9] text-[#1e3a8a] transition group-hover:bg-[#111827] group-hover:text-white">
                <Icon name={action.icon} className="h-5 w-5" />
              </span>
              <span className="block text-[14px] font-bold tracking-[-0.03em] text-[#0f172a] min-[390px]:text-[15px]">
                {action.label}
              </span>
              <span className="mt-1 hidden text-[12px] text-[#64748b] min-[390px]:block">
                {action.description}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 pt-8 md:px-8">
        <SectionTitle title="요즘 주목받는 공간" href="/buildings" eyebrow="SPACES" />
        <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-2 no-scrollbar md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 xl:grid-cols-5">
          {hotBuildings.map((building, index) => (
            <Link
              key={building.id}
              href={`/building/${building.id}`}
              className="w-[34vw] min-w-[128px] max-w-[156px] shrink-0 overflow-hidden rounded-[22px] border border-[#e2e8f0] bg-white shadow-[0_16px_38px_rgba(15,23,42,0.08)] md:w-auto md:max-w-none"
            >
              <div className={`relative h-24 bg-gradient-to-br p-3 ${buildingSkins[index % buildingSkins.length]}`}>
                <span className="inline-flex rounded-full bg-white/14 px-2 py-0.5 text-[11px] font-semibold text-white/90 backdrop-blur">
                  {building.dong}
                </span>
                <p className="absolute bottom-3 left-3 right-3 line-clamp-2 text-[15px] font-black leading-tight tracking-[-0.04em] text-white">
                  {building.name}
                </p>
              </div>
              <div className="flex items-center justify-between p-3">
                <div>
                  <p className="text-[11px] text-[#94a3b8]">{building.sigungu}</p>
                  <p className="mt-0.5 text-[13px] font-semibold text-[#475569]">
                    리뷰 {building.ratingCount}개
                  </p>
                </div>
                <span className="rounded-full bg-[#eff6ff] px-2 py-1 text-[12px] font-bold text-[#1d4ed8]">
                  {building.ratingAvg.toFixed(1)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 pt-5 md:px-8">
        <Link
          href="/stays"
          className="group grid gap-4 overflow-hidden rounded-[28px] border border-[#dbeafe] bg-white p-4 shadow-[0_18px_54px_rgba(15,23,42,0.08)] md:grid-cols-[1fr_auto] md:items-center md:p-5"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#111827] text-[#7dd3fc]">
              <Icon name="globe" className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#2563eb]">Stay Network</p>
              <h2 className="mt-1 text-[20px] font-black tracking-[-0.04em] text-[#0f172a]">
                언어가 통하는 단기 거주
              </h2>
              <p className="mt-1 text-[13px] leading-5 text-[#64748b]">
                출장, 유학, 워홀을 위한 가구 완비 공간을 빠르게 찾습니다.
              </p>
            </div>
          </div>
          <span className="inline-flex w-fit items-center gap-1 rounded-full bg-[#eff6ff] px-4 py-2 text-[13px] font-bold text-[#1d4ed8] transition group-hover:bg-[#111827] group-hover:text-white">
            둘러보기
            <Icon name="arrowRight" className="h-3.5 w-3.5" />
          </span>
        </Link>
      </section>

      {myChannels.length > 0 && (
        <section className="mx-auto w-full max-w-6xl px-5 pt-8 md:px-8">
          <SectionTitle title="내 주변 커뮤니티" href="/feed" eyebrow="LOCAL" />
          <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
            {myChannels.slice(0, 4).map((channel) => {
              const status = channelStatus.get(channel.id);
              const active = status === "거주 중";
              return (
                <Link
                  key={channel.id}
                  href={`/channel/${channel.id}`}
                  className="rounded-[22px] border border-[#e2e8f0] bg-white p-4 shadow-[0_12px_34px_rgba(15,23,42,0.05)] transition hover:border-[#bfdbfe] active:scale-[0.98]"
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#f1f5f9] text-[#1e3a8a]">
                      <Icon
                        name={channel.kind.includes("building") ? "building" : "users"}
                        className="h-[18px] w-[18px]"
                      />
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                        active ? "bg-[#111827] text-white" : "bg-[#eff6ff] text-[#1d4ed8]"
                      }`}
                    >
                      {status}
                    </span>
                  </div>
                  <p className="line-clamp-2 text-[15px] font-bold leading-snug tracking-[-0.03em] text-[#0f172a]">
                    {channel.title}
                  </p>
                  <p className="mt-1 text-[12px] text-[#94a3b8]">
                    {channel.kind.includes("building") ? "건물 채널" : "지역 채널"}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <section className="mx-auto w-full max-w-6xl px-5 pb-5 pt-8 md:px-8">
        <SectionTitle title="지금 이웃들의 이야기" href="/feed" eyebrow="FEED" />
        <div className="overflow-hidden rounded-[24px] border border-[#e2e8f0] bg-white shadow-[0_12px_34px_rgba(15,23,42,0.05)] md:grid md:grid-cols-3">
          {hotPosts.map((post, index) => (
            <Link
              key={post.id}
              href={`/post/${post.id}`}
              className={`block p-4 transition hover:bg-[#f8fafc] ${
                index > 0 ? "border-t border-[#e2e8f0] md:border-l md:border-t-0" : ""
              }`}
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-full bg-[#eff6ff] px-2.5 py-1 text-[12px] font-bold text-[#1d4ed8]">
                  {post.category}
                </span>
                <span className="truncate text-[12px] text-[#94a3b8]">
                  {channelMap.get(post.channelId)?.title}
                </span>
              </div>
              <p className="line-clamp-1 text-[15px] font-bold tracking-[-0.03em] text-[#0f172a]">
                {post.title}
              </p>
              <div className="mt-2 flex items-center gap-3 text-[12px] text-[#94a3b8]">
                <span>{post.authorNickname}</span>
                <span>좋아요 {formatCount(post.likes)}</span>
                <span>댓글 {formatCount(post.commentCount)}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white/8 p-3">
      <p className="text-[11px] font-semibold text-white/55">{label}</p>
      <p className="mt-1 text-[22px] font-black tracking-[-0.05em]">{value}</p>
    </div>
  );
}

function SectionTitle({ title, href, eyebrow }: { title: string; href: string; eyebrow: string }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div>
        <p className="mb-1 text-[11px] font-black uppercase tracking-[0.18em] text-[#2563eb]">{eyebrow}</p>
        <h2 className="text-[21px] font-black tracking-[-0.05em] text-[#0f172a]">{title}</h2>
      </div>
      <Link href={href} className="flex items-center gap-1 text-[13px] font-bold text-[#64748b]">
        전체 보기
        <Icon name="arrowRight" className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
