"use client";

/**
 * OFFICELINK 로딩 일러스트
 *
 * 따뜻한 톤의 작은 오피스텔 + 움직이는 디테일:
 * - 창문에서 빛이 깜빡 (사람이 집에 있음)
 * - 굴뚝/창문에서 연기가 천천히 올라감
 * - 택배가 문 앞으로 천천히 이동
 * - 발코니 화분이 살랑살랑
 *
 * 모두 순수 SVG + CSS keyframes. 외부 자산 없음.
 */
export function LoadingHouse({ size = 120 }: { size?: number }) {
  return (
    <div
      className="inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      role="status"
      aria-label="로딩 중"
    >
      <svg
        viewBox="0 0 120 120"
        width={size}
        height={size}
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        {/* 배경 원 */}
        <circle cx="60" cy="60" r="55" fill="#fffbeb" />
        <circle cx="60" cy="60" r="55" fill="none" stroke="#fde68a" strokeWidth="1.5" strokeDasharray="3 4">
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 60 60"
            to="360 60 60"
            dur="20s"
            repeatCount="indefinite"
          />
        </circle>

        {/* 집 본체 */}
        <g>
          {/* 지면 */}
          <ellipse cx="60" cy="100" rx="42" ry="3" fill="#f3f4f6" />

          {/* 본체 (오피스텔) */}
          <rect x="30" y="50" width="60" height="50" rx="3" fill="#f59e0b" />
          <rect x="30" y="50" width="60" height="50" rx="3" fill="url(#shade)" opacity="0.3" />

          {/* 지붕/옥상 */}
          <rect x="27" y="46" width="66" height="6" rx="2" fill="#d97706" />

          {/* 창문들 (3x3) */}
          {[0, 1, 2].map((row) =>
            [0, 1, 2].map((col) => {
              const x = 36 + col * 18;
              const y = 58 + row * 14;
              const isLit = (row + col) % 2 === 0;
              return (
                <g key={`${row}-${col}`}>
                  <rect x={x} y={y} width="10" height="10" rx="1.5" fill={isLit ? "#fde68a" : "#fef3c7"} />
                  <rect x={x} y={y} width="10" height="10" rx="1.5" fill="none" stroke="#b45309" strokeWidth="0.5" />
                  {isLit && (
                    <circle cx={x + 5} cy={y + 5} r="1" fill="#f59e0b">
                      <animate
                        attributeName="opacity"
                        values="0.3;1;0.3"
                        dur={`${2 + (row + col) * 0.4}s`}
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}
                </g>
              );
            }),
          )}

          {/* 출입문 */}
          <rect x="55" y="84" width="10" height="16" rx="1" fill="#7c2d12" />
          <circle cx="63" cy="92" r="0.8" fill="#fbbf24" />

          {/* 발코니 화분 */}
          <g transform="translate(78 84)">
            <rect x="0" y="0" width="6" height="5" rx="0.5" fill="#92400e" />
            <path d="M1 0 Q3 -3 5 0" fill="#10b981">
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="-3 3 2; 3 3 2; -3 3 2"
                dur="3s"
                repeatCount="indefinite"
              />
            </path>
          </g>
        </g>

        {/* 굴뚝 연기 */}
        <g transform="translate(85 30)">
          <circle cx="0" cy="0" r="3" fill="#e5e8eb" opacity="0.8">
            <animate
              attributeName="cy"
              values="0;-15"
              dur="2.5s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="cx"
              values="0;3"
              dur="2.5s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.8;0"
              dur="2.5s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="r"
              values="3;5"
              dur="2.5s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="-2" cy="-5" r="2.5" fill="#e5e8eb" opacity="0.6">
            <animate
              attributeName="cy"
              values="-5;-22"
              dur="2.5s"
              begin="0.8s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.6;0"
              dur="2.5s"
              begin="0.8s"
              repeatCount="indefinite"
            />
          </circle>
        </g>

        {/* 택배 트럭 (오른쪽에서 왼쪽으로 천천히) */}
        <g>
          <animateTransform
            attributeName="transform"
            type="translate"
            values="20 0; -20 0; 20 0"
            dur="6s"
            repeatCount="indefinite"
          />
          <rect x="80" y="92" width="14" height="8" rx="1" fill="#1f6feb" />
          <rect x="74" y="94" width="6" height="6" rx="0.5" fill="#3b82f6" />
          <circle cx="78" cy="101" r="1.5" fill="#1f2937" />
          <circle cx="89" cy="101" r="1.5" fill="#1f2937" />
          <rect x="82" y="89" width="4" height="4" rx="0.3" fill="#f59e0b" />
        </g>

        <defs>
          <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.2" />
            <stop offset="1" stopColor="#000000" stopOpacity="0.1" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

/**
 * 친근한 인트로 — 첫 로딩이나 큰 페이지 전환용
 */
export function LoadingIntro({ message = "잠시만요, 동네를 살펴보고 있어요…" }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <LoadingHouse size={140} />
      <p className="mt-4 text-sm text-concrete-500 animate-pulse">{message}</p>
    </div>
  );
}

/**
 * 인라인 작은 로더 (스피너)
 */
export function LoadingDots({ tone = "warm" }: { tone?: "warm" | "ink" | "sage" | "neutral" }) {
  const cls = {
    warm: "bg-warm-500",
    ink: "bg-ink-600",
    sage: "bg-sage-500",
    neutral: "bg-concrete-400",
  }[tone];
  return (
    <div className="inline-flex items-center gap-1" role="status" aria-label="로딩">
      <span className={`w-1.5 h-1.5 rounded-full ${cls} animate-bounce`} style={{ animationDelay: "0ms" }} />
      <span className={`w-1.5 h-1.5 rounded-full ${cls} animate-bounce`} style={{ animationDelay: "150ms" }} />
      <span className={`w-1.5 h-1.5 rounded-full ${cls} animate-bounce`} style={{ animationDelay: "300ms" }} />
    </div>
  );
}
