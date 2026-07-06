// 서버 시드. 첫 DB 접근 시 1회만 실행되며 window 에 의존하지 않는다.
// lib/seed.ts(브라우저용)의 데이터를 서버 저장소로 포팅한 것.

import type {
  Address,
  Building,
  CommunityEvent,
  GroupMessage,
  GroupRoom,
  Notice,
  Post,
  Profile,
  Review,
  Service,
  ShortTermListing,
  User,
  UserRole,
} from "@/types";
import { getMeta, setMeta, uid } from "./db";
import {
  addresses,
  buildings,
  buildingLinks,
  channels,
  ensureChannelsForAddress,
  events,
  groupMsgs,
  groups,
  listings,
  notices,
  posts,
  profiles,
  reviewReplies,
  reviews,
  services,
  users,
} from "./repo";

const SEED_FLAG = "seeded:v1";
const SEED_USER_ID = "seed-user-1";

const ROLE_NICKS: Record<UserRole, string[]> = {
  tenant: ["새벽산책러", "분위기좋아", "조용한호수", "퇴근후맥주", "동네고양이집사"],
  landlord: ["집주인A", "오피스텔운영자", "월세왕", "건물주님", "안경잡이집주인"],
  manager: ["관리소직원", "AS센터", "엘베수리기사", "택배보관맨", "야간당직"],
};

const POST_TEMPLATES: { title: string; content: string; category: Post["category"] }[] = [
  { title: "동절기 오피스텔 난방비 절감 팁 공유", content: "거실 온도 1도만 낮춰도 월 1만원 정도 아낄 수 있어요. 문틈 바람 차단 테이프도 같이 쓰면 효과 봅니다.", category: "꿀팁" },
  { title: "메가커피 공동배달 같이 하실 분", content: "내일 오후 3시쯤 아이스아메리카노 같이 시키실 분 계세요? 최소 5인이면 배달비 무료입니다.", category: "공동구매" },
  { title: "중고 전자레인지 팔아요", content: "삼성 20L 거의 새거. 3만원에 네고 안 합니다. 관리사무소 앞에서 직거래 가능.", category: "중고거래" },
  { title: "택배 보관 너무 오래돼서 곤란해요", content: "3일째 안 가져가시는 분 계시는데 어떻게 안내드리는 게 좋을까요?", category: "민원" },
  { title: "같이 러닝크루 만들어요", content: "주 3회 저녁 9시에 한 시간 정도 같이 뛸 분 구합니다. 페이스 무관, 초보 환영!", category: "소모임" },
  { title: "동네 조용한 카페 추천", content: "상암동 쪽에 새로 생긴 카페 있는데 작업하기 진짜 좋아요. 위치는 댓글에 남길게요.", category: "자유" },
  { title: "관리비 고지서 언제 발행되나요?", content: "이번 달은 평소보다 2일 늦은데 정상인가요?", category: "질문" },
  { title: "이 오피스텔 주차는 항상 이런가요?", content: "주말에 외부 차량이 너무 많이 들어와서 세대주 차량이 못 세울 때 많음. 단속 강화 부탁드려요.", category: "민원" },
];

const PUBLIC_CATEGORIES = [
  { scope: "public:friends", title: "우리 동네 친구 찾기", category: "친구", description: "동네 사람들과 친해져요" },
  { scope: "public:meetup", title: "우리 동네 모임", category: "모임", description: "관심사별 소모임" },
  { scope: "public:food", title: "우리 동네 맛집", category: "맛집", description: "동네 단골 식당 공유" },
  { scope: "public:tip", title: "우리 동네 정보", category: "정보", description: "꿀팁과 정보 공유" },
  { scope: "public:market", title: "우리 동네 부동산 시세", category: "시세", description: "매매/전세/월세 정보" },
];

