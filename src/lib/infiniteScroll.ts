"use client";

import { useEffect, useRef, useState } from "react";

/**
 * 무한 스크롤 — IntersectionObserver 기반
 */
export function useInfiniteScroll<T>(items: T[], pageSize = 20) {
  const [count, setCount] = useState(pageSize);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setCount((c) => Math.min(c + pageSize, items.length));
        }
      },
      { rootMargin: "200px" },
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [items.length, pageSize]);

  return {
    visible: items.slice(0, count),
    hasMore: count < items.length,
    sentinelRef: ref,
  };
}
