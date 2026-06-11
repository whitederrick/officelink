// 사용자 역할
export type UserRole = "tenant" | "landlord" | "manager";

// 사용자
export interface User {
  id: string;
  nickname: string;
  role: UserRole;
  createdAt: number;
}

// 주소 등록 (현 거주지 / 임대지 / 관리지)
export interface Address {
  id: string;
  userId: string;
  role: UserRole; // 이 주소의 용도
  sido: string; // 시/도
  sigungu: string; // 시/군/구
  dong: string; // 동
  detail: string; // 상세주소 (오피스텔명, 동/호수 등)
  label: string; // 사용자가 보는 라벨
  isPrimary: boolean; // 현 거주지 여부
  createdAt: number;
}

// 채널 종류
export type ChannelKind =
  | "tenant-building" // 임차인 - 오피스텔
  | "tenant-region" // 임차인 - 지역(동)
  | "landlord-building" // 임대인 - 오피스텔
  | "landlord-region" // 임대인 - 지역(동)
  | "manager-building" // 관리인 - 오피스텔
  | "manager-region" // 관리인 - 지역(동)
  | "public"; // 공용 오픈 채널

// 채널
export interface Channel {
  id: string;
  kind: ChannelKind;
  scopeKey: string; // 채널 식별 키 (예: "building:상암오벨리스크2차" / "region:마포구:상암동" / "public:동네친구")
  title: string;
  description?: string;
  category?: string; // 공용 채널 카테고리
  createdAt: number;
}

// 카테고리 (게시글)
export type PostCategory =
  | "자유"
  | "공동구매"
  | "중고거래"
  | "무료나눔"
  | "소모임"
  | "꿀팁"
  | "민원"
  | "질문";

// 게시글
export interface Post {
  id: string;
  channelId: string;
  authorId: string;
  authorNickname: string;
  authorRole: UserRole;
  category: PostCategory;
  title: string;
  content: string;
  images?: string[]; // base64 dataURL
  likes: number;
  commentCount: number;
  views: number;
  createdAt: number;
}

// 댓글
export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorNickname: string;
  authorRole: UserRole;
  content: string;
  likes: number;
  parentId?: string; // 대댓글
  createdAt: number;
}

// 알림 종류
export type NotifType = "like" | "comment" | "reply" | "notice";

// 알림
export interface Notification {
  id: string;
  type: NotifType;
  recipientId: string; // 받는 사람
  actorNickname: string; // 행동한 사람
  actorRole: UserRole;
  postId?: string;
  commentId?: string;
  message: string;
  read: boolean;
  createdAt: number;
}

// DM 메시지
export interface DMMessage {
  id: string;
  fromId: string;
  fromNickname: string;
  fromRole: UserRole;
  toId: string;
  toNickname: string;
  toRole: UserRole;
  content: string;
  read: boolean;
  createdAt: number;
}

// DM 대화 (두 사람 사이의 메시지 묶음)
export interface DMThread {
  peerId: string;
  peerNickname: string;
  peerRole: UserRole;
  lastMessage: string;
  lastAt: number;
  unread: number;
}

// =============================================
// v0.3 — 오피스텔 리뷰 + 평가 + 편의 서비스
// =============================================

// 오피스텔/건물
export interface Building {
  id: string;
  name: string; // 오피스텔/건물명
  address: string; // 풀 주소
  sigungu: string;
  dong: string;
  // 기본 정보
  builtYear?: number; // 준공연도
  totalUnits?: number; // 총 세대수
  floors?: number; // 층수
  parking?: boolean; // 주차 가능
  options?: string[]; // 옵션 (엘리베이터, 택배함, cctv 등)
  // 평점
  ratingAvg: number; // 0~5
  ratingCount: number;
  // 카테고리 평점 (5개)
  ratingNoise: number; // 소음
  ratingClean: number; // 청결
  ratingFacility: number; // 시설
  ratingManagement: number; // 관리
  ratingSafety: number; // 방범/안전
  // 시세
  priceDeposit?: number; // 최근 평균 보증금 (만원)
  priceMonthly?: number; // 최근 평균 월세 (만원)
  createdAt: number;
}

