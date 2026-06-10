"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getUnreadCount, getUser } from "@/lib/storage";
import { runSeedIfNeeded, runSeedV3IfNeeded } from "@/lib/seed";
import { modeForRole, MODE_INFO } from "@/lib/display";
import { LoadingIntro } from "./LoadingHouse";
import type { User } from "@/types";

const TABS = [
  { href: "/", label: "홈", icon: "🏠" },
  { href: "/feed", label: "피드", icon: "📰" },
  { href: "/services", label: "서비스", icon: "🛎" },
  { href: "/profile", label: "내정보", icon: "👤" },
];

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
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-concrete-200">
          <div className="flex items-center justify-between px-4 h-12">
            <Link href="/" className="font-bold text-base tracking-tight flex items-center gap-1.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-warm-500 to-warm-600 flex items-center justify-center text-white text-[11px] font-bold">
                OL
              </div>
              <span className="text-concrete-900">OFFICELINK</span>
            </Link>
            <div className="flex items-center gap-3">
              {ready && user && (
                <>
                  <Link href="/search" aria-label="검색" className="text-base text-concrete-600 active:text-warm-500">
                    🔍
                  </Link>
                  <Link href="/notifications" aria-label="알림" className="relative text-base text-concrete-600">
                    🔔
                    {unread > 0 && (
                      <span className="absolute -top-1 -right-2 min-w-[16px] h-[16px] px-1 rounded-full bg-coral-500 text-white text-[9px] font-bold flex items-center justify-center">
                        {unread > 9 ? "9+" : unread}
                      </span>
                    )}
                  </Link>
                  <Link href="/dm" aria-label="쪽지" className="text-base text-concrete-600">
                    💬
                  </Link>
                </>
              )}
              {ready && user ? (
                <Link
                  href="/profile"
                  className="text-xs text-concrete-500 hover:text-concrete-900 flex items-center gap-1"
                >
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                    user.role === "tenant" ? "bg-warm-50 text-warm-700" :
                    user.role === "landlord" ? "bg-ink-50 text-ink-700" :
                    "bg-sage-50 text-sage-700"
                  }`}>
                    {MODE_INFO[modeForRole(user.role)].label}
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

      {!isOnboarding && ready && user && (
        <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur border-t border-concrete-200">
          <div className="app-shell flex">
            {TABS.map((t) => {
              const active =
                t.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(t.href);
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] transition ${
                    active
                      ? "text-warm-600 font-semibold"
                      : "text-concrete-500"
                  }`}
                >
                  <span className={`text-xl leading-none ${active ? "" : ""}`}>{t.icon}</span>
                  <span>{t.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
