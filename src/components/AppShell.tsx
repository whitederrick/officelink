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
        <header className="sticky top-0 z-30 border-b border-[#dfe5dd] bg-[#fbfbf8]/90 backdrop-blur-xl">
          <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 min-[390px]:px-5 md:px-8">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#172033] text-white shadow-sm">
                <Icon name="building" className="h-4 w-4" />
              </div>
              <span className="text-[15px] font-semibold tracking-[-0.03em] text-[#172033] min-[390px]:text-[16px]">
                OFFICELINK
              </span>
            </Link>

            <div className="flex items-center gap-1">
              {ready && user && (
                <>
                  <Link
                    href="/search"
                    aria-label="검색"
                    className="flex h-9 w-9 items-center justify-center rounded-full text-[#4d5b68] hover:bg-[#eef2ed]"
                  >
                    <Icon name="search" className="h-[19px] w-[19px]" />
                  </Link>
                  <Link
                    href="/notifications"
                    aria-label="알림"
                    className="relative flex h-9 w-9 items-center justify-center rounded-full text-[#4d5b68] hover:bg-[#eef2ed]"
                  >
                    <Icon name="bell" className="h-[19px] w-[19px]" />
                    {unread > 0 && (
                      <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#172033] px-1 text-[10px] font-semibold text-white">
                        {unread > 9 ? "9+" : unread}
                      </span>
                    )}
                  </Link>
                  <Link
                    href="/dm"
                    aria-label="쪽지"
                    className="hidden h-9 w-9 items-center justify-center rounded-full text-[#4d5b68] hover:bg-[#eef2ed] min-[390px]:flex"
                  >
                    <Icon name="message" className="h-[19px] w-[19px]" />
                  </Link>
                </>
              )}

              {ready && user ? (
                <Link href="/profile" className="ml-1 flex items-center">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#cfd8cf] bg-white text-[13px] font-semibold text-[#172033]">
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
        <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-[#dfe5dd] bg-[#fbfbf8]/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
          <div className="mx-auto flex h-[68px] w-full max-w-6xl px-3 md:px-8">
            {TABS.map((tab) => {
              const active =
                tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`relative flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-semibold transition ${
                    active ? "text-[#172033]" : "text-[#7b877f]"
                  }`}
                >
                  <Icon
                    name={tab.icon}
                    className="h-[21px] w-[21px]"
                    strokeWidth={active ? 2.2 : 1.8}
                  />
                  <span>{tab.label}</span>
                  {active && (
                    <span className="absolute top-1.5 h-1 w-1 rounded-full bg-[#172033]" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
