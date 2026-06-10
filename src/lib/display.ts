// 사용자 역할에 따라 디스플레이 모드/토큰을 결정

import type { UserRole } from "@/types";

export type DisplayMode = "tenant" | "landlord" | "manager";

export const MODE_INFO: Record<
  DisplayMode,
  {
    label: string;
    description: string;
    ctaText: string; // 주요 CTA
    hero: "warm" | "cool" | "sage";
    emoji: string;
    fontClass: string; // 추가 클래스 (큰 글씨)
  }
> = {
  tenant: {
    label: "임차인 모드",
    description: "1인가구 라이프",
    ctaText: "리뷰 작성",
    hero: "warm",
    emoji: "🧑",
    fontClass: "",
  },
  landlord: {
    label: "임대인 모드",
    description: "건물 운영",
    ctaText: "리뷰 답글",
    hero: "cool",
    emoji: "🏢",
    fontClass: "senior-mode",
  },
  manager: {
    label: "관리소 모드",
    description: "민원 · AS",
    ctaText: "민원 확인",
    hero: "sage",
    emoji: "🔧",
    fontClass: "senior-mode",
  },
};

export function modeForRole(role: UserRole): DisplayMode {
  return role;
}

export const heroClass: Record<"warm" | "cool" | "sage", string> = {
  warm: "bg-soft-gradient",
  cool: "bg-cool-gradient",
  sage: "bg-warm-gradient",
};
