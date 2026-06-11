"use client";

import { useEffect, useState } from "react";
import { showToast } from "@/lib/toast";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const K_DISMISSED = "officelink:pwa:dismissed";

export function InstallBanner() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const dismissed = window.localStorage.getItem(K_DISMISSED);
    if (dismissed) return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      // 5초 후 배너 표시
      setTimeout(() => setShow(true), 5000);
    };

    window.addEventListener("beforeinstallprompt", onPrompt);

    // 이미 standalone이면 표시 안함
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
    };
  }, []);

  const onInstall = async () => {
    if (!deferred) {
      showToast({ kind: "info", title: "브라우저 메뉴에서 '홈 화면에 추가'를 선택하세요" });
      return;
    }
    deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === "accepted") {
      showToast({ kind: "success", title: "앱이 추가되었어요!" });
    }
    setShow(false);
  };

  const onDismiss = () => {
    window.localStorage.setItem(K_DISMISSED, "1");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[90] w-full max-w-[480px] px-3 animate-slide-up">
      <div className="bg-white border border-warm-200 rounded-soft p-3 shadow-lg flex items-center gap-2">
        <div className="w-10 h-10 rounded-soft bg-gradient-to-br from-warm-400 to-warm-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
          OL
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-concrete-900">앱으로 설치</div>
          <div className="text-[11px] text-concrete-500">홈 화면에서 바로 실행</div>
        </div>
        <button
          onClick={onInstall}
          className="h-8 px-3 text-xs font-semibold bg-warm-500 text-white rounded-pill"
        >
          설치
        </button>
        <button
          onClick={onDismiss}
          className="w-7 h-7 flex items-center justify-center text-concrete-400"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
