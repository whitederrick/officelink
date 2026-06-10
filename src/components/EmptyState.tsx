"use client";

import { ReactNode } from "react";
import { IllustEmpty, IllustError, IllustSuccess } from "./Illustrations";
import { LinkButton } from "./Button";

type Kind = "empty" | "error" | "success" | "custom";

interface Props {
  kind?: Kind;
  emoji?: string; // kind="custom"일 때 사용
  illustrationSize?: number;
  title: string;
  description?: string;
  action?: { label: string; href?: string; onClick?: () => void };
  secondary?: { label: string; href?: string; onClick?: () => void };
  tone?: "neutral" | "warm" | "sage" | "ink" | "coral";
  children?: ReactNode;
}

const TONE_BG = {
  neutral: "bg-concrete-50 text-concrete-500",
  warm: "bg-warm-50 text-warm-600",
  sage: "bg-sage-50 text-sage-600",
  ink: "bg-ink-50 text-ink-600",
  coral: "bg-coral-50 text-coral-600",
};

export function EmptyState({
  kind = "empty",
  emoji,
  illustrationSize = 120,
  title,
  description,
  action,
  secondary,
  tone = "neutral",
  children,
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-16">
      {kind === "empty" && <IllustEmpty size={illustrationSize} />}
      {kind === "error" && <IllustError size={illustrationSize} />}
      {kind === "success" && <IllustSuccess size={illustrationSize} />}
      {kind === "custom" && emoji && (
        <div className={`w-24 h-24 rounded-full ${TONE_BG[tone]} flex items-center justify-center text-5xl mb-4`}>
          {emoji}
        </div>
      )}
      <h3 className="text-base font-bold text-concrete-900 mb-1 mt-4">{title}</h3>
      {description && (
        <p className="text-sm text-concrete-500 max-w-[280px] leading-relaxed mb-5">{description}</p>
      )}
      {children}
      {(action || secondary) && (
        <div className="flex flex-col items-center gap-2 mt-2 w-full max-w-[260px]">
          {action && (
            action.href ? (
              <LinkButton href={action.href} full size="md" variant="primary">
                {action.label}
              </LinkButton>
            ) : (
              <button
                onClick={action.onClick}
                className="h-11 px-4 w-full inline-flex items-center justify-center text-sm font-semibold bg-warm-500 text-white rounded-soft shadow-warm active:bg-warm-600"
              >
                {action.label}
              </button>
            )
          )}
          {secondary && (
            secondary.href ? (
              <LinkButton href={secondary.href} full size="md" variant="secondary">
                {secondary.label}
              </LinkButton>
            ) : (
              <button
                onClick={secondary.onClick}
                className="h-11 px-4 w-full inline-flex items-center justify-center text-sm font-medium bg-white text-concrete-700 border border-concrete-200 rounded-soft active:bg-concrete-50"
              >
                {secondary.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
