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
  { href: "/feed", icon: "feed", label: "동네 피드", description: "지금 올라온 이야기" },
  { href: "/buildings", icon: "building", label: "건물 리뷰", description: "실거주 평점과 후기" },
  { href: "/review/write", icon: "pen", label: "리뷰 쓰기", description: "내 경험 공유하기" },
  { href: "/stays", icon: "globe", label: "단기 거주", description: "언어가 통하는 매물" },
];

function formatCount(value: number) {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}천`;
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
    const primaryAddress = addresses.find((address) => address.isPrimary) ?? addresses[0];

    const myScopes = new Set<string>();
    for (const address of addresses) {
      myScopes.add(`building:${address.detail}`);
      myScopes.add(`region:${address.sigungu}:${address.dong}`);
    }

    const primaryScopes = new Set<string>();
    if (primaryAddress) {
      primaryScopes.add(`building:${primaryAddress.detail}`);
      primaryScopes.add(`region:${primaryAddress.sigungu}:${primaryAddress.dong}`);
    }

    const myChannels = allChannels.filter((channel) => myScopes.has(channel.scopeKey));
    const channelStatus = new Map(
      myChannels.map((channel) => [
        channel.id,
        user.role === "tenant" && primaryScopes.has(channel.scopeKey)
          ? "거주 중"
          : scopeLabel(channel.scopeKey),
      ]),
    );

    const hotBuildings = [...allBuildings]
      .filter((building) => building.ratingCount > 0)
      .sort((a, b) => b.ratingAvg - a.ratingAvg)
      .slice(0, 4);

    const hotPosts = [...allPosts]
      .sort(
        (a, b) =>
          b.likes + b.commentCount * 2 + b.views * 0.1 -
          (a.likes + a.commentCount * 2 + a.views * 0.1),
      )
      .slice(0, 4);

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
  const regionName = primaryAddress ? `${primaryAddress.dong}` : "내 동네";
  const buildingName = primaryAddress?.detail ?? "등록된 건물";

  return (
    <div className="min-h-screen bg-[#f5f7fb] pb-6 text-[#191f28]">
      <section className="px-5 pb-5 pt-6 md:px-8">
        <div className="mx-auto max-w-3xl">
          <p className="text-[15px] font-semibold text-[#6b7684]">{regionName} 생활권</p>
          <h1 className="mt-2 text-[30px] font-extrabold leading-[1.18] tracking-[-0.05em] text-[#191f28] min-[390px]:text-[34px]">
            안녕하세요, {user.nickname}님
            <br />
            오늘 동네 소식이에요
          </h1>

          <Link
            href="/search"
            className="mt-6 flex h-14 items-center gap-3 rounded-[18px] bg-white px-4 text-[15px] font-medium text-[#8b95a1] shadow-[0_8px_24px_rgba(25,31,40,0.06)] transition active:scale-[0.99]"
          >
            <Icon name="search" className="h-5 w-5 text-[#4e5968]" />
            <span className="min-w-0 flex-1 truncate">건물, 글, 생활 서비스를 검색해보세요</span>
          </Link>
        </div>
      </section>

      <main className="mx-auto flex max-w-3xl flex-col gap-3 px-5 md:px-8">
        <section className="rounded-[26px] bg-white p-5 shadow-[0_8px_24px_rgba(25,31,40,0.06)]">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-[#8b95a1]">내 생활권</p>
              <h2 className="mt-1 truncate text-[22px] font-extrabold tracking-[-0.04em] text-[#191f28]">
                {buildingName}
              </h2>
              <p className="mt-1 text-[14px] font-medium text-[#6b7684]">
                {primaryAddress ? `${primaryAddress.sigungu} ${primaryAddress.dong}` : "주소를 등록해보세요"}
              </p>
            </div>
            <Link
              href="/profile"
              className="shrink-0 rounded-full bg-[#f2f4f6] px-3 py-2 text-[13px] font-bold text-[#4e5968]"
            >
              관리
            </Link>
          </div>

          <div className="mt-5 grid grid-cols-3 rounded-[20px] bg-[#f8fafc] p-1.5">
            <Metric label="채널" value={myChannels.length} />
            <Metric label="공간" value={hotBuildings.length} />
            <Metric label="글" value={hotPosts.length} />
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="rounded-[24px] bg-white p-4 shadow-[0_8px_24px_rgba(25,31,40,0.05)] transition active:scale-[0.98]"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-[#eef6ff] text-[#3182f6]">
                <Icon name={action.icon} className="h-5 w-5" />
              </span>
              <p className="mt-4 text-[16px] font-extrabold tracking-[-0.03em] text-[#191f28]">
                {action.label}
              </p>
              <p className="mt-1 text-[13px] font-medium text-[#8b95a1]">{action.description}</p>
            </Link>
          ))}
        </section>

        <section className="rounded-[26px] bg-white shadow-[0_8px_24px_rgba(25,31,40,0.06)]">
          <SectionHeader title="지금 올라온 이야기" href="/feed" />
          <div className="divide-y divide-[#f2f4f6]">
            {hotPosts.length > 0 ? (
              hotPosts.map((post) => (
                <Link key={post.id} href={`/post/${post.id}`} className="block px-5 py-4 active:bg-[#f8fafc]">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 rounded-full bg-[#eef6ff] px-2.5 py-1 text-[12px] font-bold text-[#3182f6]">
                      {post.category}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-[16px] font-bold tracking-[-0.03em] text-[#191f28]">
                        {post.title}
                      </p>
                      <p className="mt-1 truncate text-[13px] font-medium text-[#8b95a1]">
                        {channelMap.get(post.channelId)?.title ?? "동네 채널"} · 좋아요 {formatCount(post.likes)} · 댓글{" "}
                        {formatCount(post.commentCount)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <EmptyLine text="아직 올라온 이야기가 없어요." />
            )}
          </div>
        </section>

        <section className="rounded-[26px] bg-white shadow-[0_8px_24px_rgba(25,31,40,0.06)]">
          <SectionHeader title="내 주변 커뮤니티" href="/feed" />
          <div className="divide-y divide-[#f2f4f6]">
            {myChannels.length > 0 ? (
              myChannels.slice(0, 4).map((channel) => {
                const status = channelStatus.get(channel.id) ?? scopeLabel(channel.scopeKey);
                const isActive = status === "거주 중";
                return (
                  <Link key={channel.id} href={`/channel/${channel.id}`} className="block px-5 py-4 active:bg-[#f8fafc]">
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-[#f2f4f6] text-[#4e5968]">
                        <Icon name={channel.kind.includes("building") ? "building" : "users"} className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-[16px] font-bold tracking-[-0.03em] text-[#191f28]">
                          {channel.title}
                        </p>
                        <p className="mt-1 text-[13px] font-medium text-[#8b95a1]">
                          {channel.kind.includes("building") ? "건물 채널" : "지역 채널"}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[12px] font-bold ${
                          isActive ? "bg-[#3182f6] text-white" : "bg-[#eef6ff] text-[#3182f6]"
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                  </Link>
                );
              })
            ) : (
              <EmptyLine text="주소를 등록하면 내 주변 커뮤니티가 열려요." />
            )}
          </div>
        </section>

        <section className="rounded-[26px] bg-white p-5 shadow-[0_8px_24px_rgba(25,31,40,0.06)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-bold text-[#3182f6]">단기 거주</p>
              <h2 className="mt-1 text-[20px] font-extrabold tracking-[-0.04em] text-[#191f28]">
                언어가 통하는 매물을 찾아보세요
              </h2>
              <p className="mt-1 text-[14px] font-medium leading-5 text-[#6b7684]">
                출장, 유학, 워홀을 위한 생활권 기반 매물입니다.
              </p>
            </div>
          </div>
          <Link
            href="/stays"
            className="mt-4 flex h-13 items-center justify-center rounded-[17px] bg-[#3182f6] px-4 py-3 text-[15px] font-bold text-white transition active:scale-[0.99]"
          >
            둘러보기
          </Link>
        </section>

        <section className="rounded-[26px] bg-white shadow-[0_8px_24px_rgba(25,31,40,0.06)]">
          <SectionHeader title="평점 높은 공간" href="/buildings" />
          <div className="divide-y divide-[#f2f4f6]">
            {hotBuildings.length > 0 ? (
              hotBuildings.map((building) => (
                <Link key={building.id} href={`/building/${building.id}`} className="block px-5 py-4 active:bg-[#f8fafc]">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-[#eef6ff] text-[#3182f6]">
                      <Icon name="building" className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-[16px] font-bold tracking-[-0.03em] text-[#191f28]">
                        {building.name}
                      </p>
                      <p className="mt-1 text-[13px] font-medium text-[#8b95a1]">
                        {building.sigungu} {building.dong} · 리뷰 {building.ratingCount}개
                      </p>
                    </div>
                    <span className="text-[16px] font-extrabold text-[#191f28]">{building.ratingAvg.toFixed(1)}</span>
                  </div>
                </Link>
              ))
            ) : (
              <EmptyLine text="아직 리뷰가 쌓인 공간이 없어요." />
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[16px] px-2 py-3 text-center">
      <p className="text-[12px] font-semibold text-[#8b95a1]">{label}</p>
      <p className="mt-1 text-[20px] font-extrabold tracking-[-0.04em] text-[#191f28]">{value}</p>
    </div>
  );
}

function SectionHeader({ title, href }: { title: string; href: string }) {
  return (
    <div className="flex items-center justify-between px-5 pb-1 pt-5">
      <h2 className="text-[20px] font-extrabold tracking-[-0.04em] text-[#191f28]">{title}</h2>
      <Link href={href} className="text-[14px] font-bold text-[#8b95a1]">
        전체 보기
      </Link>
    </div>
  );
}

function EmptyLine({ text }: { text: string }) {
  return <p className="px-5 py-6 text-[14px] font-medium text-[#8b95a1]">{text}</p>;
}
