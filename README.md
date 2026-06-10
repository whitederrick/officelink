# OFFICELINK 🏠

> **1인가구 오피스텔 라이프 플랫폼** — 거주지 리뷰 · 집주인/관리소 평가 · 생활 편의 서비스

[![Live](https://img.shields.io/badge/Status-MVP-yellow)]()
[![Next](https://img.shields.io/badge/Next-14-black)]()
[![TS](https://img.shields.io/badge/TypeScript-5-blue)]()
[![PWA](https://img.shields.io/badge/PWA-ready-purple)]()

## ✨ 컨셉

**OFFICELINK**는 오피스텔에 사는 **1인가구**를 위한 올인원 라이프 플랫폼이야.

- **🏠 거주지 리뷰** — 별점 5개(소음/청결/시설/관리/안전) + 한줄평 + 상세 + 장/단점 태그 + 사진
- **⭐ 평판 시스템** — 임대인/관리소 평판 페이지 (응답률, 태그별 평점, 보유 건물)
- **🛎 편의 서비스** — 청소/이사/AS/택배/인터넷/대출/식사 8개 카테고리 12개 업체
- **💬 익명 커뮤니티** — 건물/동 단위 채널 + 댓글 + DM
- **📋 생활 도구** — 이사 체크리스트, 활동 통계, 업적

## 👥 3가지 디스플레이 모드

자동으로 사용자 역할에 맞춰:

| 모드 | 대상 | 톤 | 인터페이스 |
|---|---|---|---|
| 🧑 **임차인** | 1인가구 2030 | 따뜻한 머스타드 | 풀-UI, 빠른 인터랙션 |
| 🏢 **임대인** | 40-60대 | 차분한 딥블루 + **큰 글씨** | 명확한 버튼, 단계별 |
| 🔧 **관리인** | 보수적 | 차분한 세이지 + **큰 글씨** | 한 번에 하나씩, 친절한 가이드 |

## 🎨 디자인 시스템

**"차가움 + 따뜻함 공존"** — 오피스텔 차가움 + 우리 서비스 따뜻함

| 토큰 | 용도 |
|---|---|
| `concrete` (스틸/회색) | 기본 베이스 |
| `warm` (머스타드) | 핵심 CTA, 평점, 강조 |
| `sage` (세이지) | 관리소, 긍정, 장점 |
| `ink` (딥블루) | 임대인, 정보성, 신뢰 |
| `coral` (코랄) | 알림, 따뜻한 경고 |

다크모드 + 고대비 모드 + 큰 글씨 모드 지원.

## 🛠 기술 스택

- **Next.js 14** (App Router)
- **TypeScript** (strict)
- **Tailwind CSS** (커스텀 디자인 토큰)
- **localStorage** 기반 데이터 (백엔드 0, MVP)
- **PWA** (manifest + 서비스워커 + 오프라인)
- **Web Share API**

## 🚀 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`

## 📱 페이지 (35개)

### 🏠 홈/탐색 (7)
- `/` `/home` `/feed` `/search` `/buildings` `/bookmarks` `/liked` `/favorite`

### 🏢 건물/리뷰 (5)
- `/building/[id]` `/buildings` `/review/write` `/compare` `/neighbors`

### ⭐ 평판 (2)
- `/landlord/[id]` `/manager/[id]`

### 🛎 서비스 (3)
- `/services` `/services/[category]` `/service/[id]`

### 💬 커뮤니티 (4)
- `/channel/[id]` `/write` `/post/[id]` `/my-posts`

### 📩 소통 (3)
- `/notifications` `/dm` `/dm/[peerId]`

### 👤 계정/도구 (10)
- `/profile` `/settings` `/help` `/notices` `/as-request`
- `/checklist` `/stats` `/my-reviews` `/report` `/offline`

### 시작
- `/onboarding` (2단계: 닉네임+역할 / 주소)

## 🧩 핵심 컴포넌트

- `AppShell` — 헤더 + 하단 탭바 + 모드 자동 적용
- `PageHeader` — 표준 상단 헤더
- `EmptyState` — 친근한 빈 상태 (4종 일러스트)
- `Button` / `LinkButton` — 버튼 표준화
- `Section` / `Card` — 컨테이너
- `LoadingHouse` — 움직이는 오피스텔 로딩 (SVG + CSS)
- `Illustrations` — 빈/에러/성공/환영/건물사진
- `ImagePicker` — base64 이미지 첨부
- `Lightbox` — 이미지 풀스크린 뷰어
- `ToastHost` — 글로벌 토스트
- `PostCard` / `RoleBadge`

## 📊 시드 데이터

- 건물 **5개** (마포구 상암/성산/연남)
- 리뷰 **12개** (실거주 후기)
- 임대인/관리소 **4명** (평판/응답률)
- 편의 업체 **12개** (8개 카테고리)
- 게시글 **10개** + 댓글/좋아요/북마크
- 알림 **3개** + 공지 **4개** + 리뷰답글 **3개**

## 🛠 주요 기능 (v0.3.4)

### 핵심
- 익명 닉네임 + 3자 역할
- 주소 등록 → 자동 채널 개설 (오피스텔 + 동)
- 건물 리뷰 5개 항목별 별점 + 장/단점 태그
- 임대인/관리소 평판 페이지
- 편의 서비스 마켓 (8개 카테고리)
- DM / 알림 / 댓글 + 대댓글

### UI/UX
- 움직이는 일러스트 로딩
- 4종 빈 상태 일러스트
- 글로벌 토스트 알림
- 다크모드 (라이트/다크/시스템)
- 고대비 모드 + 큰 글씨 모드
- 라이트박스 (이미지 풀스크린)
- 이사 체크리스트 (16개, 진행률)
- 활동 통계 + 업적 시스템

### 기술
- PWA (홈화면 설치)
- 서비스워커 (오프라인)
- Web Share API
- Base64 이미지 첨부 (게시글/리뷰)
- 18개 시드 + 라이브 localStorage

## 📦 데이터 모델

`User`, `Address`, `Channel`, `Post`, `Comment`, `Notification`, `DMMessage`,
`Building`, `Review`, `Profile`, `Service`, `BuildingLink`, `ReviewReply`,
`ASRequest`, `Notice`, `Report`, `FavoriteService`

---

OFFICELINK MVP · v0.3.4 · 2024
