// 도메인 저장소(Repository) 계층.
//
// 화면/Route Handler 는 이 모듈의 함수만 호출한다. 내부 저장 방식(현재: 파일 기반 db.ts)이
// 바뀌어도 이 인터페이스가 유지되면 호출하는 쪽은 수정할 필요가 없다.
// → 나중에 Postgres 로 전환할 때 이 파일의 구현만 교체하면 된다.

import type {
  Address,
  ASRequest,
  BlockedUser,
  Building,
  BuildingLink,
  BuildingNotice,
  Channel,
  Comment,
  CommunityEvent,
  DMMessage,
  GroupMessage,
  GroupRoom,
  ManagementFee,
  Notice,
  Notification,
  Poll,
  Post,
  Profile,
  Relationship,
  Report,
  Review,
  ReviewReply,
  Service,
  ShortTermListing,
  User,
} from "@/types";
import { Collection, uid } from "./db";

// ----- 컬렉션 정의 -----
export const users = new Collection<User>("users");
export const addresses = new Collection<Address>("addresses");
export const channels = new Collection<Channel>("channels");
export const posts = new Collection<Post>("posts");
export const comments = new Collection<Comment>("comments");
export const notifications = new Collection<Notification>("notifications");
export const dms = new Collection<DMMessage & { id: string }>("dms");
export const buildings = new Collection<Building>("buildings");
export const reviews = new Collection<Review>("reviews");
export const reviewReplies = new Collection<ReviewReply>("reviewReplies");
export const profiles = new Collection<Profile>("profiles");
export const services = new Collection<Service>("services");
export const buildingLinks = new Collection<BuildingLink & { id: string }>(
  "buildingLinks",
);
export const notices = new Collection<Notice>("notices");
export const polls = new Collection<Poll>("polls");
export const asRequests = new Collection<ASRequest>("asRequests");
export const buildingNotices = new Collection<BuildingNotice>("buildingNotices");
export const fees = new Collection<ManagementFee>("fees");
export const listings = new Collection<ShortTermListing>("listings");
export const events = new Collection<CommunityEvent>("events");
export const groups = new Collection<GroupRoom>("groups");
export const groupMsgs = new Collection<GroupMessage>("groupMsgs");
export const blocked = new Collection<BlockedUser & { id: string }>("blocked");
export const reports = new Collection<Report>("reports");
export const relationships = new Collection<Relationship>("relationships");

export { uid };

// =============================================
// Buildings
// =============================================
export function listBuildings(filter?: {
  sigungu?: string;
  dong?: string;
  minRating?: number;
}): Building[] {
  let list = buildings.all();
  if (filter?.sigungu) list = list.filter((b) => b.sigungu === filter.sigungu);
  if (filter?.dong) list = list.filter((b) => b.dong === filter.dong);
  if (filter?.minRating)
    list = list.filter((b) => b.ratingAvg >= filter.minRating!);
  return list;
}

// =============================================
// Reviews — 작성 시 건물 평점 재계산
// =============================================
export function listReviews(buildingId?: string): Review[] {
  const all = buildingId
    ? reviews.filter((r) => r.buildingId === buildingId)
    : reviews.all();
  return all.sort((a, b) => b.createdAt - a.createdAt);
}

export function createReview(r: Review): Review {
  reviews.insert(r);
  recomputeBuildingRating(r.buildingId);
  return r;
}

export function recomputeBuildingRating(buildingId: string): void {
  const list = listReviews(buildingId);
  if (list.length === 0) return;
  const avg = (k: keyof Review["ratings"]) =>
    list.reduce((s, r) => s + r.ratings[k], 0) / list.length;
  const ratingAvg = list.reduce((s, r) => s + r.rating, 0) / list.length;
  const round = (n: number) => Math.round(n * 10) / 10;
  buildings.update(buildingId, {
    ratingAvg: round(ratingAvg),
    ratingCount: list.length,
    ratingNoise: round(avg("noise")),
    ratingClean: round(avg("clean")),
    ratingFacility: round(avg("facility")),
    ratingManagement: round(avg("management")),
    ratingSafety: round(avg("safety")),
  });
}

