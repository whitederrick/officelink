// 데모용 시드 데이터. 첫 진입 시 1회만 실행.

import type { Address, Building, Post, Profile, Review, Service, User, UserRole } from "@/types";
import {
  addAddress,
  addBuilding,
  addChannel,
  addPost,
  addProfile,
  addReview,
  addService,
  getChannels,
  isSeeded,
  linkBuilding,
  markSeeded,
  uid,
} from "./storage";
import { ensureChannelsForAddress } from "./channels";

const ROLE_NICKS: Record<UserRole, string[]> = {
  tenant: ["새벽산책러", "분위기좋아", "조용한호수", "퇴근후맥주", "동네고양이집사"],
  landlord: ["집주인A", "오피스텔운영자", "월세왕", "건물주님", "안경잡이집주인"],
  manager: ["관리소직원", "AS센터", "엘베수리기사", "택배보관맨", "야간당직"],
};

const POST_TEMPLATES: { title: string; content: string; category: Post["category"] }[] = [
  {
    title: "동절기 오피스텔 난방비 절감 팁 공유",
    content: "거실 온도 1도만 낮춰도 월 1만원 정도 아낄 수 있어요. 문틈 바람 차단 테이프도 같이 쓰면 효과 봅니다.",
    category: "꿀팁",
  },
  {
    title: "메가커피 공동배달 같이 하실 분",
    content: "내일 오후 3시쯤 아이스아메리카노 같이 시키실 분 계세요? 최소 5인이면 배달비 무료입니다.",
    category: "공동구매",
  },
  {
    title: "중고 전자레인지 팔아요",
    content: "삼성 20L 거의 새거. 3만원에 네고 안 합니다. 관리사무소 앞에서 직거래 가능.",
    category: "중고거래",
  },
  {
    title: "택배 보관 너무 오래돼서 곤란해요",
    content: "3일째 안 가져가시는 분 계시는데 어떻게 안내드리는 게 좋을까요?",
    category: "민원",
  },
  {
    title: "같이 러닝크루 만들어요",
    content: "주 3회 저녁 9시에 한 시간 정도 같이 뛸 분 구합니다. 페이스 무관, 초보 환영!",
    category: "소모임",
  },
  {
    title: "동네 조용한 카페 추천",
    content: "상암동 쪽에 새로 생긴 카페 있는데 작업하기 진짜 좋아요. 위치는 댓글에 남길게요.",
    category: "자유",
  },
  {
    title: "관리비 고지서 언제 발행되나요?",
    content: "이번 달은 평소보다 2일 늦은데 정상인가요?",
    category: "질문",
  },
  {
    title: "이 오피스텔 주차는 항상 이런가요?",
    content: "주말에 외부 차량이 너무 많이 들어와서 세대주 차량이 못 세울 때 많음. 단속 강화 부탁드려요.",
    category: "민원",
  },
];

const PUBLIC_CATEGORIES: { scope: string; title: string; category: string; description: string }[] = [
  { scope: "public:friends", title: "우리 동네 친구 찾기", category: "친구", description: "동네 사람들과 친해져요" },
  { scope: "public:meetup", title: "우리 동네 모임", category: "모임", description: "관심사별 소모임" },
  { scope: "public:food", title: "우리 동네 맛집", category: "맛집", description: "동네 단골 식당 공유" },
  { scope: "public:tip", title: "우리 동네 정보", category: "정보", description: "꿀팁과 정보 공유" },
  { scope: "public:market", title: "우리 동네 부동산 시세", category: "시세", description: "매매/전세/월세 정보" },
];

