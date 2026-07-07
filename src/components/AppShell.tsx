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
        <header className="sticky top-0 z-30 border-b border-[#e2e8f0] bg-white/86 backdrop-blur-xl">
          <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 md:px-8">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-2xl bg-[#111827] text-white shadow-[0_12px_28px_rgba(15,23,42,0.18)]">
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#38bdf8]" />
                <Icon name="building" className="h-[18px] w-[18px]" />
              </div>
              <div className="leading-none">
                <span className="block text-[16px] font-black tracking-[-0.04em] text-[#0f172a]">
                  OFFICELINK
                </span>
                <span className="hidden text-[9px] font-black uppercase tracking-[0.2em] text-[#2563eb] min-[390px]:block">
                  urban living
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-1">
              {ready && user && (
                <>
                  <Link
                    href="/search"
                    aria-label="검색"
                    className="flex h-9 w-9 items-center justify-center rounded-full text-[#475569] hover:bg-[#f1f5f9]"
                  >
                    <Icon name="search" className="h-[19px] w-[19px]" />
                  </Link>
                  <Link
                    href="/notifications"
                    aria-label="알림"
                    className="relative flex h-9 w-9 items-center justify-center rounded-full text-[#475569] hover:bg-[#f1f5f9]"
                  >
                    <Icon name="bell" className="h-[19px] w-[19px]" />
                    {unread > 0 && (
                      <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#38bdf8] px-1 text-[10px] font-black text-[#0f172a]">
                        {unread > 9 ? "9+" : unread}
                      </span>
                    )}
                  </Link>
                  <Link
                    href="/dm"
                    aria-label="메시지"
                    className="hidden h-9 w-9 items-center justify-center rounded-full text-[#475569] hover:bg-[#f1f5f9] min-[390px]:flex"
                  >
                    <Icon name="message" className="h-[19px] w-[19px]" />
                  </Link>
                </>
              )}

              {ready && user ? (
                <Link href="/profile" className="ml-1 flex items-center">
                  <span className="flex h-8 w-8 items-center justify-center rounded-2xl border border-[#e2e8f0] bg-white text-[13px] font-black text-[#0f172a] shadow-sm">
                    {user.nickname.slice(0, 1)}
                  </span>
                </Link>
              ) : (
                <Link href="/onboarding" className="text-[13px] font-bold text-[#0f172a]">
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
        <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-[#e2e8f0] bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
          <div className="mx-auto flex h-[70px] w-full max-w-6xl px-3 md:px-8">
            {TABS.map((tab) => {
              const active =
                tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`relative flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-bold transition ${
                    active ? "text-[#111827]" : "text-[#94a3b8]"
                  }`}
                >
                  {active && (
                    <span className="absolute top-2 h-1 w-7 rounded-full bg-gradient-to-r from-[#2563eb] to-[#38bdf8]" />
                  )}
                  <Icon
                    name={tab.icon}
                    className="h-[21px] w-[21px]"
                    strokeWidth={active ? 2.35 : 1.85}
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
