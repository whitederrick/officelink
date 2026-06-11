"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-white">
      <svg viewBox="0 0 140 140" width={140} height={140} className="mb-3">
        {/* 배경 */}
        <circle cx="70" cy="70" r="65" fill="#f8f9fb" />

        {/* 오피스텔 외벽 */}
        <rect x="35" y="55" width="70" height="60" rx="4" fill="#e5e8eb" />
        <rect x="32" y="50" width="76" height="7" rx="2" fill="#cdd3da" />

        {/* X 표시 창문 */}
        {[0, 1, 2].map((row) =>
          [0, 1, 2].map((col) => {
            const x = 42 + col * 20;
            const y = 64 + row * 15;
            return (
              <g key={`${row}-${col}`}>
                <rect x={x} y={y} width="12" height="11" rx="1.5" fill="#ffffff" stroke="#cdd3da" strokeWidth="0.5" />
                <line x1={x + 2} y1={y + 2} x2={x + 10} y2={y + 9} stroke="#cdd3da" strokeWidth="0.8" />
                <line x1={x + 10} y1={y + 2} x2={x + 2} y2={y + 9} stroke="#cdd3da" strokeWidth="0.8" />
              </g>
            );
          }),
        )}

        {/* 문 */}
        <rect x="65" y="96" width="12" height="19" rx="1" fill="#cdd3da" />

        {/* 떠도는 "?" */}
        <text x="20" y="40" fontSize="20" fontWeight="bold" fill="#f59e0b" fontFamily="sans-serif">?</text>
        <text x="115" y="60" fontSize="14" fontWeight="bold" fill="#f59e0b" fontFamily="sans-serif">?</text>
        <text x="105" y="100" fontSize="16" fontWeight="bold" fill="#1f6feb" fontFamily="sans-serif">?</text>

        {/* 404 텍스트 */}
        <text x="70" y="135" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#9ba3ae" fontFamily="sans-serif">404</text>
      </svg>
      <h1 className="text-xl font-bold text-concrete-900 mb-2">길을 잃었어요</h1>
      <p className="text-sm text-concrete-500 mb-6 max-w-[280px]">
        찾으시는 페이지가 더 이상 없어요. 다른 동네 소식 둘러보러 가볼까요?
      </p>
      <div className="flex gap-2">
        <Link
          href="/"
          className="h-11 px-5 text-sm font-semibold bg-warm-500 text-white rounded-soft"
        >
          🏠 홈으로
        </Link>
        <Link
          href="/buildings"
          className="h-11 px-5 text-sm font-medium bg-white border border-concrete-200 text-concrete-700 rounded-soft flex items-center"
        >
          🏢 건물 보기
        </Link>
      </div>
    </div>
  );
}
