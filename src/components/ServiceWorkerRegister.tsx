"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return; // dev에서는 비활성
    navigator.serviceWorker
      .register("/sw.js")
      .catch(() => {
        // 조용히 실패
      });
  }, []);
  return null;
}
