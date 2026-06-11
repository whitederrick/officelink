"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-white">
      <svg viewBox="0 0 120 120" width={100} height={100} className="mb-3">
        <circle cx="60" cy="60" r="55" fill="#fff1f2" />
        <text x="60" y="78" textAnchor="middle" fontSize="60" fontWeight="bold" fill="#f43f5e">!</text>
      </svg>
      <h2 className="text-lg font-bold text-concrete-900 mb-1">이 페이지에 문제가 있어요</h2>
      <p className="text-sm text-concrete-500 mb-4">잠시 후 다시 시도해주세요.</p>
      <div className="flex gap-2">
        <button
          onClick={reset}
          className="h-10 px-4 text-sm font-semibold bg-warm-500 text-white rounded-soft"
        >
          다시 시도
        </button>
        <Link
          href="/"
          className="h-10 px-4 text-sm font-medium bg-white border border-concrete-200 text-concrete-700 rounded-soft flex items-center"
        >
          홈으로
        </Link>
      </div>
    </div>
  );
}
