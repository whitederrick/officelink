"use client";

import { ReactNode, useRef, useState } from "react";

interface Props {
  children: ReactNode;
  onSwipeLeft?: () => void; // 좋아요
  onSwipeRight?: () => void; // 저장
  leftLabel?: string;
  rightLabel?: string;
  leftColor?: string;
  rightColor?: string;
  threshold?: number;
}

/**
 * 모바일 스와이프 인터랙션
 * - 왼쪽으로 스와이프 → onSwipeLeft (좋아요)
 * - 오른쪽으로 스와이프 → onSwipeRight (저장)
 */
export function SwipeableRow({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftLabel = "👍 좋아요",
  rightLabel = "⭐ 저장",
  leftColor = "bg-warm-500",
  rightColor = "bg-ink-600",
  threshold = 80,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [dx, setDx] = useState(0);
  const [animating, setAnimating] = useState(false);

  const startX = useRef(0);
  const startY = useRef(0);
  const locked = useRef<"h" | "v" | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    if (animating) return;
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    locked.current = null;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (animating) return;
    const tx = e.touches[0].clientX;
    const ty = e.touches[0].clientY;
    const ddx = tx - startX.current;
    const ddy = ty - startY.current;

    if (locked.current === null) {
      if (Math.abs(ddx) > Math.abs(ddy)) {
        locked.current = "h";
      } else if (Math.abs(ddy) > 5) {
        locked.current = "v";
        return;
      }
    }
    if (locked.current === "h") {
      e.preventDefault();
      setDx(Math.max(-200, Math.min(200, ddx)));
    }
  };

  const onTouchEnd = () => {
    if (animating) return;
    if (Math.abs(dx) >= threshold) {
      setAnimating(true);
      if (dx < 0 && onSwipeLeft) {
        setDx(-300);
        setTimeout(() => {
          onSwipeLeft();
          setDx(0);
          setAnimating(false);
        }, 220);
      } else if (dx > 0 && onSwipeRight) {
        setDx(300);
        setTimeout(() => {
          onSwipeRight();
          setDx(0);
          setAnimating(false);
        }, 220);
      } else {
        setDx(0);
      }
    } else {
      setDx(0);
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* 배경 액션 */}
      <div className="absolute inset-0 flex">
        <div className={`${rightColor} flex-1 flex items-center justify-end pr-6 text-white font-semibold text-sm`}>
          {dx > 10 && rightLabel}
        </div>
        <div className={`${leftColor} flex-1 flex items-center justify-start pl-6 text-white font-semibold text-sm`}>
          {dx < -10 && leftLabel}
        </div>
      </div>
      {/* 메인 콘텐츠 */}
      <div
        ref={ref}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          transform: `translateX(${dx}px)`,
          transition: animating ? "transform 0.22s ease-out" : "none",
        }}
        className="relative bg-white touch-pan-y"
      >
        {children}
      </div>
    </div>
  );
}
