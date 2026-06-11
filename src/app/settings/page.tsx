"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  clearUser,
  getUser,
  resetAll,
} from "@/lib/storage";
import { PageHeader } from "@/components/PageHeader";
import { LoadingIntro } from "@/components/LoadingHouse";
import { getLang, setLang } from "@/lib/i18n";

const SETTINGS_KEY = "officelink:settings";

interface Settings {
  pushLike: boolean;
  pushComment: boolean;
  pushNotice: boolean;
  pushDM: boolean;
  theme: "light" | "dark" | "auto";
  seniorMode: boolean;
  hcMode: boolean;
}

const DEFAULT: Settings = {
  pushLike: true,
  pushComment: true,
  pushNotice: true,
  pushDM: true,
  theme: "light",
  seniorMode: false,
  hcMode: false,
};

function loadSettings(): Settings {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const s = window.localStorage.getItem(SETTINGS_KEY);
    if (s) return { ...DEFAULT, ...JSON.parse(s) };
  } catch {}
  return DEFAULT;
}
function saveSettings(s: Settings) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  // 시각적 모드 즉시 적용
  document.documentElement.classList.toggle("senior-mode-global", s.seniorMode);
  document.documentElement.classList.toggle("hc-mode", s.hcMode);
  applyTheme(s.theme);
}