const BUILDINGS: Building[] = [
  { id: "b-1", name: "상암오벨리스크 1차", address: "서울특별시 마포구 월드컵북로 481", sigungu: "마포구", dong: "상암동", builtYear: 2012, totalUnits: 480, floors: 15, parking: true, options: ["엘리베이터", "CCTV", "택배함", "주차", "근접생활시설"], ratingAvg: 4.2, ratingCount: 0, ratingNoise: 4.0, ratingClean: 4.3, ratingFacility: 4.1, ratingManagement: 4.0, ratingSafety: 4.5, priceDeposit: 1000, priceMonthly: 55, createdAt: Date.now() },
  { id: "b-2", name: "상암오벨리스크 2차", address: "서울특별시 마포구 월드컵북로 481", sigungu: "마포구", dong: "상암동", builtYear: 2018, totalUnits: 320, floors: 18, parking: true, options: ["엘리베이터", "CCTV", "택배함", "주차", "근접생활시설", "게이트 보안"], ratingAvg: 4.5, ratingCount: 0, ratingNoise: 4.2, ratingClean: 4.6, ratingFacility: 4.5, ratingManagement: 4.4, ratingSafety: 4.8, priceDeposit: 1500, priceMonthly: 65, createdAt: Date.now() },
  { id: "b-3", name: "이안상암 1차", address: "서울특별시 마포구 월드컵로 190", sigungu: "마포구", dong: "성산동", builtYear: 2010, totalUnits: 600, floors: 22, parking: true, options: ["엘리베이터", "CCTV", "택배함", "주차", "학교인접"], ratingAvg: 3.8, ratingCount: 0, ratingNoise: 3.2, ratingClean: 3.9, ratingFacility: 4.0, ratingManagement: 3.5, ratingSafety: 4.2, priceDeposit: 800, priceMonthly: 50, createdAt: Date.now() },
  { id: "b-4", name: "상암 월드메르디앙", address: "서울특별시 마포구 매봉산로 37", sigungu: "마포구", dong: "상암동", builtYear: 2015, totalUnits: 250, floors: 12, parking: false, options: ["엘리베이터", "CCTV", "택배함", "역세권"], ratingAvg: 3.5, ratingCount: 0, ratingNoise: 2.8, ratingClean: 3.6, ratingFacility: 3.7, ratingManagement: 3.4, ratingSafety: 3.9, priceDeposit: 700, priceMonthly: 48, createdAt: Date.now() },
  { id: "b-5", name: "연남동 로얄오피스텔", address: "서울특별시 마포구 연남로 38", sigungu: "마포구", dong: "연남동", builtYear: 2008, totalUnits: 180, floors: 10, parking: true, options: ["엘리베이터", "CCTV", "택배함", "주차", "상권우수"], ratingAvg: 4.0, ratingCount: 0, ratingNoise: 3.5, ratingClean: 4.0, ratingFacility: 4.0, ratingManagement: 4.1, ratingSafety: 4.3, priceDeposit: 1200, priceMonthly: 60, createdAt: Date.now() },
];

const PROFILES: Profile[] = [
  { id: "p-landlord-1", kind: "landlord", name: "김집주", buildingIds: ["b-1", "b-2"], ratingAvg: 4.4, ratingCount: 0, ratingTags: [{ name: "응답 빠름", score: 4.6 }, { name: "친절함", score: 4.5 }, { name: "수리 처리", score: 4.2 }, { name: "보증금 안정", score: 4.7 }], responseRate: 95, responseHours: 4, phone: "02-1234-5678", createdAt: Date.now() },
  { id: "p-landlord-2", kind: "landlord", name: "이월세", buildingIds: ["b-3"], ratingAvg: 3.6, ratingCount: 0, ratingTags: [{ name: "응답 빠름", score: 3.2 }, { name: "친절함", score: 3.5 }, { name: "수리 처리", score: 3.4 }], responseRate: 70, responseHours: 24, phone: "02-2345-6789", createdAt: Date.now() },
  { id: "p-manager-1", kind: "manager", name: "상암오벨리스크 관리사무소", buildingIds: ["b-1", "b-2"], ratingAvg: 4.3, ratingCount: 0, ratingTags: [{ name: "AS 처리", score: 4.5 }, { name: "민원 응답", score: 4.4 }, { name: "시설 관리", score: 4.2 }], responseRate: 98, responseHours: 2, phone: "02-1111-2222", createdAt: Date.now() },
  { id: "p-manager-2", kind: "manager", name: "이안상암 관리사무소", buildingIds: ["b-3"], ratingAvg: 3.4, ratingCount: 0, ratingTags: [{ name: "AS 처리", score: 3.2 }, { name: "민원 응답", score: 3.0 }, { name: "시설 관리", score: 3.6 }], responseRate: 60, responseHours: 36, phone: "02-3333-4444", createdAt: Date.now() },
];

