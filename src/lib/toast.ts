"use client";

// 간단한 글로벌 토스트 시스템. localStorage 이벤트 + 커스텀 이벤트 사용.

export type ToastKind = "success" | "error" | "info" | "warning";

export interface ToastEvent {
  id: string;
  kind: ToastKind;
  title: string;
  description?: string;
  durationMs?: number;
}

const listeners = new Set<(t: ToastEvent) => void>();

export function showToast(t: Omit<ToastEvent, "id">) {
  const full: ToastEvent = { id: Math.random().toString(36).slice(2, 9), ...t };
  listeners.forEach((fn) => fn(full));
}

export function subscribeToast(fn: (t: ToastEvent) => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
