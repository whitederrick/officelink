"use client";

import { ReactNode, useEffect } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  height?: "auto" | "half" | "full";
}

/**
 * 모바일 하단 시트 (Bottom Sheet)
 */
export function BottomSheet({ open, onClose, title, children, height = "auto" }: Props) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const hClass =
    height === "full" ? "h-[90vh]" : height === "half" ? "h-[60vh]" : "max-h-[80vh]";

  return (
    <div className="fixed inset-0 z-[300] flex items-end justify-center">
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-black/50 animate-fade-in"
        onClick={onClose}
      />
      {/* 시트 */}
      <div
        className={`relative w-full max-w-[480px] bg-white rounded-t-2xl ${hClass} flex flex-col animate-slide-up`}
      >
        {/* 핸들 */}
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 bg-concrete-300 rounded-pill" />
        </div>
        {title && (
          <div className="flex items-center justify-between px-4 py-2 border-b border-concrete-100">
            <h2 className="text-base font-bold text-concrete-900">{title}</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-concrete-500 active:bg-concrete-100 rounded-full"
            >
              ✕
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  );
}
