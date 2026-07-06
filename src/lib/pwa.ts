// PWA 헬퍼 — 알림 스케줄링, 설치, 동기화 큐, 오프라인 감지
// - Push API 미사용 (FCM 키 불필요) → 로컬 Notification + showNotification
// - 백그라운드 동기화 큐 (오프라인일 때 작업 보관 → 온라인 시 flush)

const K_NOTIF_PERM = "officelink:notif:perm";
const K_NOTIF_LOG = "officelink:notif:log";
const K_SYNC_QUEUE = "officelink:sync:queue";
const K_INSTALL = "officelink:pwa:dismissed";

export type SyncAction =
  | { type: "review"; payload: any }
  | { type: "post"; payload: any }
  | { type: "comment"; payload: any }
  | { type: "like"; payload: { postId: string; liked: boolean } };

// === SW 등록 ===
export async function registerSW(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined") return null;
  if (!("serviceWorker" in navigator)) return null;
  if (process.env.NODE_ENV !== "production") {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((registration) => registration.unregister()));
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith("officelink-"))
          .map((key) => caches.delete(key)),
      );
    }
    return null;
  }
  try {
    const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    return reg;
  } catch (e) {
    console.warn("SW register failed", e);
    return null;
  }
}

// === 설치 가능 여부 ===
export function isInstallAvailable(): boolean {
  if (typeof window === "undefined") return false;
  return !window.matchMedia("(display-mode: standalone)").matches && !localStorage.getItem(K_INSTALL);
}

export function dismissInstall() {
  localStorage.setItem(K_INSTALL, "1");
}

export function shouldShowInstall(): boolean {
  if (!isInstallAvailable()) return false;
  if (localStorage.getItem(K_INSTALL)) return false;
  return true;
}

// === 알림 권한 ===
export async function requestNotifPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) return "denied";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  const r = await Notification.requestPermission();
  localStorage.setItem(K_NOTIF_PERM, r);
  return r;
}

export function getNotifPermission(): NotificationPermission {
  if (typeof window === "undefined" || !("Notification" in window)) return "denied";
  return Notification.permission;
}

export function hasNotifPermission(): boolean {
  return getNotifPermission() === "granted";
}

// === SW 통해 알림 표시 (앱이 닫혀도 동작) ===
export async function showLocalNotification(opts: {
  title: string;
  body: string;
  url?: string;
  tag?: string;
  requireInteraction?: boolean;
  scheduledAt?: number; // 미래 시점 → setTimeout으로 지연
}) {
  if (typeof window === "undefined") return;
  if (!hasNotifPermission()) return;
  if (opts.scheduledAt && opts.scheduledAt > Date.now()) {
    const delay = Math.min(opts.scheduledAt - Date.now(), 24 * 3600 * 1000);
    setTimeout(() => showLocalNotification({ ...opts, scheduledAt: undefined }), delay);
    return;
  }
  const reg = await navigator.serviceWorker?.ready;
  if (!reg) return;
  reg.showNotification(opts.title, {
    body: opts.body,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    tag: opts.tag || "officelink",
    data: opts.url || "/",
    requireInteraction: opts.requireInteraction || false,
  });
  appendNotifLog({ title: opts.title, body: opts.body, time: Date.now() });
}

interface NotifEntry { title: string; body: string; time: number; }
function appendNotifLog(e: NotifEntry) {
  const arr = readArr<NotifEntry>(K_NOTIF_LOG);
  arr.unshift(e);
  if (arr.length > 50) arr.length = 50;
  writeArr(K_NOTIF_LOG, arr);
}
export function getNotifLog(): NotifEntry[] {
  return readArr<NotifEntry>(K_NOTIF_LOG);
}
export function clearNotifLog() {
  localStorage.removeItem(K_NOTIF_LOG);
}

// === 온라인 감지 ===
export function isOnline(): boolean {
  if (typeof navigator === "undefined") return true;
  return navigator.onLine;
}

export function onConnectivityChange(cb: (online: boolean) => void) {
  if (typeof window === "undefined") return () => {};
  const on = () => cb(true);
  const off = () => cb(false);
  window.addEventListener("online", on);
  window.addEventListener("offline", off);
  return () => {
    window.removeEventListener("online", on);
    window.removeEventListener("offline", off);
  };
}

// === 백그라운드 동기화 큐 ===
export function enqueueSync(action: SyncAction) {
  const arr = readArr<SyncAction>(K_SYNC_QUEUE);
  arr.push(action);
  writeArr(K_SYNC_QUEUE, arr);
}

export function getSyncQueue(): SyncAction[] {
  return readArr<SyncAction>(K_SYNC_QUEUE);
}

export function clearSyncQueue() {
  localStorage.removeItem(K_SYNC_QUEUE);
}

export async function flushSyncQueue(): Promise<{ ok: number; fail: number }> {
  const arr = getSyncQueue();
  if (arr.length === 0) return { ok: 0, fail: 0 };
  if (!isOnline()) return { ok: 0, fail: arr.length };
  let ok = 0, fail = 0;
  for (const action of arr) {
    try {
      // 실제 API는 없으므로 시뮬레이션 — 성공 처리
      await new Promise((r) => setTimeout(r, 50));
      ok++;
    } catch {
      fail++;
    }
  }
  clearSyncQueue();
  return { ok, fail };
}

// === Background Sync API (가능하면) ===
export async function requestBackgroundSync(tag = "officelink-sync"): Promise<boolean> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return false;
  try {
    const reg = await navigator.serviceWorker.ready;
    if ("sync" in reg) {
      // @ts-ignore — sync is experimental
      await reg.sync.register(tag);
      return true;
    }
  } catch {
    // ignore
  }
  return false;
}

// === Share Target 수신 ===
export function getShareTargetPayload(): { title?: string; text?: string; url?: string } | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const title = params.get("title");
  const text = params.get("text");
  const url = params.get("url");
  if (!title && !text && !url) return null;
  return { title: title || undefined, text: text || undefined, url: url || undefined };
}

// === iOS 감지 ===
export function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPad|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
}

export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // @ts-ignore
    window.navigator.standalone === true
  );
}

function readArr<T>(k: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(k) || "[]");
  } catch {
    return [];
  }
}
function writeArr<T>(k: string, v: T[]) {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {}
}
