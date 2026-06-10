"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="text-6xl mb-4">🧭</div>
      <h1 className="text-xl font-bold mb-1">길을 잃었어요</h1>
      <p className="text-sm text-gray-500 mb-6">
        찾으시는 페이지가 더 이상 없어요.
      </p>
      <Link
        href="/"
        className="h-11 px-5 inline-flex items-center bg-officelink-primary text-white text-sm font-semibold rounded-lg"
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
}
