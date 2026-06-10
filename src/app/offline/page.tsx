"use client";

import Link from "next/link";
import { EmptyState } from "@/components/EmptyState";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-white">
      <EmptyState
        kind="custom"
        emoji="📡"
        title="오프라인이에요"
        description="인터넷에 연결되어 있지 않아요.\n연결되면 자동으로 다시 연결돼요."
        action={{ label: "다시 시도", onClick: () => typeof window !== "undefined" && window.location.reload() }}
        secondary={{ label: "홈으로", href: "/" }}
      />
    </div>
  );
}
