"use client";

/**
 * OFFICELINK 친근한 일러스트 모음
 * - 오피스텔/1인가구 라이프 컨셉
 * - 모두 순수 SVG, 외부 자산 0
 */

export function IllustEmpty({ size = 96 }: { size?: number }) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
      {/* 배경 */}
      <circle cx="60" cy="60" r="55" fill="#f8f9fb" />

      {/* 오피스텔 외벽 */}
      <rect x="30" y="50" width="60" height="50" rx="3" fill="#e5e8eb" />
      <rect x="27" y="46" width="66" height="6" rx="2" fill="#cdd3da" />

      {/* 빈 창문 (X 표시) */}
      {[0, 1, 2].map((row) =>
        [0, 1, 2].map((col) => {
          const x = 36 + col * 18;
          const y = 58 + row * 14;
          return (
            <g key={`${row}-${col}`}>
              <rect x={x} y={y} width="10" height="10" rx="1.5" fill="#ffffff" stroke="#cdd3da" strokeWidth="0.5" />
              <line x1={x + 2} y1={y + 2} x2={x + 8} y2={y + 8} stroke="#cdd3da" strokeWidth="0.8" />
              <line x1={x + 8} y1={y + 2} x2={x + 2} y2={y + 8} stroke="#cdd3da" strokeWidth="0.8" />
            </g>
          );
        }),
      )}

      {/* 출입문 */}
      <rect x="55" y="84" width="10" height="16" rx="1" fill="#cdd3da" />

      {/* Z Z Z (자는 표시) */}
      <text x="80" y="35" fontSize="9" fill="#9ba3ae" fontFamily="sans-serif" fontWeight="bold">Z</text>
      <text x="86" y="28" fontSize="7" fill="#9ba3ae" fontFamily="sans-serif" fontWeight="bold">Z</text>
      <text x="91" y="22" fontSize="5" fill="#9ba3ae" fontFamily="sans-serif" fontWeight="bold">z</text>
    </svg>
  );
}

export function IllustError({ size = 96 }: { size?: number }) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="55" fill="#fff1f2" />

      {/* 보일러 */}
      <rect x="38" y="40" width="44" height="50" rx="4" fill="#f43f5e" />
      <rect x="42" y="46" width="36" height="14" rx="1" fill="#ffffff" />
      <circle cx="50" cy="53" r="2" fill="#f43f5e" />
      <circle cx="58" cy="53" r="2" fill="#f43f5e">
        <animate attributeName="opacity" values="1;0.2;1" dur="1.5s" repeatCount="indefinite" />
      </circle>
      <rect x="42" y="66" width="36" height="6" rx="1" fill="#ffffff" opacity="0.6" />
      <rect x="42" y="76" width="24" height="6" rx="1" fill="#ffffff" opacity="0.6" />

      {/* 노란 경고 삼각형 */}
      <g transform="translate(75 30)">
        <path d="M10 0 L20 18 L0 18 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
        <text x="10" y="14" fontSize="12" fontWeight="bold" textAnchor="middle" fill="#7c2d12">!</text>
      </g>

      {/* 연기 */}
      <g transform="translate(40 28)">
        <circle cx="0" cy="0" r="3" fill="#e5e8eb" opacity="0.7">
          <animate attributeName="cy" values="0;-10" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.7;0" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="3" cy="-2" r="2.5" fill="#e5e8eb" opacity="0.5">
          <animate attributeName="cy" values="-2;-12" dur="2s" begin="0.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;0" dur="2s" begin="0.5s" repeatCount="indefinite" />
        </circle>
      </g>
    </svg>
  );
}

export function IllustSuccess({ size = 96 }: { size?: number }) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="55" fill="#f0fdf4" />

      {/* 오피스텔 외벽 */}
      <rect x="30" y="50" width="60" height="50" rx="3" fill="#10b981" />
      <rect x="27" y="46" width="66" height="6" rx="2" fill="#059669" />

      {/* 환하게 불 켜진 창문 */}
      {[0, 1, 2].map((row) =>
        [0, 1, 2].map((col) => {
          const x = 36 + col * 18;
          const y = 58 + row * 14;
          return (
            <g key={`${row}-${col}`}>
              <rect x={x} y={y} width="10" height="10" rx="1.5" fill="#fde68a" />
              <rect x={x} y={y} width="10" height="10" rx="1.5" fill="none" stroke="#047857" strokeWidth="0.5" />
            </g>
          );
        }),
      )}

      {/* 출입문 */}
      <rect x="55" y="84" width="10" height="16" rx="1" fill="#047857" />

      {/* 큰 체크 표시 */}
      <g transform="translate(60 60)">
        <circle cx="0" cy="0" r="18" fill="#ffffff" stroke="#10b981" strokeWidth="3" />
        <path
          d="M-8 0 L-2 6 L8 -5"
          fill="none"
          stroke="#10b981"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <animate
            attributeName="stroke-dasharray"
            values="0 30; 30 30"
            dur="0.5s"
            fill="freeze"
          />
        </path>
      </g>
    </svg>
  );
}

