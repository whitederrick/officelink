"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getUnreadCount, getUser } from "@/lib/storage";
import { runSeedIfNeeded, runSeedV3IfNeeded } from "@/lib/seed";
import { modeForRole, MODE_INFO } from "@/lib/display";
import { LoadingIntro } from "./LoadingHouse";
import { ToastHost } from "./ToastHost";
import { InstallBanner } from "./InstallBanner";
import { Icon, type IconName } from "./Icon";
import type { User } from "@/types";

const TABS = [
  { href: "/", label: "홈", icon: "home" },
  { href: "/feed", label: "피드", icon: "feed" },
  { href: "/services", label: "서비스", icon: "services" },
  { href: "/profile", label: "내정보", icon: "user" },
] satisfies { href: string; label: string; icon: IconName }[];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    runSeedIfNeeded();
    runSeedV3IfNeeded();
    const u = getUser();
    setUser(u);
    setReady(true);
    if (u) setUnread(getUnreadCount(u.id));
  }, []);

  useEffect(() => {
    // 라우트 바뀔 때마다 알림 카운트 갱신
    if (user) setUnread(getUnreadCount(user.id));
  }, [pathname, user]);

  // 온보딩 페이지는 풀-스크린
  const isOnboarding = pathname === "/onboarding";

  return (
    <div className="app-shell flex flex-col">
      {!isOnboarding && (
        <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
          <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 min-[390px]:px-5 md:px-8">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-950 text-white shadow-sm">
                <Icon name="building" className="h-4 w-4" />
              </div>
              <span className="text-[14px] font-extrabold tracking-[-0.03em] text-slate-950 min-[390px]:text-[15px]">OFFICELINK</span>
            </Link>
            <div className="flex items-center gap-1">
              {ready && user && (
                <>
                  <Link href="/search" aria-label="검색" className="flex h-9 w-9 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100">
                    <Icon name="search" className="h-[19px] w-[19px]" />
                  </Link>
                  <Link href="/notifications" aria-label="알림" className="relative flex h-9 w-9 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100">
                    <Icon name="bell" className="h-[19px] w-[19px]" />
                    {unread > 0 && (
                      <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-600 px-1 text-[9px] font-bold text-white">
                        {unread > 9 ? "9+" : unread}
                      </span>
                    )}
                  </Link>
                  <Link href="/dm" aria-label="쪽지" className="hidden h-9 w-9 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 min-[390px]:flex">
                    <Icon name="message" className="h-[19px] w-[19px]" />
                  </Link>
                </>
              )}
              {ready && user ? (
                <Link
                  href="/profile"
                  className="ml-1 flex items-center"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                    {user.nickname.slice(0, 1)}
                  </span>
                </Link>
              ) : (
                <Link
                  href="/onboarding"
                  className="text-xs text-ink-600 font-semibold"
                >
                  시작하기
                </Link>
              )}
            </div>
          </div>
        </header>
      )}

      <main className={`flex-1 ${isOnboarding ? "" : "pb-20"} ${
        ready && user ? MODE_INFO[modeForRole(user.role)].fontClass : ""
      }`}>
        {ready ? children : <LoadingIntro />}
      </main>
      <ToastHost />
      <InstallBanner />

      {!isOnboarding && ready && user && (
        <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200/70 bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
          <div className="mx-auto flex h-[68px] w-full max-w-6xl px-3 md:px-8">
            {TABS.map((t) => {
              const active =
                t.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(t.href);
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  className={`relative flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-semibold transition ${
                    active
                      ? "text-indigo-600"
                      : "text-slate-400"
                  }`}
                >
                  <Icon name={t.icon} className="h-[21px] w-[21px]" strokeWidth={active ? 2.2 : 1.8} />
                  <span>{t.label}</span>
                  {active && <span className="absolute top-1.5 h-1 w-1 rounded-full bg-indigo-600" />}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