type ReviewSeed = Omit<Review, "id" | "authorId" | "likes" | "createdAt"> & { author: string };
const REVIEW_SEEDS: ReviewSeed[] = [
  { buildingId: "b-1", summary: "오래됐지만 관리는 잘 되어있어요", content: "10년 넘은 건물치고 깨끗하고 관리 잘 돼있어요. 단, 주차는 좀 빡빡한 편.", pros: ["관리 잘됨", "주변 상권 좋음", "조용함"], cons: ["주차 부족", "엘리베이터 느림"], category: "시설", rating: 4, ratings: { noise: 4, clean: 4, facility: 3, management: 4, safety: 5 }, likedAs: "1인가구", period: "8개월", authorRole: "tenant", authorNickname: "퇴근후맥주", author: "퇴근후맥주" },
  { buildingId: "b-1", summary: "집주인 친절하고 보증금 안전", content: "계약 전부터 친절하게 설명해주셨고, 보증금도 안전하게 반환 받았습니다.", pros: ["집주인 친절", "보증금 안정"], cons: ["주차"], category: "관리", rating: 5, ratings: { noise: 4, clean: 4, facility: 4, management: 5, safety: 5 }, likedAs: "1인가구", period: "1년", authorRole: "tenant", authorNickname: "동네고양이집사", author: "동네고양이집사" },
  { buildingId: "b-2", summary: "신축이라 깨끗하고 보안 좋아요", content: "2018년 신축이라 내부 상태 깨끗하고, 게이트 보안 시스템이 확실해요.", pros: ["신축", "보안 우수", "깨끗함"], cons: ["월세 비쌈"], category: "청결", rating: 5, ratings: { noise: 4, clean: 5, facility: 5, management: 4, safety: 5 }, likedAs: "1인가구", period: "1년", authorRole: "tenant", authorNickname: "분위기좋아", author: "분위기좋아" },
  { buildingId: "b-2", summary: "1인 가구 최적, 가성비 좋아요", content: "1인 가구용 평면이 잘 짜여있고, 주변에 마트/편의점/카페 다 있어요.", pros: ["1인가구 최적", "주변시설", "신축"], cons: ["보증금 부담"], category: "구조", rating: 5, ratings: { noise: 5, clean: 5, facility: 5, management: 4, safety: 5 }, likedAs: "1인가구", period: "10개월", authorRole: "tenant", authorNickname: "새벽산책러", author: "새벽산책러" },
  { buildingId: "b-3", summary: "관리소 응대가 느려요", content: "AS 요청했는데 일주일 넘게 답이 없었어요. 그게 좀 아쉽습니다.", pros: ["가격"], cons: ["관리소 응답 느림", "AS 지연"], category: "관리", rating: 3, ratings: { noise: 3, clean: 3, facility: 3, management: 2, safety: 4 }, likedAs: "1인가구", period: "5개월", authorRole: "tenant", authorNickname: "조용한호수", author: "조용한호수" },
  { buildingId: "b-4", summary: "소음 진짜 심함", content: "길 건너편 술집 + 주말 행인 소음 때문에 잠을 못 자요.", pros: ["역세권", "저렴"], cons: ["심한 소음", "주차"], category: "소음", rating: 2, ratings: { noise: 1, clean: 3, facility: 3, management: 3, safety: 4 }, likedAs: "1인가구", period: "4개월", authorRole: "tenant", authorNickname: "동네고양이집사", author: "동네고양이집사" },
  { buildingId: "b-5", summary: "연남동 상권이 진짜 좋아요", content: "카페/맛집/버스 다 가까워서 1인 가구 라이프에 최고예요.", pros: ["상권", "동네 분위기", "교통"], cons: ["주차", "좀 좁은 평면"], category: "동네", rating: 5, ratings: { noise: 3, clean: 4, facility: 4, management: 4, safety: 5 }, likedAs: "1인가구", period: "1년", authorRole: "tenant", authorNickname: "분위기좋아", author: "분위기좋아" },
];

