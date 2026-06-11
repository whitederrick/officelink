"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <html lang="ko">
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-white">
          <svg viewBox="0 0 120 120" width={120} height={120} className="mb-4">
            <circle cx="60" cy="60" r="55" fill="#fff1f2" />
            <rect x="30" y="40" width="60" height="50" rx="4" fill="#f43f5e" />
            <rect x="42" y="48" width="36" height="10" rx="1" fill="#ffffff" />
            <circle cx="50" cy="53" r="1.5" fill="#f43f5e" />
            <circle cx="58" cy="53" r="1.5" fill="#f43f5e">
              <animate attributeName="opacity" values="1;0.2;1" dur="1.5s" repeatCount="indefinite" />
            </circle>
            <path d="M 75 30 L 95 18 L 95 30 L 90 35 L 80 35 L 75 30 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
            <text x="85" y="30" fontSize="12" fontWeight="bold" textAnchor="middle" fill="#7c2d12">!</text>
          </svg>
          <h1 className="text-xl font-bold text-concrete-900 mb-2">앗, 문제가 생겼어요</h1>
          <p className="text-sm text-concrete-500 mb-6 text-center max-w-[280px]">
            페이지를 새로고침하거나 잠시 후 다시 시도해주세요.
          </p>
          <div className="flex gap-2">
            <button
              onClick={reset}
              className="h-11 px-5 text-sm font-semibold bg-warm-500 text-white rounded-soft"
            >
              🔄 다시 시도
            </button>
            <Link
              href="/"
              className="h-11 px-5 text-sm font-medium bg-white border border-concrete-200 text-concrete-700 rounded-soft flex items-center"
            >
              홈으로
            </Link>
          </div>
          {error?.message && (
            <details className="mt-6 text-[11px] text-concrete-400 max-w-[320px]">
              <summary className="cursor-pointer">에러 상세</summary>
              <pre className="mt-2 p-2 bg-concrete-50 rounded text-[10px] overflow-auto">
                {error.message}
              </pre>
            </details>
          )}
        </div>
      </body>
    </html>
  );
}
