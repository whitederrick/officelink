"use client";

import type { UserRole } from "@/types";

const ROLE_STYLE: Record<UserRole, { label: string; bg: string; fg: string }> = {
  tenant: { label: "임차인", bg: "bg-blue-50", fg: "text-blue-700" },
  landlord: { label: "임대인", bg: "bg-amber-50", fg: "text-amber-700" },
  manager: { label: "관리인", bg: "bg-emerald-50", fg: "text-emerald-700" },
};

export function RoleBadge({ role, size = "sm" }: { role: UserRole; size?: "sm" | "xs" }) {
  const s = ROLE_STYLE[role];
  const sz = size === "xs" ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-0.5";
  return (
    <span className={`inline-block rounded-full font-medium ${s.bg} ${s.fg} ${sz}`}>
      {s.label}
    </span>
  );
}