// 리뷰 카테고리
export type ReviewCategory =
  | "소음"
  | "청결"
  | "시설"
  | "관리"
  | "주차"
  | "채광"
  | "구조"
  | "동네";

// 리뷰
export interface Review {
  id: string;
  buildingId: string;
  authorId: string;
  authorNickname: string;
  authorRole: UserRole;
  // 별점
  rating: number; // 0~5 (전체)
  ratings: {
    noise: number;
    clean: number;
    facility: number;
    management: number;
    safety: number;
  };
  // 한줄평
  summary: string;
  content: string;
  // 장점/단점 태그
  pros: string[];
  cons: string[];
  category: ReviewCategory;
  // 호환성
  likedAs?: string; // 1인가구/커플/직장인 등
  period?: string; // 거주 기간 (예: "6개월")
  // 이미지 (리뷰 사진)
  images?: string[];
  // 메타
  likes: number;
  createdAt: number;
}

// 임대인/관리인 평판
export interface Profile {
  id: string; // 임대인/관리인 ID (nickname 기반)
  kind: "landlord" | "manager";
  name: string; // 노출명
  buildingIds: string[]; // 운영 건물
  ratingAvg: number;
  ratingCount: number;
  ratingTags: { name: string; score: number }[]; // 태그별 점수
  responseRate: number; // 응답률 (0~100)
  responseHours: number; // 평균 응답 시간
  // 연락
  phone?: string;
  createdAt: number;
}

// 서비스 카테고리
export type ServiceCategory =
  | "clean" // 청소
  | "move" // 이사
  | "as" // AS 수리
  | "delivery" // 택배/짐 보관
  | "utility" // 인터넷/가스/전기
  | "finance" // 대출/보험
  | "food" // 생활밀착 (밥/배달)
  | "etc";

// 편의 서비스 업체
export interface Service {
  id: string;
  category: ServiceCategory;
  name: string; // 업체명
  description: string;
  price: string; // 가격대 ("5만원대~" 등)
  rating: number; // 4.5 등
  reviewCount: number;
  tags: string[]; // ["24시", "당일", "카드가능"]
  phone: string;
  sigungu: string; // 서비스 가능 지역
  buildingIds?: string[]; // 특정 건물 제휴 시
  createdAt: number;
}

// 건물-사용자 관계 (내가 사는 건물, 관심 건물)
export interface BuildingLink {
  userId: string;
  buildingId: string;
  relation: "live" | "interested" | "past";
  createdAt: number;
}

// 리뷰 답글 (임대인/관리소)
export interface ReviewReply {
  id: string;
  reviewId: string;
  buildingId: string;
  authorKind: "landlord" | "manager";
  authorName: string;
  content: string;
  createdAt: number;
}

// AS 요청
export type ASStatus = "received" | "in_progress" | "done" | "rejected";
export interface ASRequest {
  id: string;
  userId: string;
  userNickname: string;
  buildingId: string;
  buildingName: string;
  managerName: string;
  category: string; // 보일러/도어록/싱크대/기타
  description: string;
  preferredAt?: string; // 희망 시간
  phone: string;
  status: ASStatus;
  createdAt: number;
}

// 앱 공지사항
export interface Notice {
  id: string;
  category: "update" | "event" | "system" | "info";
  title: string;
  content: string;
  important: boolean;
  createdAt: number;
}

// 신고
export interface Report {
  id: string;
  reporterId: string;
  targetType: "post" | "comment" | "review" | "user";
  targetId: string;
  reason: string;
  description?: string;
  createdAt: number;
}

// 즐겨찾기 서비스
export interface FavoriteService {
  userId: string;
  serviceId: string;
  createdAt: number;
}

// =============================================
// v0.4 — 대시보드, 차트, 해시태그, 투표, i18n
// =============================================

// 건물 공지사항 (관리소 전용)
export interface BuildingNotice {
  id: string;
  buildingId: string;
  authorId: string;
  authorName: string;
  title: string;
  content: string;
  important: boolean;
  createdAt: number;
}