// =============================================
// Posts / Comments
// =============================================
export function listPostsByChannel(channelId: string): Post[] {
  return posts
    .filter((p) => p.channelId === channelId)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function getPostAndIncrementView(id: string): Post | undefined {
  const post = posts.byId(id);
  if (!post) return undefined;
  return posts.update(id, { views: post.views + 1 });
}

export function likePost(id: string): Post | undefined {
  const post = posts.byId(id);
  if (!post) return undefined;
  return posts.update(id, { likes: post.likes + 1 });
}

export function createComment(c: Comment): Comment {
  comments.insert(c);
  const post = posts.byId(c.postId);
  if (post) posts.update(c.postId, { commentCount: post.commentCount + 1 });
  return c;
}

export function listComments(postId: string): Comment[] {
  return comments
    .filter((c) => c.postId === postId)
    .sort((a, b) => a.createdAt - b.createdAt);
}

// =============================================
// Notices / Services / Polls
// =============================================
export function listNotices(): Notice[] {
  return notices.all().sort((a, b) => b.createdAt - a.createdAt);
}

export function listServices(category?: string): Service[] {
  const all = category
    ? services.filter((s) => s.category === category)
    : services.all();
  return all.sort((a, b) => b.rating - a.rating);
}

export function listPolls(filter?: {
  postId?: string;
  buildingId?: string;
  channelId?: string;
}): Poll[] {
  let all = polls.all();
  if (filter?.postId) all = all.filter((p) => p.postId === filter.postId);
  if (filter?.buildingId)
    all = all.filter((p) => p.buildingId === filter.buildingId);
  if (filter?.channelId)
    all = all.filter((p) => p.channelId === filter.channelId);
  return all.sort((a, b) => b.createdAt - a.createdAt);
}

export function votePoll(
  pollId: string,
  optionIds: string[],
  userId: string,
): Poll | undefined {
  const poll = polls.byId(pollId);
  if (!poll) return undefined;
  if (poll.voters.includes(userId)) return poll; // 중복 투표 방지
  return polls.update(pollId, {
    voters: [...poll.voters, userId],
    options: poll.options.map((o) =>
      optionIds.includes(o.id) ? { ...o, votes: o.votes + 1 } : o,
    ),
  });
}

// =============================================
// Addresses + 채널 자동 개설
// (lib/channels.ts 의 로직을 서버에 포팅)
// =============================================
import type { ChannelKind, UserRole } from "@/types";

const ROLE_TO_KIND: Record<
  UserRole,
  { building: ChannelKind; region: ChannelKind }
> = {
  tenant: { building: "tenant-building", region: "tenant-region" },
  landlord: { building: "landlord-building", region: "landlord-region" },
  manager: { building: "manager-building", region: "manager-region" },
};

const ROLE_LABEL: Record<UserRole, string> = {
  tenant: "임차인",
  landlord: "임대인",
  manager: "관리인",
};

export function buildingScopeOf(detail: string): string {
  return `building:${detail}`;
}
export function regionScopeOf(sigungu: string, dong: string): string {
  return `region:${sigungu}:${dong}`;
}

/** 주소가 등록되면 해당 오피스텔 + 지역 채널을 (없으면) 자동 개설. */
export function ensureChannelsForAddress(addr: Address): Channel[] {
  const { building: buildingKind, region: regionKind } = ROLE_TO_KIND[addr.role];
  const roleLabel = ROLE_LABEL[addr.role];
  const created: Channel[] = [];

  const buildingScope = buildingScopeOf(addr.detail);
  if (!channels.find((c) => c.scopeKey === buildingScope)) {
    created.push(
      channels.insert({
        id: uid(),
        kind: buildingKind,
        scopeKey: buildingScope,
        title: `${addr.detail} ${roleLabel} 전용 채널`,
        description: `${addr.sido} ${addr.sigungu} ${addr.dong} · ${addr.detail}`,
        createdAt: Date.now(),
      }),
    );
  }

  const regionScope = regionScopeOf(addr.sigungu, addr.dong);
  if (!channels.find((c) => c.scopeKey === regionScope)) {
    created.push(
      channels.insert({
        id: uid(),
        kind: regionKind,
        scopeKey: regionScope,
        title: `${addr.sigungu} ${addr.dong} ${roleLabel} 전용 채널`,
        description: `${addr.sido} ${addr.sigungu} ${addr.dong}`,
        createdAt: Date.now(),
      }),
    );
  }

  return created;
}

export function listAddresses(userId: string): Address[] {
  return addresses.filter((a) => a.userId === userId);
}

export function createAddress(addr: Address): { address: Address; channels: Channel[] } {
  addresses.insert(addr);
  const created = ensureChannelsForAddress(addr);
  return { address: addr, channels: created };
}

// =============================================
// Relationships — 주소 매칭 기반 관계 신청/수락/종료
// (PPTX: 임차인↔임대인 / 임차인↔관리인 / 임대인↔관리인)
// =============================================
import type { RelationshipKind } from "@/types";

const ROLE_PAIR_TO_KIND: Record<string, RelationshipKind> = {
  "tenant-landlord": "tenant-landlord",
  "landlord-tenant": "tenant-landlord",
  "tenant-manager": "tenant-manager",
  "manager-tenant": "tenant-manager",
  "landlord-manager": "landlord-manager",
  "manager-landlord": "landlord-manager",
};

export function relationshipKindFor(
  a: UserRole,
  b: UserRole,
): RelationshipKind | null {
  return ROLE_PAIR_TO_KIND[`${a}-${b}`] ?? null;
}

/**
 * 같은 오피스텔(상세주소)에서 다른 역할의 사용자를 찾아 관계 설정 후보를 만든다.
 * requester 의 주소와 동일한 buildingScope 를 가진 다른 역할 사용자 주소를 매칭.
 */
export function findMatchableUsers(requesterId: string): {
  userId: string;
  role: UserRole;
  buildingScope: string;
  buildingLabel: string;
}[] {
  const myAddrs = listAddresses(requesterId);
  const myScopes = new Set(myAddrs.map((a) => buildingScopeOf(a.detail)));
  const result: {
    userId: string;
    role: UserRole;
    buildingScope: string;
    buildingLabel: string;
  }[] = [];
  for (const addr of addresses.all()) {
    if (addr.userId === requesterId) continue;
    const scope = buildingScopeOf(addr.detail);
    if (!myScopes.has(scope)) continue;
    result.push({
      userId: addr.userId,
      role: addr.role,
      buildingScope: scope,
      buildingLabel: addr.detail,
    });
  }
  return result;
}

export function listRelationships(userId: string): Relationship[] {
  return relationships
    .filter((r) => r.requesterId === userId || r.addresseeId === userId)
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export function requestRelationship(input: {
  requester: User;
  addressee: User;
  buildingScope: string;
  buildingLabel: string;
}): Relationship | { error: string } {
  const kind = relationshipKindFor(input.requester.role, input.addressee.role);
  if (!kind) return { error: "같은 역할끼리는 관계를 설정할 수 없어요" };

  // 이미 진행 중/활성 관계가 있는지 확인 (같은 두 사람 + 같은 건물)
  const existing = relationships.find(
    (r) =>
      r.buildingScope === input.buildingScope &&
      r.status !== "ended" &&
      ((r.requesterId === input.requester.id &&
        r.addresseeId === input.addressee.id) ||
        (r.requesterId === input.addressee.id &&
          r.addresseeId === input.requester.id)),
  );
  if (existing) return { error: "이미 신청했거나 연결된 관계예요" };

  const now = Date.now();
  return relationships.insert({
    id: uid(),
    kind,
    requesterId: input.requester.id,
    requesterRole: input.requester.role,
    addresseeId: input.addressee.id,
    addresseeRole: input.addressee.role,
    buildingScope: input.buildingScope,
    buildingLabel: input.buildingLabel,
    status: "requested",
    createdAt: now,
    updatedAt: now,
  });
}

export function acceptRelationship(
  relId: string,
  userId: string,
): Relationship | { error: string } {
  const rel = relationships.byId(relId);
  if (!rel) return { error: "관계를 찾을 수 없어요" };
  if (rel.addresseeId !== userId)
    return { error: "신청을 받은 사람만 수락할 수 있어요" };
  if (rel.status !== "requested")
    return { error: "이미 처리된 신청이에요" };

  // 관계 전용 연계 채널 생성
  const roleLabelA = ROLE_LABEL[rel.requesterRole];
  const roleLabelB = ROLE_LABEL[rel.addresseeRole];
  const ch = channels.insert({
    id: uid(),
    kind: "public", // 연계 채널은 두 사람 전용 — 표시상 별도 처리
    scopeKey: `relationship:${rel.id}`,
    title: `${rel.buildingLabel} ${roleLabelA}–${roleLabelB} 연계 채널`,
    description: `${rel.buildingLabel} 전용 1:1 연계 채널`,
    createdAt: Date.now(),
  });

  const updated = relationships.update(relId, {
    status: "active",
    channelId: ch.id,
    updatedAt: Date.now(),
  });
  return updated!;
}

export function endRelationship(
  relId: string,
  userId: string,
): Relationship | { error: string } {
  const rel = relationships.byId(relId);
  if (!rel) return { error: "관계를 찾을 수 없어요" };
  if (rel.requesterId !== userId && rel.addresseeId !== userId)
    return { error: "관계 당사자만 종료할 수 있어요" };
  if (rel.status === "ended") return rel;
  return relationships.update(relId, {
    status: "ended",
    updatedAt: Date.now(),
  })!;
}

// =============================================
// Notifications
// =============================================
export function listNotifications(recipientId: string): Notification[] {
  return notifications
    .filter((n) => n.recipientId === recipientId)
    .sort((a, b) => b.createdAt - a.createdAt);
}
export function unreadCount(recipientId: string): number {
  return listNotifications(recipientId).filter((n) => !n.read).length;
}
export function markAllNotificationsRead(recipientId: string): void {
  for (const n of notifications.filter((x) => x.recipientId === recipientId)) {
    if (!n.read) notifications.update(n.id, { read: true });
  }
}
