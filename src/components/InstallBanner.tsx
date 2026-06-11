"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  isIOS,
  isStandalone,
  requestNotifPermission,
  hasNotifPermission,
  isOnline,
  onConnectivityChange,
  flushSyncQueue,
  dismissInstall,
  shouldShowInstall,
} from "@/lib/pwa";
import { showToast } from "@/lib/toast";

export function InstallBanner() {
  const [show, setShow] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [online, setOnline] = useState(true);
  const [deferred, setDeferred] = useState<any>(null);
  const [pending, setPending] = useState(0);

  useEffect(() => {
    // Defer install prompt capture
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    // Connectivity
    setOnline(isOnline());
    const off = onConnectivityChange((o) => {
      setOnline(o);
      if (o) {
        // Try flush
        flushSyncQueue().then((r) => {
          if (r.ok > 0) showToast({ kind: "success", title: `동기화 완료 ${r.ok}건` });
        });
      }
    });

    // Check pending sync
    try {
      const q = JSON.parse(localStorage.getItem("officelink:sync:queue") || "[]");
      setPending(q.length);
    } catch {}

    // Show banner after 5s (per design)
    const t = setTimeout(() => {
      if (shouldShowInstall() && !isStandalone()) setShow(true);
    }, 5000);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      off();
      clearTimeout(t);
    };
  }, []);

  if (isStandalone() || !show) return null;

  const onInstall = async () => {
    if (deferred) {
      deferred.prompt();
      const r = await deferred.userChoice;
      if (r.outcome === "accepted") {
        showToast({ kind: "success", title: "설치 완료!" });
        dismissInstall();
        setShow(false);
      }
    } else if (isIOS()) {
      setShowIOSGuide(true);
    } else {
      // Try ask notif permission
      const p = await requestNotifPermission();
      if (p === "granted") {
        showToast({ kind: "success", title: "알림이 활성화됐어요" });
      }
      setShow(false);
    }
  };

  if (showIOSGuide) {
    return (
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-[440px]">
        <div className="warm-card p-3 bg-ink-900 text-white shadow-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">📱</span>
            <div className="flex-1">
              <div className="text-sm font-bold">iPhone에서 설치</div>
              <div className="text-[11px] text-white/70">Safari에서:</div>
            </div>
            <button
              onClick={() => { dismissInstall(); setShow(false); setShowIOSGuide(false); }}
              className="text-white/60 text-lg px-1"
            >✕</button>
          </div>
          <ol className="text-xs space-y-1 text-white/90">
            <li>1. 하단 <strong>공유 버튼</strong> <span className="inline-block">⬆️</span> 탭</li>
            <li>2. <strong>"홈 화면에 추가"</strong> 선택</li>
            <li>3. 우측 상단 <strong>"추가"</strong> 탭</li>
          </ol>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-[440px]">
      <div className="warm-card p-3 bg-ink-900 text-white shadow-2xl">
        {!online && (
          <div className="text-[11px] text-coral-300 mb-2 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-coral-400 animate-pulse" />
            오프라인 모드 — 변경사항은 연결 시 자동 동기화
            {pending > 0 && <span className="ml-1">({pending}건 대기)</span>}
          </div>
        )}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-soft bg-warm-500 flex items-center justify-center text-xl shrink-0">
            🏠
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold">앱으로 설치</div>
            <div className="text-[11px] text-white/70 truncate">
              홈 화면에 추가 → 오프라인 + 빠른 접근
            </div>
          </div>
          <button
            onClick={onInstall}
            className="px-3 h-8 text-xs font-bold bg-warm-500 text-white rounded-pill shrink-0"
          >
            설치
          </button>
          <button
            onClick={() => { dismissInstall(); setShow(false); }}
            className="text-white/60 text-base px-1"
            aria-label="닫기"
          >✕</button>
        </div>
      </div>
    </div>
  );
}

export function OfflineIndicator() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    setOnline(isOnline());
    return onConnectivityChange(setOnline);
  }, []);
  if (online) return null;
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-coral-500 text-white text-xs text-center py-1 px-2">
      📵 오프라인 — 저장된 데이터로 작동 중
    </div>
  );
}