const SERVICES: Service[] = [
  { id: "s-1", category: "clean", name: "깔끔한 청소 119", description: "입주/퇴거 청소, 정기 청소, 화장실/주방 깊은 청소까지", price: "5만원~", rating: 4.8, reviewCount: 234, tags: ["당일 가능", "에어컨 포함", "카드 가능"], phone: "1588-0101", sigungu: "마포구", createdAt: Date.now() },
  { id: "s-3", category: "move", name: "스피드 이사", description: "원룸/투룸 당일 이사, 포장재 무료", price: "15만원~", rating: 4.7, reviewCount: 891, tags: ["당일 가능", "포장재 무료"], phone: "1588-0303", sigungu: "마포구", createdAt: Date.now() },
  { id: "s-5", category: "as", name: "상암AS센터", description: "싱크대, 보일러, 도어락, 전기 AS 출장 1시간", price: "3만원~", rating: 4.7, reviewCount: 178, tags: ["당일 가능", "마포 전지역 1시간"], phone: "02-500-5050", sigungu: "마포구", buildingIds: ["b-1", "b-2", "b-3"], createdAt: Date.now() },
  { id: "s-10", category: "finance", name: "오피스텔 전세 대출 컨설팅", description: "1인가구 맞춤, 비교 5개사 무료", price: "무료", rating: 4.6, reviewCount: 145, tags: ["무료 상담", "비교 5사"], phone: "1588-0909", sigungu: "서울 전역", createdAt: Date.now() },
  { id: "s-11", category: "food", name: "오늘의 도시락", description: "1인 가구 맞춤 도시락, 매일 다른 메뉴", price: "5,900원~", rating: 4.7, reviewCount: 2341, tags: ["매일 신선", "1인분"], phone: "1588-1010", sigungu: "마포구", createdAt: Date.now() },
];

const NOTICES: Notice[] = [
  { id: "notice-1", category: "update", title: "OFFICELINK v0.6 출시!", content: "단기임대 · 그룹채팅 · 이벤트 · PWA 풀세트가 추가되었습니다.", important: false, createdAt: Date.now() - 2 * 86400000 },
  { id: "notice-3", category: "system", title: "[중요] 약관 개정 안내", content: "개인정보 처리방침이 개정됩니다. 시행일: 2024-07-01", important: true, createdAt: Date.now() - 7 * 86400000 },
];

let seedChecked = false;

/** 첫 호출 시 1회만 시드. Route Handler 진입부에서 호출한다. */
export function ensureSeeded(): void {
  if (seedChecked) return;
  runServerSeed();
  seedChecked = true;
}

