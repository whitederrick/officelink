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
