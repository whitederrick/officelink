import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  isOnline,
  getSyncQueue,
  enqueueSync,
  clearSyncQueue,
  isIOS,
  isStandalone,
  getShareTargetPayload,
} from "./pwa";

describe("pwa", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe("isOnline", () => {
    it("returns true when navigator.onLine is true", () => {
      Object.defineProperty(navigator, "onLine", { value: true, configurable: true });
      expect(isOnline()).toBe(true);
    });

    it("returns false when offline", () => {
      Object.defineProperty(navigator, "onLine", { value: false, configurable: true });
      expect(isOnline()).toBe(false);
    });
  });

  describe("sync queue", () => {
    it("starts empty", () => {
      expect(getSyncQueue()).toEqual([]);
    });

    it("enqueues and retrieves", () => {
      enqueueSync({ type: "like", payload: { postId: "p-1", liked: true } });
      enqueueSync({ type: "post", payload: { content: "hi" } });
      const q = getSyncQueue();
      expect(q).toHaveLength(2);
      expect(q[0].type).toBe("like");
      expect(q[1].type).toBe("post");
    });

    it("clears queue", () => {
      enqueueSync({ type: "post", payload: {} });
      enqueueSync({ type: "comment", payload: {} });
      clearSyncQueue();
      expect(getSyncQueue()).toEqual([]);
    });

    it("persists across reads", () => {
      enqueueSync({ type: "review", payload: { id: "r1" } });
      expect(getSyncQueue()[0].payload).toEqual({ id: "r1" });
    });
  });

  describe("device detection", () => {
    it("isIOS detects iPhone", () => {
      Object.defineProperty(navigator, "userAgent", {
        value: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)",
        configurable: true,
      });
      expect(isIOS()).toBe(true);
    });

    it("isIOS returns false for Android", () => {
      Object.defineProperty(navigator, "userAgent", {
        value: "Mozilla/5.0 (Linux; Android 14)",
        configurable: true,
      });
      expect(isIOS()).toBe(false);
    });
  });

  describe("getShareTargetPayload", () => {
    it("parses URL params", () => {
      Object.defineProperty(window, "location", {
        value: { search: "?title=hi&text=hello&url=https://x.com" },
        configurable: true,
      });
      const p = getShareTargetPayload();
      expect(p?.title).toBe("hi");
      expect(p?.text).toBe("hello");
      expect(p?.url).toBe("https://x.com");
    });

    it("returns null when no share params", () => {
      Object.defineProperty(window, "location", {
        value: { search: "" },
        configurable: true,
      });
      expect(getShareTargetPayload()).toBeNull();
    });
  });
});
