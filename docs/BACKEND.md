# OFFICELINK 백엔드 아키텍처

> 목적: 웹(PWA)·Android·iOS 가 **같은 HTTP API** 를 공유하도록, 데이터/로직을 프론트(localStorage)에서 서버로 분리한다.

## 한눈에 보기

```
          ┌──────────────────────────┐
          │  Next.js Route Handlers   │   /src/app/api/**
          │  (HTTP/JSON API)          │
          └────────────┬─────────────┘
                       │ 호출
          ┌────────────┴─────────────┐
          │  repo.ts  (도메인 계층)    │   교체 가능한 경계
          └────────────┬─────────────┘
                       │
          ┌────────────┴─────────────┐
          │  db.ts (파일 기반 저장소)  │   .data/*.json  ← 나중에 Postgres
          └──────────────────────────┘

   웹(PWA) ─┐
   Android ─┼─►  src/lib/api.ts (타입드 클라이언트)  ─►  /api/**
   iOS     ─┘
```

핵심 원칙: **화면/네이티브는 저장 방식을 모른다.** 오늘은 파일, 내일은 Postgres여도 `repo.ts` 인터페이스만 유지되면 호출부는 안 바뀐다.

## 디렉터리

| 파일 | 역할 |
|---|---|
| `src/server/db.ts` | 파일 기반 JSON 컬렉션 저장소 + `Collection<T>` 헬퍼. **서버 전용** (Node `fs`). |
| `src/server/repo.ts` | 도메인 저장소. 컬렉션 정의 + 비즈니스 로직(평점 재계산, 채널 자동개설, 관계 등). |
| `src/server/seed.server.ts` | 첫 요청 시 1회 데모 데이터 시드 (`ensureSeeded()`). |
| `src/server/auth.ts` | 가입/로그인/세션. scrypt 해시. **순수 로직** (next/headers 미사용 → 테스트 가능). |
| `src/server/session.ts` | 쿠키에서 현재 사용자 조회 (`currentUser()`). Route Handler 전용. |
| `src/server/http.ts` | `ok()`/`fail()`/`readJson()` 응답 헬퍼. |
| `src/lib/api.ts` | 프론트/네이티브 공용 타입드 fetch 클라이언트 (`api.*`). |

## 데이터 저장소

- 기본 위치: `./.data/<collection>.json` (gitignore). `OFFICELINK_DATA_DIR` 로 변경.
- 단일 프로세스(개발 서버/단일 인스턴스) 기준. 멀티 인스턴스 영속성이 필요하면 실 DB로 전환.
- 모든 Route Handler 는 `export const dynamic = "force-dynamic"` — 빌드 타임 정적화 방지.

## API 표면

응답 봉투: 성공 `{ ok: true, data, count? }` / 실패 `{ ok: false, error }`.

### 인증
| 메서드 | 경로 | 설명 |
|---|---|---|
| POST | `/api/auth/signup` | `{ email, password, nickname, role }` → 세션 쿠키 |
| POST | `/api/auth/login` | `{ email, password }` |
| POST | `/api/auth/logout` | 세션 종료 |
| GET | `/api/auth/me` | 현재 사용자 (`{ user|null }`) |

### 도메인
| 메서드 | 경로 | 설명 |
|---|---|---|
| GET | `/api/buildings` | `?sigungu&dong&minRating` |
| GET | `/api/buildings/:id` | 건물 + 리뷰 |
| GET/POST | `/api/reviews` | `?buildingId` / 작성(평점 자동 재계산) |
| GET | `/api/channels` | `?kind&scope` |
| GET | `/api/channels/:id` | 채널 + 글 |
| GET/POST | `/api/posts` | `?channelId` / 글 작성 |
| GET | `/api/posts/:id` | 글 상세 + 댓글 (조회수 +1) |
| POST | `/api/posts/:id/like` | 좋아요 |
| GET/POST | `/api/posts/:id/comments` | 댓글 목록/작성 |
| GET/POST/DELETE | `/api/addresses` | 내 주소 (등록 시 채널 자동 개설) |
| GET/POST | `/api/relationships` | 관계 목록/`?matchable=1` 후보/신청 |
| PATCH | `/api/relationships/:id` | `{ action: "accept" \| "end" }` |
| GET/POST | `/api/polls` | 투표 목록/생성 |
| POST | `/api/polls/:id/vote` | `{ optionIds }` |
| GET | `/api/services` | `?category` |
| GET | `/api/notices` | 앱 공지 |

### 관계(Relationship) 모델 — PPTX 기획 반영
- 종류: `tenant-landlord` / `tenant-manager` / `landlord-manager`
- 흐름: **같은 오피스텔 상세주소 매칭** → `requested` → 상대가 수락 → `active`(연계 채널 생성) → `ended`
- 같은 역할끼리는 불가, 중복 신청 차단, 종료는 당사자만.

## 프론트에서 쓰기 (예)

```ts
import { api } from "@/lib/api";

await api.auth.login({ email, password });
const buildings = await api.buildings.list({ sigungu: "마포구" });
const post = await api.posts.create({ channelId, title, content });
```

> 현재 화면들은 아직 `lib/storage.ts`(localStorage)를 직접 쓴다. `lib/api.ts` 로의 전환은
> 화면 단위로 점진적으로 진행하면 된다. (백엔드는 이미 준비됨)

## 실행

```bash
# 개발 (도커 불필요)
npm run dev          # http://localhost:3000, /api/* 동작
npm test             # 서버 로직 테스트 포함

# 컨테이너로 앱 전체
docker compose up app
```

## 실 DB(Postgres) 전환 경로

1. ORM 추가 (예: Drizzle) + `DATABASE_URL` 설정 (`docker compose up -d db` 로 로컬 Postgres).
2. `src/server/repo.ts` 의 각 함수 본문을 SQL/ORM 호출로 교체. **시그니처는 유지.**
3. `db.ts`(파일 저장소)는 제거하거나 로컬 폴백으로 유지.
4. 세션/계정도 동일 테이블로 이전.

화면·API 라우트·`lib/api.ts` 는 손대지 않아도 된다.

## 다음 작업 후보
- 본인인증(Pass/SMS) 연동 — 현재는 이메일/비밀번호 기본 인증.
- 거주지/임대지/관리지 **인증(서류) 단계** 및 채널 글쓰기 제한(15일) 로직.
- 권한 모델: 관심 오피스텔 Read 전용 / 열람 횟수 제한 / 과금(위플머니·아이템).
- 알림(Push) 서버 발송, 태깅 공지(@임차인/@임대인).
- 화면들을 `lib/storage` → `lib/api` 로 점진 이전.
