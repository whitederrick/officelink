"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ReactNode } from "react";

interface Props {
  title: string;
  subtitle?: string;
  back?: "history" | "close" | "none";
  right?: ReactNode;
  /** 상단 sticky 헤더. transparent로 두면 그라디언트 위에 얹힘 */
  variant?: "default" | "transparent";
}

/**
 * 페이지 상단 표준 헤더.
 * - 뒤로가기 / 닫기 / 없음
 * - 가운데 제목 (+ 서브)
 * - 우측 액션 슬롯
 */
export function PageHeader({ title, subtitle, back = "history", right, variant = "default" }: Props) {
  const router = useRouter();
  const bg = variant === "transparent" ? "bg-transparent" : "bg-white/95 backdrop-blur border-b border-concrete-200";

  return (
    <header className={`sticky top-12 z-20 ${bg}`}>
      <div className="h-12 flex items-center justify-between px-2">
        <div className="w-12 flex items-center justify-start">
          {back === "history" && (
            <button
              onClick={() => router.back()}
              aria-label="뒤로가기"
              className="w-10 h-10 flex items-center justify-center text-lg text-concrete-700 active:bg-concrete-100 rounded-full"
            >
              ‹
            </button>
          )}
          {back === "close" && (
            <button
              onClick={() => router.back()}
              aria-label="닫기"
              className="w-10 h-10 flex items-center justify-center text-base text-concrete-700 active:bg-concrete-100 rounded-full"
            >
              ✕
            </button>
          )}
        </div>
        <div className="flex-1 min-w-0 text-center">
          <div className="text-sm font-semibold text-concrete-900 truncate">{title}</div>
          {subtitle && <div className="text-[11px] text-concrete-500 truncate">{subtitle}</div>}
        </div>
        <div className="w-12 flex items-center justify-end">{right}</div>
      </div>
    </header>
  );
}
