# OFFICELINK 🏠

> 1인가구 오피스텔 라이프 플랫폼 — 거주지 리뷰 · 집주인/관리소 평가 · 생활 편의 서비스

## ✨ 컨셉

- **임차인 (1인가구 2030)**: 오피스텔/건물 리뷰, 동네 글, 1인 가구 맞춤 서비스
- **임대인 (40-60대)**: 건물 평판 관리, 세입자 리뷰 답글, 운영 매뉴얼
- **관리소 (보수적)**: AS 접수, 민원 응대, 공지, 시설 관리

## 🎨 디자인 컨셉: "차가움 + 따뜻함 공존"

- **베이스**: 콘크리트/스틸 톤 (오피스텔 차가움)
- **포인트**: 머스타드/앰버 (따뜻함)
- **신뢰**: 딥블루 (정보성)
- **긍정**: 세이지 (관리소)
- **주목**: 코랄 (알림)

3가지 디스플레이 모드 자동 적용: 임차인/임대인/관리소

## 🛠 기술 스택

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** (커스텀 토큰)
- **localStorage** 기반 데이터 (백엔드 없음, MVP)

## 🚀 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000` 열기

## 📱 페이지 (28개)

| 카테고리 | 페이지 |
|---|---|
| **시작** | `/onboarding` |
| **홈/탐색** | `/` `/home` `/feed` `/search` `/buildings` `/bookmarks` `/liked` `/favorite` |
| **건물/리뷰** | `/building/[id]` `/review/write` `/compare` |
| **평판** | `/landlord/[id]` `/manager/[id]` |
| **서비스** | `/services` `/services/[category]` `/service/[id]` |
| **커뮤니티** | `/channel/[id]` `/write` `/post/[id]` `/my-posts` |
| **소통** | `/notifications` `/dm` `/dm/[peerId]` |
| **계정/기타** | `/profile` `/settings` `/help` `/as-request` `/notices` `/my-reviews` `/report` |

## 🧩 핵심 컴포넌트

- `PageHeader` — 표준 상단 헤더 (뒤로/제목/액션)
- `EmptyState` — 친근한 빈 상태 (일러스트 + 액션)
- `Button` / `LinkButton` — 버튼 표준화
- `Section` / `Card` — 섹션/카드 컨테이너
- `LoadingHouse` — 움직이는 오피스텔 로딩 일러스트
- `Illustrations` — 빈/에러/성공/환영 4종 일러스트
- `PostCard` — 게시글 카드
- `RoleBadge` — 역할 뱃지

## 📊 시드 데이터

- 건물 5개 (마포구)
- 리뷰 12개
- 임대인/관리소 프로필 4개
- 편의 서비스 12개 (8개 카테고리)
- 게시글 10개 + 알림 3개 + 공지 4개 + 리뷰 답글 3개

## 📦 데이터 모델

`User`, `Address`, `Channel`, `Post`, `Comment`, `Notification`, `DMMessage`, `Building`, `Review`, `Profile`, `Service`, `BuildingLink`, `ReviewReply`, `ASRequest`, `Notice`, `Report`, `FavoriteService`

---

OFFICELINK MVP · v0.3