export function runServerSeed(): void {
  if (getMeta(SEED_FLAG)) return;

  // 1) 공용 채널
  for (const pc of PUBLIC_CATEGORIES) {
    if (!channels.find((c) => c.scopeKey === pc.scope)) {
      channels.insert({
        id: uid(),
        kind: "public",
        scopeKey: pc.scope,
        title: pc.title,
        description: pc.description,
        category: pc.category,
        createdAt: Date.now(),
      });
    }
  }

  // 2) 데모 사용자 + 주소 3종 → 채널 자동 개설
  const seedUser: User = {
    id: SEED_USER_ID,
    nickname: "동네주민",
    role: "tenant",
    createdAt: Date.now(),
  };
  if (!users.byId(seedUser.id)) users.insert(seedUser);

  const demoAddrs: Omit<Address, "id" | "createdAt">[] = [
    { userId: SEED_USER_ID, role: "tenant", sido: "서울특별시", sigungu: "마포구", dong: "상암동", detail: "상암오벨리스크 2차", label: "현재 거주지", isPrimary: true },
    { userId: SEED_USER_ID, role: "landlord", sido: "서울특별시", sigungu: "마포구", dong: "상암동", detail: "상암오벨리스크 1차", label: "보유 임대지", isPrimary: false },
    { userId: SEED_USER_ID, role: "manager", sido: "서울특별시", sigungu: "마포구", dong: "상암동", detail: "상암오벨리스크 2차", label: "관리 대상", isPrimary: false },
  ];
  for (const d of demoAddrs) {
    const addr: Address = { ...d, id: uid(), createdAt: Date.now() };
    addresses.insert(addr);
    ensureChannelsForAddress(addr);
  }

  // 3) 데모 게시글
  const all = channels.all();
  const targets = [
    all.find((c) => c.kind === "tenant-building"),
    all.find((c) => c.kind === "tenant-region"),
    all.find((c) => c.scopeKey === "public:friends"),
    all.find((c) => c.scopeKey === "public:food"),
    all.find((c) => c.scopeKey === "public:market"),
  ].filter(Boolean) as NonNullable<(typeof all)[number]>[];

  let pi = 0;
  const roles: UserRole[] = ["tenant", "landlord", "manager"];
  for (const ch of targets) {
    for (let i = 0; i < 2; i++) {
      const tpl = POST_TEMPLATES[pi % POST_TEMPLATES.length];
      const role = roles[pi % roles.length];
      posts.insert({
        id: uid(),
        channelId: ch.id,
        authorId: `seed-bot-${pi}`,
        authorNickname: ROLE_NICKS[role][pi % ROLE_NICKS[role].length],
        authorRole: role,
        category: tpl.category,
        title: tpl.title,
        content: tpl.content,
        likes: Math.floor(Math.random() * 12),
        commentCount: 0,
        views: Math.floor(Math.random() * 80) + 5,
        createdAt: Date.now() - pi * 1000 * 60 * 7,
      });
      pi++;
    }
  }

  // 4) 건물 / 프로필 / 서비스 / 공지
  buildings.insertMany(BUILDINGS);
  profiles.insertMany(PROFILES);
  services.insertMany(SERVICES);
  notices.insertMany(NOTICES);

  // 5) 리뷰 → 평점 재계산
  let ri = 0;
  for (const t of REVIEW_SEEDS) {
    reviews.insert({
      ...t,
      id: `r-${ri}`,
      authorId: `seed-reviewer-${ri}`,
      likes: Math.floor(Math.random() * 8),
      createdAt: Date.now() - ri * 86400000,
    });
    ri++;
  }
  // 평점 일괄 재계산
  for (const b of BUILDINGS) {
    const list = reviews.filter((r) => r.buildingId === b.id);
    if (list.length === 0) continue;
    const round = (n: number) => Math.round(n * 10) / 10;
    const avg = (k: keyof Review["ratings"]) =>
      list.reduce((s, r) => s + r.ratings[k], 0) / list.length;
    buildings.update(b.id, {
      ratingAvg: round(list.reduce((s, r) => s + r.rating, 0) / list.length),
      ratingCount: list.length,
      ratingNoise: round(avg("noise")),
      ratingClean: round(avg("clean")),
      ratingFacility: round(avg("facility")),
      ratingManagement: round(avg("management")),
      ratingSafety: round(avg("safety")),
    });
  }

  // 6) 리뷰 답글
  reviewReplies.insertMany([
    { id: "reply-1", reviewId: "r-0", buildingId: "b-1", authorKind: "manager", authorName: "상암오벨리스크 관리사무소", content: "소중한 리뷰 감사합니다. 주차 공간 확보를 위해 월별 외부 주차장 계약 검토 중이에요.", createdAt: Date.now() - 20 * 86400000 },
    { id: "reply-2", reviewId: "r-2", buildingId: "b-2", authorKind: "landlord", authorName: "김집주", content: "좋은 리뷰 감사합니다! 1인 가구 분들을 위해 소음 관련 안내도 더 강화할게요.", createdAt: Date.now() - 15 * 86400000 },
  ]);

  // 7) 사용자-건물 연결
  buildingLinks.insertMany([
    { id: uid(), userId: SEED_USER_ID, buildingId: "b-2", relation: "live", createdAt: Date.now() },
    { id: uid(), userId: SEED_USER_ID, buildingId: "b-1", relation: "interested", createdAt: Date.now() },
    { id: uid(), userId: SEED_USER_ID, buildingId: "b-5", relation: "interested", createdAt: Date.now() },
  ]);

  // 8) 단기임대 리스팅
  const listingSeeds: ShortTermListing[] = [
    { id: "st-1", hostId: "host-1", hostNickname: "Jenny (🇰🇷 5년차)", buildingId: "b-2", buildingName: "상암오벨리스크 2차", unitNumber: "1208", pricePerDay: 55000, pricePerWeek: 320000, pricePerMonth: 1100000, currency: "KRW", minStay: 3, maxStay: 60, availableFrom: Date.now(), availableTo: Date.now() + 90 * 86400000, rooms: 1, bathrooms: 1, area: 23, furnished: true, utilities: true, wifi: true, kitchen: true, washer: true, ac: true, heating: true, hostLangs: ["ko", "en"], description: { ko: "조용하고 깨끗한 신축 오피스텔. 지하철 5분.", en: "Quiet, clean new officetel. 5 min to subway." }, rules: { ko: ["비흡연", "반려동물 불가"], en: ["No smoking", "No pets"] }, views: 234, inquiries: 12, status: "open", createdAt: Date.now() - 3 * 86400000 },
    { id: "st-3", hostId: "host-3", hostNickname: "David (🇺🇸 Seoul)", buildingId: "b-1", buildingName: "상암오벨리스크 1차", unitNumber: "1405", pricePerDay: 50000, pricePerWeek: 290000, pricePerMonth: 1000000, currency: "KRW", minStay: 2, maxStay: 90, availableFrom: Date.now(), rooms: 1, bathrooms: 1, area: 21, furnished: true, utilities: false, wifi: true, kitchen: true, washer: true, ac: true, heating: false, hostLangs: ["en", "ko"], description: { en: "Cozy studio near DMC. English/한국어 OK.", ko: "DMC 인근 아늑한 스튜디오. 영어/한국어 OK." }, rules: { en: ["No smoking"], ko: ["비흡연"] }, views: 412, inquiries: 25, status: "open", createdAt: Date.now() - 86400000 },
  ];
  listings.insertMany(listingSeeds);

  // 9) 이벤트
  const eventSeeds: CommunityEvent[] = [
    { id: "ev-1", hostId: "host-ev-1", hostNickname: "상암동 주민회", title: "🌸 상암동 벚꽃 산책", description: "DMC 산책로 따라 벚꽃 보고 가벼운 산책.", category: "meetup", location: "DMC역 2번 출구 앞", startsAt: Date.now() + 7 * 86400000, endsAt: Date.now() + 7 * 86400000 + 3600000, maxParticipants: 20, participants: [{ userId: "p1", nickname: "Alice", joinedAt: Date.now() - 86400000 }], createdAt: Date.now() - 2 * 86400000 },
    { id: "ev-2", hostId: "host-ev-2", hostNickname: "오피스텔 러닝크루", title: "🏃 주말 아침 러닝", description: "매주 토요일 아침 7시, 한강공원에서 5km 러닝.", category: "sports", location: "망원한강공원", startsAt: Date.now() + 3 * 86400000, endsAt: Date.now() + 3 * 86400000 + 5400000, maxParticipants: 30, participants: [{ userId: "p3", nickname: "Charlie", joinedAt: Date.now() - 100000 }], createdAt: Date.now() - 5 * 86400000 },
  ];
  events.insertMany(eventSeeds);

  // 10) 그룹 채팅
  const groupSeeds: GroupRoom[] = [
    { id: "gr-1", name: "🌐 상암동 외국인 모임", description: "외국인 + 한국인 같이 얘기해요", emoji: "🌐", members: [SEED_USER_ID, "host-1", "host-3"], createdAt: Date.now() - 14 * 86400000, lastMessageAt: Date.now() - 3600000, lastMessagePreview: "Hi everyone!" },
    { id: "gr-2", name: "🍱 1인가구 밥모임", description: "혼자 먹기 싫을 때 같이 밥 먹어요", emoji: "🍱", members: [SEED_USER_ID, "p1"], createdAt: Date.now() - 7 * 86400000, lastMessageAt: Date.now() - 1800000, lastMessagePreview: "내일 저녁 7시 연남동?" },
  ];
  groups.insertMany(groupSeeds);
  const gmSeeds: GroupMessage[] = [
    { id: "gm-1", roomId: "gr-1", authorId: "host-1", authorNickname: "Jenny (🇰🇷 5년차)", authorRole: "tenant", content: "Hi everyone! See you at cherry blossom walk next week!", createdAt: Date.now() - 7200000 },
    { id: "gm-3", roomId: "gr-2", authorId: "p1", authorNickname: "Alice", authorRole: "tenant", content: "내일 저녁 7시 연남동?", createdAt: Date.now() - 1800000 },
  ];
  groupMsgs.insertMany(gmSeeds);

  setMeta(SEED_FLAG, "1");
}