// 익명 투표
export interface Poll {
  id: string;
  channelId?: string; // 특정 채널에 속하면
  postId?: string; // 특정 글에 속하면
  buildingId?: string; // 특정 건물에 속하면
  question: string;
  options: { id: string; text: string; votes: number }[];
  voters: string[]; // userId 목록 (중복 방지)
  multiple: boolean; // 복수 선택 허용
  endsAt?: number; // 종료 시각
  createdAt: number;
}

// 해시태그
export interface Hashtag {
  tag: string;
  count: number;
}

// 키워드 알림 (관심 단어)
export interface KeywordAlert {
  userId: string;
  keyword: string;
  createdAt: number;
}

// 월별 관리비 (mock)
export interface ManagementFee {
  id: string;
  buildingId: string;
  unitNumber?: string; // 호수
  year: number;
  month: number;
  base: number; // 기본 관리비
  utilities: number; // 공과금
  total: number;
  paid: boolean;
  createdAt: number;
}

// 건물 차트 데이터 (계산된 것)
export interface BuildingStats {
  buildingId: string;
  totalReviews: number;
  ratingDistribution: { star: number; count: number }[];
  categoryAverages: {
    noise: number;
    clean: number;
    facility: number;
    management: number;
    safety: number;
  };
  monthlyReviews: { month: string; count: number; avgRating: number }[];
  tagCloud: { tag: string; count: number; sentiment: "pos" | "neg" }[];
}

// 동네별 통계
export interface NeighborhoodStats {
  name: string;
  buildingCount: number;
  avgRating: number;
  totalReviews: number;
  topTags: string[];
}

// =============================================
// v0.6 — 외국인 단기임대 / 이벤트 / 차단 / 그룹채팅
// =============================================

// 외국인 단기임대 (Short-term rental for foreigners)
export type StaysFor = "monthly" | "weekly" | "daily" | "yearly";
export type StaysLang = "ko" | "en" | "ja" | "zh";

export interface ShortTermListing {
  id: string;
  hostId: string;
  hostNickname: string;
  buildingId: string;
  buildingName: string;
  unitNumber: string;
  pricePerDay: number;
  pricePerWeek: number;
  pricePerMonth: number;
  currency: "KRW" | "USD" | "JPY" | "CNY";
  minStay: number; // 최소 며칠
  maxStay?: number; // 최대 며칠
  availableFrom: number;
  availableTo?: number;
  rooms: number; // 방 개수
  bathrooms: number;
  area: number; // ㎡
  furnished: boolean;
  utilities: boolean; // 공과금 포함
  wifi: boolean;
  kitchen: boolean;
  washer: boolean;
  ac: boolean;
  heating: boolean;
  // 다국어 호스트 가능 언어
  hostLangs: StaysLang[];
  description: { [K in StaysLang]?: string };
  rules: { [K in StaysLang]?: string[] };
  images?: string[];
  views: number;
  inquiries: number;
  status: "open" | "closed";
  createdAt: number;
}

// 이벤트/모임
export type EventCategory = "meetup" | "party" | "sports" | "study" | "food" | "other";
export interface CommunityEvent {
  id: string;
  hostId: string;
  hostNickname: string;
  title: string;
  description: string;
  category: EventCategory;
  location: string; // 텍스트 위치
  startsAt: number;
  endsAt?: number;
  maxParticipants: number;
  participants: { userId: string; nickname: string; joinedAt: number }[];
  createdAt: number;
}

// 차단
export interface BlockedUser {
  blockerId: string;
  blockedId: string;
  blockedNickname: string;
  createdAt: number;
}

// 그룹 채팅
export interface GroupRoom {
  id: string;
  name: string;
  description: string;
  emoji: string;
  members: string[]; // userId[]
  createdAt: number;
  lastMessageAt: number;
  lastMessagePreview: string;
}
export interface GroupMessage {
  id: string;
  roomId: string;
  authorId: string;
  authorNickname: string;
  authorRole: UserRole;
  content: string;
  createdAt: number;
}