function applyTheme(theme: "light" | "dark" | "auto") {
  if (typeof document === "undefined") return;
  const resolved =
    theme === "auto"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : theme;
  document.documentElement.setAttribute("data-theme", resolved);
  document.documentElement.style.colorScheme = resolved;
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`w-11 h-6 rounded-pill transition relative ${
        on ? "bg-warm-500" : "bg-concrete-300"
      }`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
          on ? "left-[22px]" : "left-0.5"
        }`}
      />
    </button>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [user, setU] = useState<ReturnType<typeof getUser>>(null);
  const [s, setS] = useState<Settings>(DEFAULT);

  useEffect(() => {
    setMounted(true);
    const u = getUser();
    if (!u) {
      router.replace("/onboarding");
      return;
    }
    setU(u);
    const cur = loadSettings();
    setS(cur);
    applyTheme(cur.theme);
  }, [router]);

  const update = (patch: Partial<Settings>) => {
    const next = { ...s, ...patch };
    setS(next);
    saveSettings(next);
  };

  if (!mounted || !user) return <LoadingIntro />;

  const onReset = () => {
    if (!confirm("모든 데이터를 삭제하고 처음부터 시작할까요?")) return;
    resetAll();
    clearUser();
    router.replace("/onboarding");
  };

  const onLogout = () => {
    if (!confirm("로그아웃할까요? (저장된 데이터는 유지돼요)")) return;
    clearUser();
    router.replace("/onboarding");
  };

  return (
    <div className="bg-white min-h-screen">
      <PageHeader title="설정" back="history" />

      {/* 알림 */}
      <section className="px-4 pt-3">
        <h2 className="text-xs font-semibold text-concrete-500 mb-2">🔔 알림</h2>
        <div className="warm-card divide-y divide-concrete-100">
          <Row
            label="좋아요 알림"
            description="내 글에 좋아요를 누르면"
            control={<Toggle on={s.pushLike} onChange={(v) => update({ pushLike: v })} />}
          />
          <Row
            label="댓글 알림"
            description="내 글에 댓글이 달리면"
            control={<Toggle on={s.pushComment} onChange={(v) => update({ pushComment: v })} />}
          />
          <Row
            label="공지 알림"
            description="건물/앱 공지가 올라오면"
            control={<Toggle on={s.pushNotice} onChange={(v) => update({ pushNotice: v })} />}
          />
          <Row
            label="쪽지 알림"
            description="쪽지가 도착하면"
            control={<Toggle on={s.pushDM} onChange={(v) => update({ pushDM: v })} />}
          />
        </div>
      </section>

      {/* 화면 */}
      <section className="px-4 pt-4">
        <h2 className="text-xs font-semibold text-concrete-500 mb-2">🖥 화면</h2>
        <div className="warm-card divide-y divide-concrete-100">
          <div className="p-3 flex items-center gap-3">
            <div className="flex-1">
              <div className="text-sm font-medium text-concrete-900">테마</div>
              <div className="text-[11px] text-concrete-500 mt-0.5">라이트/다크/시스템</div>
            </div>
            <select
              value={s.theme}
              onChange={(e) => update({ theme: e.target.value as any })}
              className="text-xs h-9 px-2 border border-concrete-200 rounded-soft bg-white"
            >
              <option value="light">☀️ 라이트</option>
              <option value="dark">🌙 다크</option>
              <option value="auto">⚙️ 시스템</option>
            </select>
          </div>
          <Row
            label="큰 글씨 모드"
            description="글자/버튼을 더 크게 (어르신 친화)"
            control={<Toggle on={s.seniorMode} onChange={(v) => update({ seniorMode: v })} />}
          />
          <Row
            label="고대비 모드"
            description="배경 흰색, 글자 검정 (시력 보호)"
            control={<Toggle on={s.hcMode} onChange={(v) => update({ hcMode: v })} />}
          />
        </div>
      </section>

      {/* 앱 정보 */}
      <section className="px-4 pt-4">
        <h2 className="text-xs font-semibold text-concrete-500 mb-2">🌐 언어 / 앱 정보</h2>
        <div className="warm-card divide-y divide-concrete-100">
          <div className="p-3 flex items-center gap-3">
            <div className="flex-1">
              <div className="text-sm font-medium text-concrete-900">언어 (Language)</div>
              <div className="text-[11px] text-concrete-500 mt-0.5">한국어 / English</div>
            </div>
            <select
              value={getLang()}
              onChange={(e) => setLang(e.target.value as "ko" | "en")}
              className="text-xs h-9 px-2 border border-concrete-200 rounded-soft bg-white"
            >
              <option value="ko">🇰🇷 한국어</option>
              <option value="en">🇺🇸 English</option>
            </select>
          </div>
        </div>
      </section>

      <section className="px-4 pt-2">
        <h2 className="text-xs font-semibold text-concrete-500 mb-2">ℹ️ 앱 정보</h2>
        <div className="warm-card divide-y divide-concrete-100">
          <LinkRow label="공지사항" href="/notices" />
          <LinkRow label="도움말" href="/help" />
          <LinkRow label="이용약관" href="#" />
          <LinkRow label="개인정보 처리방침" href="#" />
          <div className="p-3 flex items-center justify-between">
            <span className="text-sm text-concrete-700">버전</span>
            <span className="text-sm text-concrete-500">v0.3.0 (demo)</span>
          </div>
        </div>
      </section>

      {/* 계정 */}
      <section className="px-4 pt-4 pb-6 space-y-2">
        <h2 className="text-xs font-semibold text-concrete-500 mb-2">👤 계정</h2>
        <button
          onClick={onLogout}
          className="w-full h-12 text-sm font-medium text-concrete-700 bg-white border border-concrete-200 rounded-soft active:bg-concrete-50"
        >
          로그아웃
        </button>
        <button
          onClick={onReset}
          className="w-full h-12 text-sm font-medium text-coral-600 bg-coral-50 border border-coral-100 rounded-soft active:bg-coral-100"
        >
          🗑️ 모든 데이터 초기화
        </button>
      </section>
    </div>
  );
}

function Row({ label, description, control }: { label: string; description?: string; control?: React.ReactNode }) {
  return (
    <div className="p-3 flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-concrete-900">{label}</div>
        {description && <div className="text-[11px] text-concrete-500 mt-0.5">{description}</div>}
      </div>
      {control}
    </div>
  );
}

function LinkRow({ label, href }: { label: string; href: string }) {
  return (
    <a href={href} className="p-3 flex items-center justify-between active:bg-concrete-50">
      <span className="text-sm text-concrete-900">{label}</span>
      <span className="text-concrete-400">›</span>
    </a>
  );
}