export function runSeedIfNeeded() {
  if (isSeeded()) return;
  if (typeof window === "undefined") return;

  // 1) 공용 채널들
  for (const pc of PUBLIC_CATEGORIES) {
    addChannel({
      id: uid(),
      kind: "public",
      scopeKey: pc.scope,
      title: pc.title,
      description: pc.description,
      category: pc.category,
      createdAt: Date.now(),
    });
  }

  // 2) 데모 사용자 + 주소 3종 (임차인/임대인/관리인 각 1개)
  const seedUserId = "seed-user-1";
  const demoAddrs: { userId: string; role: UserRole; sido: string; sigungu: string; dong: string; detail: string; label: string }[] = [
    {
      userId: seedUserId,
      role: "tenant",
      sido: "서울특별시",
      sigungu: "마포구",
      dong: "상암동",
      detail: "상암오벨리스크 2차",
      label: "현재 거주지",
    },
    {
      userId: seedUserId,
      role: "landlord",
      sido: "서울특별시",
      sigungu: "마포구",
      dong: "상암동",
      detail: "상암오벨리스크 1차",
      label: "보유 임대지",
    },
    {
      userId: seedUserId,
      role: "manager",
      sido: "서울특별시",
      sigungu: "마포구",
      dong: "상암동",
      detail: "상암오벨리스크 2차",
      label: "관리 대상",
    },
  ];

  const user: User = {
    id: seedUserId,
    nickname: "동네주민",
    role: "tenant",
    createdAt: Date.now(),
  };
  window.localStorage.setItem("officelink:user", JSON.stringify(user));

  for (const d of demoAddrs) {
    const addr: Address = {
      id: uid(),
      userId: d.userId,
      role: d.role,
      sido: d.sido,
      sigungu: d.sigungu,
      dong: d.dong,
      detail: d.detail,
      label: d.label,
      isPrimary: d.label === "현재 거주지",
      createdAt: Date.now(),
    };
    addAddress(addr);
    ensureChannelsForAddress(addr);
  }

  // 3) 시드 사용자 외에 다른 가짜 사용자들 글 (각 역할 닉네임)
  const channels = getChannels();
  const buildingChannel = channels.find((c) => c.kind === "tenant-building");
  const regionChannel = channels.find((c) => c.kind === "tenant-region");
  const publicFriend = channels.find((c) => c.scopeKey === "public:friends");
  const publicFood = channels.find((c) => c.scopeKey === "public:food");
  const publicMarket = channels.find((c) => c.scopeKey === "public:market");

  const targets = [buildingChannel, regionChannel, publicFriend, publicFood, publicMarket].filter(
    Boolean,
  ) as NonNullable<typeof channels[number]>[];

  let pi = 0;
  for (const ch of targets) {
    for (let i = 0; i < 2; i++) {
      const tpl = POST_TEMPLATES[pi % POST_TEMPLATES.length];
      const roles: UserRole[] = ["tenant", "landlord", "manager"];
      const role = roles[pi % roles.length];
      addPost({
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

  // 4) 인기 활성화를 위해 가짜 알림 일부 시드 (받이는 시드 사용자)
  const notifTemplates = [
    { type: "like" as const, msg: "내 글을 좋아합니다." },
    { type: "comment" as const, msg: "내 글에 댓글을 남겼습니다." },
  ];
  const seedNotifs = [
    { type: "like" as const, msg: "내 글 “동절기 난방비 절감”을 좋아합니다." },
    { type: "comment" as const, msg: "내 글 “메가커피 공동배달”에 댓글을 남겼습니다." },
    { type: "like" as const, msg: "내 글 “조용한 카페 추천”을 좋아합니다." },
  ];
  const seedNotifActors = [
    { nick: "분위기좋아", role: "tenant" as UserRole },
    { nick: "집주인A", role: "landlord" as UserRole },
    { nick: "관리소직원", role: "manager" as UserRole },
  ];
  let ni = 0;
  for (const n of seedNotifs) {
    const actor = seedNotifActors[ni % seedNotifActors.length];
    window.localStorage.setItem(
      "officelink:notifications",
      JSON.stringify([
        ...JSON.parse(
          window.localStorage.getItem("officelink:notifications") || "[]",
        ),
        {
          id: `seed-notif-${ni}`,
          type: n.type,
          recipientId: seedUserId,
          actorNickname: actor.nick,
          actorRole: actor.role,
          message: n.msg,
          read: false,
          createdAt: Date.now() - ni * 1000 * 60 * 30,
        },
      ]),
    );
    ni++;
  }

  markSeeded();
}

// =============================================
// v0.3: 건물/리뷰/평판/서비스 시드
// =============================================
export function runSeedV3IfNeeded() {
  if (typeof window === "undefined") return;
  if (window.localStorage.getItem("officelink:seeded:v3")) return;
  // 건물 시드가 아직 안 되어있으면 v0.2도 안 되어있는 것
  if (!isSeeded()) return;

  // 1) 건물
  const buildings: Building[] = [
    {
      id: "b-1",
      name: "상암오벨리스크 1차",
      address: "서울특별시 마포구 월드컵북로 481",
      sigungu: "마포구",
      dong: "상암동",
      builtYear: 2012,
      totalUnits: 480,
      floors: 15,
      parking: true,
      options: ["엘리베이터", "CCTV", "택배함", "무인택배柜", "주차", "근접생활시설"],
      ratingAvg: 4.2,
      ratingCount: 0,
      ratingNoise: 4.0,
      ratingClean: 4.3,
      ratingFacility: 4.1,
      ratingManagement: 4.0,
      ratingSafety: 4.5,
      priceDeposit: 1000,
      priceMonthly: 55,
      createdAt: Date.now(),
    },
    {
      id: "b-2",
      name: "상암오벨리스크 2차",
      address: "서울특별시 마포구 월드컵북로 481",
      sigungu: "마포구",
      dong: "상암동",
      builtYear: 2018,
      totalUnits: 320,
      floors: 18,
      parking: true,
      options: ["엘리베이터", "CCTV", "택배함", "주차", "근접생활시설", "게이트 보안"],
      ratingAvg: 4.5,
      ratingCount: 0,
      ratingNoise: 4.2,
      ratingClean: 4.6,
      ratingFacility: 4.5,
      ratingManagement: 4.4,
      ratingSafety: 4.8,
      priceDeposit: 1500,
      priceMonthly: 65,
      createdAt: Date.now(),
    },
    {
      id: "b-3",
      name: "이안상암 1차",
      address: "서울특별시 마포구 월드컵로 190",
      sigungu: "마포구",
      dong: "성산동",
      builtYear: 2010,
      totalUnits: 600,
      floors: 22,
      parking: true,
      options: ["엘리베이터", "CCTV", "택배함", "주차", "학교인접"],
      ratingAvg: 3.8,
      ratingCount: 0,
      ratingNoise: 3.2,
      ratingClean: 3.9,
      ratingFacility: 4.0,
      ratingManagement: 3.5,
      ratingSafety: 4.2,
      priceDeposit: 800,
      priceMonthly: 50,
      createdAt: Date.now(),
    },
    {
      id: "b-4",
      name: "상암 월드메르디앙",
      address: "서울특별시 마포구 매봉산로 37",
      sigungu: "마포구",
      dong: "상암동",
      builtYear: 2015,
      totalUnits: 250,
      floors: 12,
      parking: false,
      options: ["엘리베이터", "CCTV", "택배함", "역세권"],
      ratingAvg: 3.5,
      ratingCount: 0,
      ratingNoise: 2.8,
      ratingClean: 3.6,
      ratingFacility: 3.7,
      ratingManagement: 3.4,
      ratingSafety: 3.9,
      priceDeposit: 700,
      priceMonthly: 48,
      createdAt: Date.now(),
    },
    {
      id: "b-5",
      name: "연남동 로얄오피스텔",
      address: "서울특별시 마포구 연남로 38",
      sigungu: "마포구",
      dong: "연남동",
      builtYear: 2008,
      totalUnits: 180,
      floors: 10,
      parking: true,
      options: ["엘리베이터", "CCTV", "택배함", "주차", "상권우수"],
      ratingAvg: 4.0,
      ratingCount: 0,
      ratingNoise: 3.5,
      ratingClean: 4.0,
      ratingFacility: 4.0,
      ratingManagement: 4.1,
      ratingSafety: 4.3,
      priceDeposit: 1200,
      priceMonthly: 60,
      createdAt: Date.now(),
    },
  ];
  for (const b of buildings) addBuilding(b);

  // 2) 임대인/관리소 프로필
  const profiles: Profile[] = [
    {
      id: "p-landlord-1",
      kind: "landlord",
      name: "김집주",
      buildingIds: ["b-1", "b-2"],
      ratingAvg: 4.4,
      ratingCount: 0,
      ratingTags: [
        { name: "응답 빠름", score: 4.6 },
        { name: "친절함", score: 4.5 },
        { name: "수리 처리", score: 4.2 },
        { name: "보증금 안정", score: 4.7 },
      ],
      responseRate: 95,
      responseHours: 4,
      phone: "02-1234-5678",
      createdAt: Date.now(),
    },
    {
      id: "p-landlord-2",
      kind: "landlord",
      name: "이월세",
      buildingIds: ["b-3"],
      ratingAvg: 3.6,
      ratingCount: 0,
      ratingTags: [
        { name: "응답 빠름", score: 3.2 },
        { name: "친절함", score: 3.5 },
        { name: "수리 처리", score: 3.4 },
      ],
      responseRate: 70,
      responseHours: 24,
      phone: "02-2345-6789",
      createdAt: Date.now(),
    },
    {
      id: "p-manager-1",
      kind: "manager",
      name: "상암오벨리스크 관리사무소",
      buildingIds: ["b-1", "b-2"],
      ratingAvg: 4.3,
      ratingCount: 0,
      ratingTags: [
        { name: "AS 처리", score: 4.5 },
        { name: "민원 응답", score: 4.4 },
        { name: "시설 관리", score: 4.2 },
      ],
      responseRate: 98,
      responseHours: 2,
      phone: "02-1111-2222",
      createdAt: Date.now(),
    },
    {
      id: "p-manager-2",
      kind: "manager",
      name: "이안상암 관리사무소",
      buildingIds: ["b-3"],
      ratingAvg: 3.4,
      ratingCount: 0,
      ratingTags: [
        { name: "AS 처리", score: 3.2 },
        { name: "민원 응답", score: 3.0 },
        { name: "시설 관리", score: 3.6 },
      ],
      responseRate: 60,
      responseHours: 36,
      phone: "02-3333-4444",
      createdAt: Date.now(),
    },
  ];
  for (const p of profiles) addProfile(p);

  // 3) 리뷰
  const reviewTpls: {
    buildingId: string;
    summary: string;
    content: string;
    pros: string[];
    cons: string[];
    category: Review["category"];
    rating: number;
    ratings: Review["ratings"];
    likedAs: string;
    period: string;
    author: string;
    role: UserRole;
  }[] = [
    {
      buildingId: "b-1",
      summary: "오래됐지만 관리는 잘 되어있어요",
      content: "10년 넘은 건물치고 깨끗하고 관리 잘 돼있어요. 단, 주차는 좀 빡빡한 편.",
      pros: ["관리 잘됨", "주변 상권 좋음", "조용함"],
      cons: ["주차 부족", "엘리베이터 느림"],
      category: "시설",
      rating: 4,
      ratings: { noise: 4, clean: 4, facility: 3, management: 4, safety: 5 },
      likedAs: "1인가구",
      period: "8개월",
      author: "퇴근후맥주",
      role: "tenant",
    },
    {
      buildingId: "b-1",
      summary: "집주인 친절하고 보증금 안전",
      content: "계약 전부터 친절하게 설명해주셨고, 보증금도 안전하게 반환 받았습니다.",
      pros: ["집주인 친절", "보증금 안정"],
      cons: ["주차"],
      category: "관리",
      rating: 5,
      ratings: { noise: 4, clean: 4, facility: 4, management: 5, safety: 5 },
      likedAs: "1인가구",
      period: "1년",
      author: "동네고양이집사",
      role: "tenant",
    },
    {
      buildingId: "b-1",
      summary: "옆 건물 공사 소음이 심했어요",
      content: "낮 시간대 공사 소음이 2주 넘게 계속되어서 재택이 힘들었습니다.",
      pros: ["관리사무소 대응 빠름"],
      cons: ["소음", "공사장 인접"],
      category: "소음",
      rating: 3,
      ratings: { noise: 2, clean: 4, facility: 3, management: 4, safety: 4 },
      likedAs: "재택근무",
      period: "6개월",
      author: "조용한호수",
      role: "tenant",
    },
    {
      buildingId: "b-2",
      summary: "신축이라 깨끗하고 보안 좋아요",
      content: "2018년 신축이라 내부 상태 깨끗하고, 게이트 보안 시스템이 확실해요.",
      pros: ["신축", "보안 우수", "깨끗함"],
      cons: ["월세 비쌈"],
      category: "청결",
      rating: 5,
      ratings: { noise: 4, clean: 5, facility: 5, management: 4, safety: 5 },
      likedAs: "1인가구",
      period: "1년",
      author: "분위기좋아",
      role: "tenant",
    },
    {
      buildingId: "b-2",
      summary: "1인 가구 최적, 가성비 좋아요",
      content: "1인 가구용 평면이 잘 짜여있고, 주변에 마트/편의점/카페 다 있어요.",
      pros: ["1인가구 최적", "주변시설", "신축"],
      cons: ["보증금 부담"],
      category: "구조",
      rating: 5,
      ratings: { noise: 5, clean: 5, facility: 5, management: 4, safety: 5 },
      likedAs: "1인가구",
      period: "10개월",
      author: "새벽산책러",
      role: "tenant",
    },
    {
      buildingId: "b-2",
      summary: "채광 좋아요",
      content: "남향 위주라 겨울에도 따뜻하고 햇빛 잘 들어요.",
      pros: ["채광", "남향"],
      cons: ["여름 더움"],
      category: "채광",
      rating: 4,
      ratings: { noise: 4, clean: 5, facility: 4, management: 4, safety: 5 },
      likedAs: "1인가구",
      period: "1년 2개월",
      author: "월세왕",
      role: "landlord",
    },
    {
      buildingId: "b-3",
      summary: "좀 오래됐지만 가성비는 좋아요",
      content: "2010년 빌라틱에 가까운데, 가격 대비 괜찮아요. 단, 엘리베이터가 좀 느려요.",
      pros: ["저렴", "역세권"],
      cons: ["엘리베이터 느림", "옛 느낌"],
      category: "주차",
      rating: 3,
      ratings: { noise: 3, clean: 3, facility: 3, management: 3, safety: 4 },
      likedAs: "1인가구",
      period: "2년",
      author: "안경잡이집주인",
      role: "landlord",
    },
    {
      buildingId: "b-3",
      summary: "관리소 응대가 느려요",
      content: "AS 요청했는데 일주일 넘게 답이 없었어요. 그게 좀 아쉽습니다.",
      pros: ["가격"],
      cons: ["관리소 응답 느림", "AS 지연"],
      category: "관리",
      rating: 3,
      ratings: { noise: 3, clean: 3, facility: 3, management: 2, safety: 4 },
      likedAs: "1인가구",
      period: "5개월",
      author: "조용한호수",
      role: "tenant",
    },
    {
      buildingId: "b-4",
      summary: "역은 가까운데 주차가 없어요",
      content: "상암역 도보 5분이라 위치는 좋은데 주차 공간이 없어서 차량 있으면 답이 없음.",
      pros: ["역세권", "가격"],
      cons: ["주차 불가", "소음"],
      category: "주차",
      rating: 3,
      ratings: { noise: 2, clean: 4, facility: 3, management: 3, safety: 4 },
      likedAs: "1인가구",
      period: "7개월",
      author: "퇴근후맥주",
      role: "tenant",
    },
    {
      buildingId: "b-4",
      summary: "소음 진짜 심함",
      content: "길 건너편 술집 + 주말 행인 소음 때문에 잠을 못 자요.",
      pros: ["역세권", "저렴"],
      cons: ["심한 소음", "주차"],
      category: "소음",
      rating: 2,
      ratings: { noise: 1, clean: 3, facility: 3, management: 3, safety: 4 },
      likedAs: "1인가구",
      period: "4개월",
      author: "동네고양이집사",
      role: "tenant",
    },
    {
      buildingId: "b-5",
      summary: "연남동 상권이 진짜 좋아요",
      content: "카페/맛집/버스 다 가까워서 1인 가구 라이프에 최고예요.",
      pros: ["상권", "동네 분위기", "교통"],
      cons: ["주차", "좀 좁은 평면"],
      category: "동네",
      rating: 5,
      ratings: { noise: 3, clean: 4, facility: 4, management: 4, safety: 5 },
      likedAs: "1인가구",
      period: "1년",
      author: "분위기좋아",
      role: "tenant",
    },
    {
      buildingId: "b-5",
      summary: "구조가 컴팩트해요",
      content: "1인 쓰기 딱 좋은 크기, 수납 잘 되어 있어요.",
      pros: ["구조", "수납"],
      cons: ["채광"],
      category: "구조",
      rating: 4,
      ratings: { noise: 4, clean: 4, facility: 5, management: 4, safety: 4 },
      likedAs: "1인가구",
      period: "8개월",
      author: "새벽산책러",
      role: "tenant",
    },
  ];
  let ri = 0;
  for (const t of reviewTpls) {
    addReview({
      id: `r-${ri}`,
      buildingId: t.buildingId,
      authorId: `seed-reviewer-${ri}`,
      authorNickname: t.author,
      authorRole: t.role,
      rating: t.rating,
      ratings: t.ratings,
      summary: t.summary,
      content: t.content,
      pros: t.pros,
      cons: t.cons,
      category: t.category,
      likedAs: t.likedAs,
      period: t.period,
      likes: Math.floor(Math.random() * 8),
      createdAt: Date.now() - ri * 1000 * 60 * 60 * 24,
    });
    ri++;
  }

  // 4) 편의 서비스
  const services: Service[] = [
    {
      id: "s-1",
      category: "clean",
      name: "깔끔한 청소 119",
      description: "입주/퇴거 청소, 정기 청소, 화장실/주방 깊은 청소까지",
      price: "5만원~",
      rating: 4.8,
      reviewCount: 234,
      tags: ["당일 가능", "에어컨 포함", "카드 가능"],
      phone: "1588-0101",
      sigungu: "마포구",
      createdAt: Date.now(),
    },
    {
      id: "s-2",
      category: "clean",
      name: "집닥 청소",
      description: "원룸·투룸 전문, 1인 가구 친화적 가격",
      price: "3만원~",
      rating: 4.6,
      reviewCount: 412,
      tags: ["저렴", "1인 가구 전문"],
      phone: "1588-0202",
      sigungu: "마포구",
      createdAt: Date.now(),
    },
    {
      id: "s-3",
      category: "move",
      name: "스피드 이사",
      description: "원룸/투룸 당일 이사, 포장재 무료",
      price: "15만원~",
      rating: 4.7,
      reviewCount: 891,
      tags: ["당일 가능", "포장재 무료"],
      phone: "1588-0303",
      sigungu: "마포구",
      createdAt: Date.now(),
    },
    {
      id: "s-4",
      category: "move",
      name: "든든 이사",
      description: "장거리 이사, 보관이사, 가성비 갑",
      price: "20만원~",
      rating: 4.5,
      reviewCount: 567,
      tags: ["저렴", "장거리"],
      phone: "1588-0404",
      sigungu: "서울 전역",
      createdAt: Date.now(),
    },
    {
      id: "s-5",
      category: "as",
      name: "상암AS센터",
      description: "싱크대, 보일러, 도어락, 전기 AS 출장 1시간",
      price: "3만원~",
      rating: 4.7,
      reviewCount: 178,
      tags: ["당일 가능", "마포 전지역 1시간"],
      phone: "02-500-5050",
      sigungu: "마포구",
      buildingIds: ["b-1", "b-2", "b-3"],
      createdAt: Date.now(),
    },
    {
      id: "s-6",
      category: "as",
      name: "에어컨 청소 천사",
      description: "벽걸이/스탠드 에어컨 분해 청소, 항균코팅",
      price: "2.5만원~",
      rating: 4.6,
      reviewCount: 1023,
      tags: ["당일 가능", "에어컨 전문"],
      phone: "1588-0505",
      sigungu: "서울 전역",
      createdAt: Date.now(),
    },
    {
      id: "s-7",
      category: "delivery",
      name: "부재중 택배 보관함",
      description: "관리사무소 대신 24시간 무인 보관, 문자 알림",
      price: "1회 1,000원",
      rating: 4.4,
      reviewCount: 234,
      tags: ["24시간", "문자 알림"],
      phone: "02-600-6060",
      sigungu: "마포구",
      buildingIds: ["b-1", "b-2"],
      createdAt: Date.now(),
    },
    {
      id: "s-8",
      category: "utility",
      name: "프리미엄 인터넷 설치",
      description: "기가 인터넷, IPTV, 공유기 일체 설치",
      price: "월 1.9만원~",
      rating: 4.5,
      reviewCount: 678,
      tags: ["SK/LG/KT 모두 가능", "당일 설치"],
      phone: "1588-0707",
      sigungu: "서울 전역",
      createdAt: Date.now(),
    },
    {
      id: "s-9",
      category: "utility",
      name: "가스/전기 일괄 신청",
      description: "입주 시 도시가스·전기 한 번에",
      price: "무료",
      rating: 4.3,
      reviewCount: 89,
      tags: ["무료", "당일 처리"],
      phone: "1588-0808",
      sigungu: "서울 전역",
      createdAt: Date.now(),
    },
    {
      id: "s-10",
      category: "finance",
      name: "오피스텔 전세 대출 컨설팅",
      description: "1인가구 맞춤, 비교 5개사 무료",
      price: "무료",
      rating: 4.6,
      reviewCount: 145,
      tags: ["무료 상담", "비교 5사"],
      phone: "1588-0909",
      sigungu: "서울 전역",
      createdAt: Date.now(),
    },
    {
      id: "s-11",
      category: "food",
      name: "오늘의 도시락",
      description: "1인 가구 맞춤 도시락, 매일 다른 메뉴",
      price: "5,900원~",
      rating: 4.7,
      reviewCount: 2341,
      tags: ["매일 신선", "1인분"],
      phone: "1588-1010",
      sigungu: "마포구",
      createdAt: Date.now(),
    },
    {
      id: "s-12",
      category: "food",
      name: "심야 김밥천국",
      description: "새벽 3시까지, 야식 배달",
      price: "3,000원~",
      rating: 4.4,
      reviewCount: 876,
      tags: ["24시", "야식"],
      phone: "1588-1111",
      sigungu: "마포구",
      createdAt: Date.now(),
    },
  ];
  for (const s of services) addService(s);

  // 5) 시드 사용자(현재 거주=오벨리스크 2차)와 건물 연결
  const seedUserId = "seed-user-1";
  linkBuilding(seedUserId, "b-2", "live");
  linkBuilding(seedUserId, "b-1", "interested");
  linkBuilding(seedUserId, "b-5", "interested");

  // 6) 앱 공지사항 시드
  const notices = [
    {
      id: "notice-1",
      category: "update" as const,
      title: "OFFICELINK v0.3 출시!",
      content: "안녕하세요, OFFICELINK 팀입니다.\n\n드디어 v0.3가 출시되었습니다!\n\n• 건물 리뷰 & 평점 시스템\n• 임대인/관리소 평판 페이지\n• 1인가구 맞춤 편의 서비스\n• 우리 집 대시보드\n\n여러분의 소중한 리뷰 한 편이 누군가의 인생을 바꿀 수 있어요.",
      important: false,
      createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    },
    {
      id: "notice-2",
      category: "event" as const,
      title: "🎉 첫 리뷰 쓰기 이벤트",
      content: "오피스텔 첫 리뷰를 작성하면 추첨을 통해\n스타벅스 아메리카노 쿠폰을 드려요!\n\n기간: ~ 6/30까지\n참여: 프로필 > 리뷰 쓰기",
      important: false,
      createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
    },
    {
      id: "notice-3",
      category: "system" as const,
      title: "[중요] 약관 개정 안내",
      content: "개인정보 처리방침이 개정됩니다.\n주요 변경: 리뷰 데이터 보관 기간 명확화\n시행일: 2024-07-01",
      important: true,
      createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
    },
    {
      id: "notice-4",
      category: "info" as const,
      title: "상암동 신규 건물 추가 안내",
      content: "상암동에 새로운 오피스텔 3개가 추가되었습니다.\n마포구 상암동의 다양한 선택지를 확인해 보세요!",
      important: false,
      createdAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
    },
  ];
  window.localStorage.setItem("officelink:notices", JSON.stringify(notices));

  // 7) 시드 리뷰에 임대인/관리소 답글 몇 개
  const replies = [
    {
      id: "reply-1",
      reviewId: "r-1",
      buildingId: "b-1",
      authorKind: "manager" as const,
      authorName: "상암오벨리스크 관리사무소",
      content: "소중한 리뷰 감사합니다. 주차 공간 확보를 위해 월별 외부 주차장 계약 검토 중이에요.",
      createdAt: Date.now() - 20 * 24 * 60 * 60 * 1000,
    },
    {
      id: "reply-2",
      reviewId: "r-4",
      buildingId: "b-2",
      authorKind: "landlord" as const,
      authorName: "김집주",
      content: "좋은 리뷰 감사합니다! 1인 가구 분들을 위해 소음 관련 안내도 더 강화할게요.",
      createdAt: Date.now() - 15 * 24 * 60 * 60 * 1000,
    },
    {
      id: "reply-3",
      reviewId: "r-8",
      buildingId: "b-3",
      authorKind: "manager" as const,
      authorName: "이안상암 관리사무소",
      content: "AS 지연에 죄송합니다. 응답체계 개선을 위해 7월부터 야간 당직을 강화합니다.",
      createdAt: Date.now() - 12 * 24 * 60 * 60 * 1000,
    },
  ];
  window.localStorage.setItem("officelink:reviewReplies", JSON.stringify(replies));

  // 8) 좋아요 시드 (시드 글들에 랜덤 좋아요 표시)
  const likedIds = ["r-0", "r-1", "r-3", "r-4", "r-10"];
  window.localStorage.setItem("officelink:likedPosts", JSON.stringify(likedIds));

  // 9) 외국인 단기임대 리스팅 (v0.6)
  const listings = [
    {
      id: "st-1",
      hostId: "host-1",
      hostNickname: "Jenny (🇰🇷 5년차)",
      buildingId: "b-2",
      buildingName: "상암오벨리스크 2차",
      unitNumber: "1208",
      pricePerDay: 55000,
      pricePerWeek: 320000,
      pricePerMonth: 1100000,
      currency: "KRW" as const,
      minStay: 3,
      maxStay: 60,
      availableFrom: Date.now(),
      availableTo: Date.now() + 90 * 86400 * 1000,
      rooms: 1,
      bathrooms: 1,
      area: 23,
      furnished: true,
      utilities: true,
      wifi: true,
      kitchen: true,
      washer: true,
      ac: true,
      heating: true,
      hostLangs: ["ko", "en"] as const,
      description: {
        ko: "월 단기/장기 모두 가능. 조용하고 깨끗한 신축 오피스텔. 지하철 5분, 마트·편의점 도보 3분. 장기 계약 시 네고 가능.",
        en: "Monthly/short-term both available. Quiet, clean new officetel. 5 min to subway, 3 min walk to mart/convenience store. Long-term negotiable.",
        ja: "月単位·短期両方可能。静かで清潔な新築オフィステル。地下鉄5分、コンビニ3分。長期契約割引可能。",
        zh: "可月租/短租。安静干净的新建公寓。地铁5分钟，步行3分钟到超市便利店。长租可议价。",
      },
      rules: {
        ko: ["비흡연", "반려동물 불가", "파티 금지", "밤 10시 이후 조용히"],
        en: ["No smoking", "No pets", "No parties", "Quiet after 10 PM"],
        ja: ["禁煙", "ペット不可", "パーティー禁止", "22時以降は静かに"],
        zh: ["禁烟", "不可养宠物", "禁止派对", "晚上10点后保持安静"],
      },
      views: 234,
      inquiries: 12,
      status: "open" as const,
      createdAt: Date.now() - 3 * 86400 * 1000,
    },
    {
      id: "st-2",
      hostId: "host-2",
      hostNickname: "Yuki (🇯🇵 Tokyo)",
      buildingId: "b-5",
      buildingName: "연남동 로얄오피스텔",
      unitNumber: "503",
      pricePerDay: 65000,
      pricePerWeek: 380000,
      pricePerMonth: 1200000,
      currency: "KRW" as const,
      minStay: 7,
      availableFrom: Date.now() - 7 * 86400 * 1000,
      rooms: 1,
      bathrooms: 1,
      area: 28,
      furnished: true,
      utilities: true,
      wifi: true,
      kitchen: true,
      washer: true,
      ac: true,
      heating: true,
      hostLangs: ["ko", "en", "ja"] as const,
      description: {
        ko: "연남동 한복판, 카페/맛집 도보 5분. 일본인 호스트라 일본어 가능. 비즈니스 출장족 추천.",
        en: "Right in Yeonnam-dong, 5 min walk to cafes/restaurants. Japanese host speaks Japanese. Perfect for business trips.",
        ja: "연남洞中心部、カフェ/レストラン徒歩5分。日本人ホストが日本語で対応可能。ビジネス出張に最適。",
      },
      rules: {
        ko: ["비흡연", "파티 금지"],
        en: ["No smoking", "No parties"],
        ja: ["禁煙", "パーティー禁止"],
      },
      views: 156,
      inquiries: 8,
      status: "open" as const,
      createdAt: Date.now() - 7 * 86400 * 1000,
    },
    {
      id: "st-3",
      hostId: "host-3",
      hostNickname: "David (🇺🇸 Seoul)",
      buildingId: "b-1",
      buildingName: "상암오벨리스크 1차",
      unitNumber: "1405",
      pricePerDay: 50000,
      pricePerWeek: 290000,
      pricePerMonth: 1000000,
      currency: "KRW" as const,
      minStay: 2,
      maxStay: 90,
      availableFrom: Date.now(),
      rooms: 1,
      bathrooms: 1,
      area: 21,
      furnished: true,
      utilities: false,
      wifi: true,
      kitchen: true,
      washer: true,
      ac: true,
      heating: false,
      hostLangs: ["en", "ko"] as const,
      description: {
        en: "Cozy studio near DMC, perfect for foreigners working at nearby tech companies. English/한국어 OK. Airport bus 30 min.",
        ko: "디지털미디어시티 인근, 외국계 IT 회사 출장족에게 최적. 영어/한국어 OK. 공항버스 30분.",
      },
      rules: {
        en: ["No smoking", "No parties", "Quiet after 10 PM"],
        ko: ["비흡연", "파티 금지", "밤 10시 이후 조용히"],
      },
      views: 412,
      inquiries: 25,
      status: "open" as const,
      createdAt: Date.now() - 1 * 86400 * 1000,
    },
  ];
  window.localStorage.setItem("officelink:listings", JSON.stringify(listings));

  // 10) 이벤트 시드
  const events = [
    {
      id: "ev-1",
      hostId: "host-ev-1",
      hostNickname: "상암동 주민회",
      title: "🌸 상암동 벚꽃 산책",
      description: "DMC 산책로 따라 벚꽃 보고 가벼운 산책. 1시간 정도. 끝나고 카페에서 옵셔널 모임.",
      category: "meetup",
      location: "DMC역 2번 출구 앞",
      startsAt: Date.now() + 7 * 86400 * 1000,
      endsAt: Date.now() + 7 * 86400 * 1000 + 3600 * 1000,
      maxParticipants: 20,
      participants: [
        { userId: "p1", nickname: "Alice", joinedAt: Date.now() - 86400000 },
        { userId: "p2", nickname: "Bob", joinedAt: Date.now() - 43200000 },
      ],
      createdAt: Date.now() - 2 * 86400 * 1000,
    },
    {
      id: "ev-2",
      hostId: "host-ev-2",
      hostNickname: "오피스텔 러닝크루",
      title: "🏃 주말 아침 러닝",
      description: "매주 토요일 아침 7시, 한강공원에서 5km 러닝. 페이스 자유, 초보 환영!",
      category: "sports",
      location: "망원한강공원",
      startsAt: Date.now() + 3 * 86400 * 1000,
      endsAt: Date.now() + 3 * 86400 * 1000 + 5400 * 1000,
      maxParticipants: 30,
      participants: [
        { userId: "p3", nickname: "Charlie", joinedAt: Date.now() - 100000 },
      ],
      createdAt: Date.now() - 5 * 86400 * 1000,
    },
  ];
  window.localStorage.setItem("officelink:events", JSON.stringify(events));

  // 11) 그룹 채팅 시드
  const groups = [
    {
      id: "gr-1",
      name: "🌐 상암동 외국인 모임",
      description: "외국인 + 한국인 같이 얘기해요",
      emoji: "🌐",
      members: [seedUserId, "host-1", "host-2", "host-3"],
      createdAt: Date.now() - 14 * 86400 * 1000,
      lastMessageAt: Date.now() - 3600 * 1000,
      lastMessagePreview: "Hi everyone! See you at cherry blossom walk!",
    },
    {
      id: "gr-2",
      name: "🍱 1인가구 밥모임",
      description: "혼자 먹기 싫을 때 같이 밥 먹어요",
      emoji: "🍱",
      members: [seedUserId, "p1", "p2"],
      createdAt: Date.now() - 7 * 86400 * 1000,
      lastMessageAt: Date.now() - 1800 * 1000,
      lastMessagePreview: "내일 저녁 7시 연남동?",
    },
  ];
  const groupMsgs = [
    {
      id: "gm-1",
      roomId: "gr-1",
      authorId: "host-1",
      authorNickname: "Jenny (🇰🇷 5년차)",
      authorRole: "tenant",
      content: "Hi everyone! See you at cherry blossom walk next week!",
      createdAt: Date.now() - 7200 * 1000,
    },
    {
      id: "gm-2",
      roomId: "gr-1",
      authorId: "host-2",
      authorNickname: "Yuki (🇯🇵 Tokyo)",
      authorRole: "tenant",
      content: "ありがとうございます！楽しみにしています 🌸",
      createdAt: Date.now() - 3600 * 1000,
    },
    {
      id: "gm-3",
      roomId: "gr-2",
      authorId: "p1",
      authorNickname: "Alice",
      authorRole: "tenant",
      content: "내일 저녁 7시 연남동?",
      createdAt: Date.now() - 1800 * 1000,
    },
  ];
  window.localStorage.setItem("officelink:groups", JSON.stringify(groups));
  window.localStorage.setItem("officelink:groupMsgs", JSON.stringify(groupMsgs));

  window.localStorage.setItem("officelink:seeded:v3", "1");
}
