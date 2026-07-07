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
    if (user) setUnread(getUnreadCount(user.id));
  }, [pathname, user]);

  const isOnboarding = pathname === "/onboarding";

  return (
    <div className="app-shell flex flex-col">
      {!isOnboarding && (
        <header className="sticky top-0 z-30 border-b border-[#cfe5ee] bg-[#fbfdff]/86 backdrop-blur-xl">
          <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 min-[390px]:px-5 md:px-8">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-[#172033] via-[#315cff] to-[#55d6d2] text-white shadow-[0_10px_24px_rgba(49,92,255,0.2)]">
                <div className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#c9f26a]" />
                <Icon name="building" className="h-4.5 w-4.5" />
              </div>
              <div className="leading-none">
                <span className="block text-[15px] font-semibold tracking-[-0.03em] text-[#172033] min-[390px]:text-[16px]">
                  OFFICELINK
                </span>
                <span className="hidden text-[9px] font-bold uppercase tracking-[0.18em] text-[#315cff] min-[390px]:block">
                  urban grid
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-1">
              {ready && user && (
                <>
                  <Link
                    href="/search"
                    aria-label="검색"
                    className="flex h-9 w-9 items-center justify-center rounded-full text-[#476078] hover:bg-[#eff9ff]"
                  >
                    <Icon name="search" className="h-[19px] w-[19px]" />
                  </Link>
                  <Link
                    href="/notifications"
                    aria-label="알림"
                    className="relative flex h-9 w-9 items-center justify-center rounded-full text-[#476078] hover:bg-[#eff9ff]"
                  >
                    <Icon name="bell" className="h-[19px] w-[19px]" />
                    {unread > 0 && (
                      <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#c9f26a] px-1 text-[10px] font-bold text-[#172033]">
                        {unread > 9 ? "9+" : unread}
                      </span>
                    )}
                  </Link>
                  <Link
                    href="/dm"
                    aria-label="쪽지"
                    className="hidden h-9 w-9 items-center justify-center rounded-full text-[#476078] hover:bg-[#eff9ff] min-[390px]:flex"
                  >
                    <Icon name="message" className="h-[19px] w-[19px]" />
                  </Link>
                </>
              )}

              {ready && user ? (
                <Link href="/profile" className="ml-1 flex items-center">
                  <span className="flex h-8 w-8 items-center justify-center rounded-2xl border border-[#cfe5ee] bg-white text-[13px] font-semibold text-[#172033] shadow-sm">
                    {user.nickname.slice(0, 1)}
                  </span>
                </Link>
              ) : (
                <Link href="/onboarding" className="text-[13px] font-semibold text-[#172033]">
                  시작하기
                </Link>
              )}
            </div>
          </div>
        </header>
      )}

      <main
        className={`flex-1 ${isOnboarding ? "" : "pb-20"} ${
          ready && user ? MODE_INFO[modeForRole(user.role)].fontClass : ""
        }`}
      >
        {ready ? children : <LoadingIntro />}
      </main>
      <ToastHost />
      <InstallBanner />

      {!isOnboarding && ready && user && (
        <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-[#cfe5ee] bg-[#fbfdff]/88 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
          <div className="mx-auto flex h-[70px] w-full max-w-6xl px-3 md:px-8">
            {TABS.map((tab) => {
              const active =
                tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`relative flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-semibold transition ${
                    active ? "text-[#315cff]" : "text-[#7aa2b8]"
                  }`}
                >
                  {active && (
                    <span className="absolute top-2 h-1 w-7 rounded-full bg-gradient-to-r from-[#315cff] via-[#55d6d2] to-[#c9f26a]" />
                  )}
                  <Icon
                    name={tab.icon}
                    className="h-[21px] w-[21px]"
                    strokeWidth={active ? 2.25 : 1.8}
                  />
                  <span>{tab.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
