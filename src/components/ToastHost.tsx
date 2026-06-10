"use client";

import { useEffect, useState } from "react";
import { subscribeToast, ToastEvent } from "@/lib/toast";

const KIND_STYLE = {
  success: "bg-sage-500 text-white",
  error: "bg-coral-500 text-white",
  info: "bg-ink-600 text-white",
  warning: "bg-warm-500 text-white",
};

const KIND_ICON = {
  success: "✓",
  error: "✕",
  info: "i",
  warning: "!",
};

export function ToastHost() {
  const [items, setItems] = useState<ToastEvent[]>([]);

  useEffect(() => {
    const unsub = subscribeToast((t) => {
      setItems((prev) => [...prev, t]);
      const ms = t.durationMs ?? 2400;
      setTimeout(() => {
        setItems((prev) => prev.filter((x) => x.id !== t.id));
      }, ms);
    });
    return () => {
      unsub();
    };
  }, []);

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none px-4 w-full max-w-[480px]">
      {items.map((t) => (
        <div
          key={t.id}
          className={`${KIND_STYLE[t.kind]} rounded-soft shadow-lg px-4 py-3 flex items-center gap-2 pointer-events-auto animate-[slideDown_0.2s_ease-out]`}
        >
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
            {KIND_ICON[t.kind]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold">{t.title}</div>
            {t.description && (
              <div className="text-xs opacity-90 mt-0.5">{t.description}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
