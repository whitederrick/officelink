/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // 오피스텔 차가움 (콘크리트/스틸) — 기본 베이스
        concrete: {
          50: "#f8f9fb",
          100: "#f1f3f5",
          200: "#e5e8eb",
          300: "#cdd3da",
          400: "#9ba3ae",
          500: "#6b7280",
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937",
          900: "#0d1117",
        },
        // 따뜻함 1: 머스타드 (앰버) — 핵심 CTA, 평점, 임대인 모드
        warm: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
        },
        // 따뜻함 2: 세이지 (신뢰 + 식물) — 관리소, 긍정
        sage: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          400: "#4ade80",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
        },
        // 따뜻함 3: 코랄 (주목/따뜻) — 알림, 호들갑 안 한 경고
        coral: {
          50: "#fff1f2",
          100: "#ffe4e6",
          400: "#fb7185",
          500: "#f43f5e",
          600: "#e11d48",
        },
        // 메인 브랜드 — 딥블루 (시각적 신뢰)
        ink: {
          50: "#eff6ff",
          100: "#dbeafe",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          900: "#1e3a8a",
        },
        // OFFICELINK 토큰 alias (기존 코드 호환)
        officelink: {
          primary: "#1f6feb", // 기존 primary (ink-600에 가까움)
          warm: "#f59e0b",
          sage: "#10b981",
          coral: "#f43f5e",
          ink: "#1f2937",
          light: "#f6f8fa",
          border: "#d0d7de",
        },
      },
      fontFamily: {
        // 기본: 따뜻하고 둥글둥글한 폰트
        sans: ['"Pretendard"', '"Apple SD Gothic Neo"', "system-ui", "-apple-system", "sans-serif"],
        // 임대인/관리소용: 더 또렷한 폰트 (큰 글씨용)
        display: ['"Pretendard"', '"Apple SD Gothic Neo"', "system-ui", "sans-serif"],
      },
      fontSize: {
        // 임대인/관리소 화면용 큰 텍스트
        'senior': ['1.125rem', { lineHeight: '1.7' }],
        'senior-lg': ['1.375rem', { lineHeight: '1.6' }],
        'senior-xl': ['1.75rem', { lineHeight: '1.5' }],
      },
      borderRadius: {
        'soft': '0.75rem',
        'pill': '9999px',
      },
      boxShadow: {
        'warm': '0 2px 12px -2px rgba(245, 158, 11, 0.15)',
        'ink': '0 2px 12px -2px rgba(31, 111, 235, 0.12)',
      },
    },
  },
  plugins: [],
};
