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
        <header className="sticky top-0 z-30 border-b border-[#eef0f3] bg-white/92 backdrop-blur-xl">
          <div className="mx-auto flex h-[60px] w-full max-w-3xl items-center justify-between px-5 md:px-8">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-[12px] bg-[#191f28] text-white">
                <Icon name="building" className="h-[17px] w-[17px]" />
              </div>
              <span className="text-[17px] font-extrabold tracking-[-0.04em] text-[#191f28]">
                OFFICELINK
              </span>
            </Link>

            <div className="flex items-center gap-1">
              {ready && user && (
                <>
                  <TopIcon href="/search" label="검색" icon="search" />
                  <Link
                    href="/notifications"
                    aria-label="알림"
                    className="relative flex h-9 w-9 items-center justify-center rounded-full text-[#4e5968] hover:bg-[#f2f4f6]"
                  >
                    <Icon name="bell" className="h-[19px] w-[19px]" />
                    {unread > 0 && (
                      <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#3182f6] px-1 text-[10px] font-extrabold text-white">
                        {unread > 9 ? "9+" : unread}
                      </span>
                    )}
                  </Link>
                  <TopIcon href="/dm" label="메시지" icon="message" hideOnSmall />
                </>
              )}

              {ready && user ? (
                <Link href="/profile" className="ml-1 flex items-center">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f2f4f6] text-[13px] font-extrabold text-[#191f28]">
                    {user.nickname.slice(0, 1)}
                  </span>
                </Link>
              ) : (
                <Link href="/onboarding" className="text-[14px] font-bold text-[#3182f6]">
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
        <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-[#eef0f3] bg-white/94 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
          <div className="mx-auto flex h-[68px] w-full max-w-3xl px-3 md:px-8">
            {TABS.map((tab) => {
              const active =
                tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-bold transition ${
                    active ? "text-[#3182f6]" : "text-[#8b95a1]"
                  }`}
                >
                  <Icon
                    name={tab.icon}
                    className="h-[21px] w-[21px]"
                    strokeWidth={active ? 2.4 : 1.9}
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

function TopIcon({
  href,
  label,
  icon,
  hideOnSmall = false,
}: {
  href: string;
  label: string;
  icon: IconName;
  hideOnSmall?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={`h-9 w-9 items-center justify-center rounded-full text-[#4e5968] hover:bg-[#f2f4f6] ${
        hideOnSmall ? "hidden min-[390px]:flex" : "flex"
      }`}
    >
      <Icon name={icon} className="h-[19px] w-[19px]" />
    </Link>
  );
}
