# 🏠 OFFICELINK — 오피셜링크

> **1인가구 오피스텔 라이프 플랫폼** — 건물 리뷰 · 임대료 관리 · 이웃 커뮤니티 · 외국인 단기임대

[![Status](https://img.shields.io/badge/Status-MVP_v0.6-yellow)]() [![Next.js](https://img.shields.io/badge/Next.js-14.2-black)]() [![TypeScript](https://img.shields.io/badge/TypeScript-0_errors-blue)]() [![Tests](https://img.shields.io/badge/Tests-30/30_passed-brightgreen)]() [![i18n](https://img.shields.io/badge/i18n-ko%2Fen%2Fja%2Fzh-green)]() [![PWA](https://img.shields.io/badge/PWA-Ready-purple)]()

---

## 💡 왜 만들었나

> "오피스텔 계약할 때 진짜 후기 어디서 봐? 입주하고 나면 뭐가 필요해?"

1인 가구가 오피스텔을 **고르고**, **살면서**, **이웃과 소통**하는 전 과정을 하나로 묶은 모바일 우선 PWA. 특히 **외국인 단기임대**를 메인으로 차별화.

---

## ✨ 핵심 기능

### 🏢 건물 / 거주지
- 건물 리뷰 (소음·채광·수압·관리·교통·치안 6축 별점)
- 건물 비교 (`/compare`)
- 건물 사진 갤러리 + 라이트박스
- 동네별 통계 / 랭킹 (`/neighborhoods`)
- 인기 건물 (`/buildings`)
- 지도 (`/map`) — SVG 기반

### 👤 사용자 모드
- **세입자** — 리뷰/글/댓글
- **집주인** — 임대료 수령 관리, 대시보드 (`/landlord-dashboard`)
- **관리소** — 관리비, 대시보드 (`/manager-dashboard`)
- 3가지 모드 자동 적용 + **senior-mode** (큰 글씨)

### 💬 커뮤니티
- 피드, 글, 댓글 (대댓글)
- 채널 (`/channel/c-1`)
- **그룹 채팅** (`/groups`, `/groups/[id]`) — 익명/공개
- **이벤트/모임** (`/events`, `/events/new`) — 카테고리 6종, 참가
- 쪽지 DM (`/dm`)
- 이웃 (`/neighbors`)

### 🌏 외국인 단기임대
- `/stays` — 1일~3개월 단기 거주 매물
- **4개국 (ko/en/ja/zh) 다국어 호스트 표시**
- 호스트 언어 필터
- 건물/위치/옵션 필터
- 매물 등록 (`/stays/new`)
- 가격 계산기

### 🛠 생활 도구
- 이사 체크리스트 (`/checklist`)
- 관리비 추적 (`/fees`)
- 통계 (`/stats`)
- 통 polls (`/polls`) — 익명 투표
- 해시태그 검색
- 북마크 / 좋아요 / 관심 거주지
- 알림 / DM

### 📱 PWA
- 오프라인 동작 (Service Worker)
- 홈 화면 추가 → 앱처럼 실행
- 푸시 알림 (로컬)
- 백그라운드 동기화 큐
- **공유 수신 (Share Target API)**
- iOS 가이드 / 설치 배너

### 🌐 i18n
- 4개국 자동 감지 (브라우저)
- 230+ 번역 키
- 즉시 토글, 영구 저장

---

## 📸 페이지 구성 (52개 화면)

### 메인
`/` `/onboarding` `/home` `/feed` `/profile` `/search`

### 건물
`/buildings` `/building/[id]` `/compare` `/neighborhoods` `/map`

### 리뷰/글
`/review/write` `/my-reviews` `/post/[id]` `/write` `/channel/[id]`

### 모드별
`/landlord/[id]` `/manager/[id]` `/landlord-dashboard` `/manager-dashboard` `/fees` `/rent`

### 커뮤니티
`/neighbors` `/groups` `/groups/[id]` `/events` `/events/new` `/dm` `/notifications`

### 단기임대
`/stays` `/stays/[id]` `/stays/new`

### 도구
`/checklist` `/stats` `/polls` `/as-request` `/favorite` `/liked` `/my-posts` `/my-reviews` `/bookmarks`

### 시스템
`/settings` `/help` `/notices` `/offline` `/report` `/share-target` `/blocked` `/notifications-log`

### API
`/api/buildings` `/api/buildings/[id]` `/api/polls` `/api/services` `/api/notices`

---

## 🛠 기술 스택

| 영역 | 스택 |
|---|---|
| 프레임워크 | **Next.js 14** (App Router) |
| 언어 | **TypeScript 5.5** (strict, 0 errors) |
| 스타일 | **Tailwind CSS 3.4** |
| 상태 | **React 18** (hooks) + Context |
| 데이터 | **localStorage** (MVP) |
| PWA | Service Worker + Web App Manifest |
| i18n | 커스텀 4개국 dict |
| 테스트 | **Vitest 1.6** + **React Testing Library** + jsdom |
| CI | GitHub Actions (workflow scope 토큰 필요) |
| 디자인 | "차가움 + 따뜻함" — concrete/warm/sage/ink/coral 5색 |

---

## 🏃‍♂️ 시작하기

```bash
# 1) 설치
git clone https://github.com/whitederrick/officelink.git
cd officelink
npm install --legacy-peer-deps

# 2) 개발 서버
npm run dev
# → http://localhost:3000

# 3) 빌드
npm run build
npm start

# 4) 테스트
npm test          # 30개 테스트
npm run test:watch # watch 모드
```

**브라우저**: Chrome/Edge/Safari 모바일 (480px 최적화), 데스크톱도 OK

**iPhone에서 앱처럼**: Safari → 공유 → "홈 화면에 추가"
**Android**: Chrome → 메뉴 → "홈 화면에 추가"

---

## 📂 프로젝트 구조

```
officelink/
├── src/
│   ├── app/              # Next App Router (52개 화면)
│   │   ├── api/          # 5개 API routes
│   │   ├── stays/        # 외국인 단기임대
│   │   ├── groups/       # 그룹 채팅
│   │   ├── events/       # 이벤트/모임
│   │   └── ...           # 모든 페이지
│   ├── components/       # AppShell, PageHeader, Charts, SwipeableRow, BottomSheet...
│   ├── lib/              # storage, i18n, pwa, hashtag, toast, infiniteScroll, pullToRefresh
│   └── types/            # TypeScript 타입 정의
├── public/
│   ├── manifest.webmanifest
│   ├── sw.js             # Service Worker
│   ├── icon-192.png      # PWA 아이콘
│   └── icon-512.png
├── vitest.config.ts
└── package.json
```

---

## 🎨 디자인 시스템

### 컬러 팔레트
- **Concrete** (`concrete-50 ~ 900`) — 차가운 회색 베이스
- **Warm** (`warm-300 ~ 700`) — 머스타드 (브랜드)
- **Sage** (`sage-50 ~ 700`) — 차분한 초록 (긍정)
- **Ink** (`ink-50 ~ 900`) — 깊은 남색 (텍스트/CTA)
- **Coral** (`coral-50 ~ 700`) — 따뜻한 코랄 (경고)

### 핵심 컴포넌트
- `<PageHeader>` — 일관된 상단
- `<EmptyState>` — 친근한 빈 상태 (4종 일러스트)
- `<LoadingHouse>` — 집 짓는 로딩 애니메이션
- `<SwipeableRow>` — 터치 스와이프
- `<BottomSheet>` — 모달 시트
- `<Charts>` — BarChart, Sparkline, StarBar, TagCloud
- `<InstallBanner>` — PWA 설치 안내

### i18n 구조
```
src/lib/i18n.ts
└── BASE: Record<key, {ko, en, ja, zh}>
    └── DICT: Record<Lang, Dict>
        └── getDict(lang) → Dict
```
타입 안전, 자동 감지, 4개국 즉시 전환.

---

## 🌐 다국어 (4개국)

| 키 | 한국어 | English | 日本語 | 中文 |
|---|---|---|---|---|
| home | 홈 | Home | ホーム | 首页 |
| search | 검색 | Search | 検索 | 搜索 |
| write | 글쓰기 | Write | 投稿 | 发帖 |
| profile | 프로필 | Profile | プロフィール | 个人 |
| notifications | 알림 | Notifications | 通知 | 通知 |
| settings | 설정 | Settings | 設定 | 设置 |
| myBuilding | 우리집 | My Home | 自宅 | 我的家 |

230+ 키, 자동 감지, 수동 토글.

---

## 🧪 테스트

```bash
npm test
```

```
✓ src/lib/storage.test.ts   (5 tests)
✓ src/lib/hashtag.test.ts   (5 tests)
✓ src/lib/i18n.test.ts      (8 tests)
✓ src/lib/pwa.test.ts       (10 tests)
✓ src/lib/access.test.ts    (2 tests)

Test Files  5 passed (5)
Tests       30 passed (30)
```

현재 저장소에는 GitHub Actions workflow가 없습니다. 로컬 검증은 다음 순서로 실행합니다:
- `npm test`
- `npm run build` (TypeScript + ESLint + Next.js production build)

---

## 📊 버전 히스토리

| 버전 | 내용 | 페이지 |
|---|---|---|
| **v0.1** | 초기 스캐폴딩 (Next + TS + Tailwind) | 5 |
| **v0.2** | localStorage, 빌딩 데이터, 시드 | 12 |
| **v0.3** | 18 페이지 풀세트 | 18 |
| **v0.3.1** | 15 페이지 추가 | 35 |
| **v0.3.2** | 리뷰 답글, 사진 일러스트, 라이트박스, senior-mode | 35 |
| **v0.3.3** | 대댓글, Web Share API | 35 |
| **v0.3.4** | 인기 건물, README | 35 |
| **v0.4** | 대시보드 + 차트 + 해시태그 + 투표 + i18n + API | 35 |
| **v0.5** | 스와이프 + 시트 + 무한스크롤 + 지도 + 임대료 + 4개국 i18n | 45 |
| **v0.6** | 단기임대 + 그룹채팅 + 이벤트 + PWA 풀세트 + 테스트 | **52** |

---

## 🌍 외국인 단기임대 — 차별화 포인트

한국 단기임대 시장은 **외국인 비즈니스 출장 / 워홀 / 유학** 시장을 위한 인프라가 부족. OFFICELINK는:

- **호스트가 4개국 중 가능한 언어 명시**
- **매물 설명 4개국 자동 작성/번역**
- **이용 규칙 4개국**
- **호스트 언어 필터** → 내 언어로 소통 가능한 매물만
- **비대면 체크인 가능 (월세 1일~)**
- **공과금/WiFi/가구 옵션 명확 표시**

---

## 🚧 로드맵

- [x] v0.5 — 모바일 인터랙션 (스와이프/시트/Pull-to-refresh)
- [x] v0.6 — PWA + 단기임대 + 그룹채팅 + 이벤트 + 테스트
- [ ] v0.7 — 마크다운 에디터 + 다크모드 + A11y 감사
- [ ] v0.8 — Vercel 배포 + 시연 자료
- [ ] v1.0 — 실제 백엔드 (사용자 인증, 서버 DB, FCM)
- [ ] v2.0 — 네이티브 앱 (Capacitor 래핑)

---

## 👤 만든 사람

**whitederrick** — 1인 가구를 위한 도구를 만드는 사람

---

## 📄 라이센스

MIT

---

## 🙏 감사의 말

- [Next.js](https://nextjs.org) — 최고의 React 프레임워크
- [Tailwind CSS](https://tailwindcss.com) — 디자인 토큰
- [Vitest](https://vitest.dev) — 빠른 테스트
- [PWA 공식 가이드](https://web.dev/progressive-web-apps/)

---

> **"오피스텔이 집이 되는 데 필요한 모든 것"** — OFFICELINK