export function IllustWelcome({ size = 120 }: { size?: number }) {
  return (
    <svg viewBox="0 0 140 140" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
      <circle cx="70" cy="70" r="65" fill="#fffbeb" />

      {/* 큰 오피스텔 */}
      <rect x="35" y="55" width="70" height="60" rx="4" fill="#f59e0b" />
      <rect x="32" y="50" width="76" height="7" rx="2" fill="#d97706" />

      {/* 큰 창문 */}
      {[0, 1, 2].map((row) =>
        [0, 1, 2].map((col) => {
          const x = 42 + col * 20;
          const y = 64 + row * 15;
          return (
            <g key={`${row}-${col}`}>
              <rect x={x} y={y} width="12" height="11" rx="1.5" fill="#fde68a" />
              <rect x={x} y={y} width="12" height="11" rx="1.5" fill="none" stroke="#92400e" strokeWidth="0.5" />
            </g>
          );
        }),
      )}

      {/* 현관문 */}
      <rect x="65" y="96" width="12" height="19" rx="1" fill="#7c2d12" />
      <circle cx="74" cy="105" r="0.8" fill="#fbbf24" />

      {/* 입주민 캐릭터 (인사하는) */}
      <g transform="translate(15 95)">
        <circle cx="0" cy="0" r="6" fill="#fef3c7" />
        <circle cx="-1.5" cy="-1" r="0.6" fill="#1f2937" />
        <circle cx="1.5" cy="-1" r="0.6" fill="#1f2937" />
        <path d="M-2 2 Q0 4 2 2" stroke="#1f2937" strokeWidth="0.8" fill="none" strokeLinecap="round" />
        <rect x="-3" y="6" width="6" height="9" rx="1" fill="#3b82f6" />
        {/* 손 흔드는 애니메이션 */}
        <g transform="translate(4 8)">
          <circle cx="0" cy="0" r="1.5" fill="#fef3c7">
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="-20 0 0; 20 0 0; -20 0 0"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </circle>
        </g>
      </g>

      {/* 환영 꽃가루/하트 */}
      <text x="115" y="40" fontSize="14" fill="#f43f5e">💛</text>
      <text x="20" y="50" fontSize="10" fill="#f59e0b">✨</text>
    </svg>
  );
}

// 건물 사진 일러스트 (3종 - 건물 스타일별)
export function BuildingPhoto({ variant, size = 320 }: { variant: 1 | 2 | 3; size?: number }) {
  const variants = {
    1: { sky: "#dbeafe", wall: "#1f6feb", accent: "#1d4ed8", win: "#dbeafe" },
    2: { sky: "#fff7ed", wall: "#f59e0b", accent: "#d97706", win: "#fef3c7" },
    3: { sky: "#f0fdf4", wall: "#10b981", accent: "#059669", win: "#d1fae5" },
  };
  const v = variants[variant];

  return (
    <svg viewBox="0 0 320 200" width={size} height={size * 0.625} xmlns="http://www.w3.org/2000/svg">
      {/* 하늘 */}
      <rect x="0" y="0" width="320" height="200" fill={v.sky} />
      {/* 구름 */}
      <g opacity="0.6">
        <ellipse cx="60" cy="40" rx="25" ry="10" fill="#ffffff" />
        <ellipse cx="80" cy="35" rx="20" ry="8" fill="#ffffff" />
        <ellipse cx="240" cy="30" rx="22" ry="9" fill="#ffffff" />
        <ellipse cx="260" cy="36" rx="18" ry="7" fill="#ffffff" />
      </g>
      {/* 태양 */}
      <circle cx="280" cy="30" r="15" fill="#fcd34d">
        <animate attributeName="r" values="14;16;14" dur="3s" repeatCount="indefinite" />
      </circle>

      {/* 지면 */}
      <rect x="0" y="170" width="320" height="30" fill="#9ba3ae" />
      <rect x="0" y="170" width="320" height="3" fill="#6b7280" />

      {/* 메인 건물 */}
      <rect x="60" y="50" width="200" height="120" fill={v.wall} />
      <rect x="55" y="45" width="210" height="8" fill={v.accent} />

      {/* 창문들 */}
      {[0, 1, 2, 3].map((row) =>
        [0, 1, 2, 3, 4, 5].map((col) => {
          const x = 75 + col * 28;
          const y = 60 + row * 25;
          const lit = (row + col + variant) % 3 === 0;
          return (
            <g key={`${row}-${col}`}>
              <rect x={x} y={y} width="18" height="18" fill={lit ? "#fde68a" : v.win} />
              <rect x={x} y={y} width="18" height="18" fill="none" stroke={v.accent} strokeWidth="0.5" />
              {lit && (
                <circle cx={x + 9} cy={y + 9} r="1.5" fill={v.wall}>
                  <animate attributeName="opacity" values="0.3;1;0.3" dur={`${1.5 + (row + col) * 0.2}s`} repeatCount="indefinite" />
                </circle>
              )}
            </g>
          );
        }),
      )}

      {/* 현관문 */}
      <rect x="150" y="140" width="20" height="30" fill="#1f2937" />
      <circle cx="167" cy="155" r="0.8" fill="#fbbf24" />

      {/* 나무 */}
      <g transform="translate(20 130)">
        <rect x="0" y="20" width="4" height="20" fill="#7c2d12" />
        <circle cx="2" cy="15" r="10" fill="#10b981" />
      </g>
      <g transform="translate(295 130)">
        <rect x="0" y="20" width="4" height="20" fill="#7c2d12" />
        <circle cx="2" cy="15" r="10" fill="#10b981" />
      </g>

      {/* 택배 트럭 (살짝) */}
      <g transform="translate(0 160)">
        <rect x="240" y="0" width="20" height="10" rx="1" fill="#1f6feb" />
        <rect x="232" y="2" width="8" height="8" rx="0.5" fill="#3b82f6" />
        <circle cx="237" cy="11" r="2" fill="#1f2937" />
        <circle cx="252" cy="11" r="2" fill="#1f2937" />
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0 0; 15 0; 0 0"
          dur="8s"
          repeatCount="indefinite"
        />
      </g>
    </svg>
  );
}
