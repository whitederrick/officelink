"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Pull-to-refresh — 모바일에서 당겨서 새로고침
 */
export function usePullToRefresh(onRefresh: () => Promise<void> | void) {
  const [pulling, setPulling] = useState(false);
  const [distance, setDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const THRESHOLD = 70;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onTouchStart = (e: TouchEvent) => {
      if (window.scrollY > 0) return; // 스크롤 중이면 무시
      startY.current = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (refreshing) return;
      if (window.scrollY > 0) return;
      const dy = e.touches[0].clientY - startY.current;
      if (dy > 0) {
        setPulling(true);
        setDistance(Math.min(dy * 0.5, 100));
      }
    };
    const onTouchEnd = async () => {
      if (refreshing) return;
      if (distance >= THRESHOLD) {
        setRefreshing(true);
        try {
          await onRefresh();
        } finally {
          setRefreshing(false);
        }
      }
      setPulling(false);
      setDistance(0);
    };
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [distance, refreshing, onRefresh]);

  return { pulling, distance, refreshing, threshold: THRESHOLD };
}
