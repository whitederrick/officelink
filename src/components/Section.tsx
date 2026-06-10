"use client";

import { ReactNode } from "react";

interface Props {
  title?: string;
  description?: string;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
  padded?: boolean;
}

/** 카드/리스트 섹션의 표준 컨테이너 */
export function Section({ title, description, right, children, className = "", padded = true }: Props) {
  return (
    <section className={className}>
      {(title || right) && (
        <div className="flex items-baseline justify-between mb-2 px-1">
          <div>
            {title && <h2 className="text-sm font-bold text-concrete-900">{title}</h2>}
            {description && <p className="text-[11px] text-concrete-500 mt-0.5">{description}</p>}
          </div>
          {right}
        </div>
      )}
      <div className={padded ? "" : ""}>{children}</div>
    </section>
  );
}

/** 카드 — 따뜻한 카드 톤 통일 */
export function Card({
  children,
  className = "",
  onClick,
  href,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  href?: string;
}) {
  const base = `warm-card p-4 ${onClick || href ? "active:scale-[0.99] transition cursor-pointer" : ""} ${className}`;
  if (href) {
    return <Link href={href} className={base}>{children}</Link>;
  }
  if (onClick) {
    return <button onClick={onClick} className={`${base} w-full text-left`}>{children}</button>;
  }
  return <div className={base}>{children}</div>;
}

import Link from "next/link";
