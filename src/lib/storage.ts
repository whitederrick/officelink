// localStorage 기반 데이터 레이어. 백엔드 없이 프론트만으로 동작.

import type {
  User,
  Address,
  Channel,
  Post,
  Comment,
  UserRole,
  ChannelKind,
  Notification,
  DMMessage,
  Building,
  Review,
  Profile,
  Service,
  BuildingLink,
} from "@/types";

const KEYS = {
  user: "officelink:user",
  addresses: "officelink:addresses",
  channels: "officelink:channels",
  posts: "officelink:posts",
  comments: "officelink:comments",
  notifications: "officelink:notifications",
  dms: "officelink:dms",
  bookmarked: "officelink:bookmarked",
  likedPosts: "officelink:likedPosts",
  buildings: "officelink:buildings",
  reviews: "officelink:reviews",
  profiles: "officelink:profiles",
  services: "officelink:services",
  buildingLinks: "officelink:buildingLinks",
  seeded: "officelink:seeded",
} as const;

function isClient() {
  return typeof window !== "undefined";
}

function read<T>(key: string, fallback: T): T {
  if (!isClient()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (!isClient()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export const uid = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

// ----- User -----
export function getUser(): User | null {
  return read<User | null>(KEYS.user, null);
}
export function setUser(u: User) {
  write(KEYS.user, u);
}
export function clearUser() {
  if (!isClient()) return;
  window.localStorage.removeItem(KEYS.user);
}

// ----- Addresses -----
export function getAddresses(userId?: string): Address[] {
  const all = read<Address[]>(KEYS.addresses, []);
  return userId ? all.filter((a) => a.userId === userId) : all;
}
export function addAddress(a: Address) {
  const all = read<Address[]>(KEYS.addresses, []);
  all.push(a);
  write(KEYS.addresses, all);
}
export function removeAddress(id: string) {
  const all = read<Address[]>(KEYS.addresses, []);
  write(
    KEYS.addresses,
    all.filter((a) => a.id !== id),
  );
}
export function updateAddress(id: string, patch: Partial<Address>) {
  const all = read<Address[]>(KEYS.addresses, []);
  write(
    KEYS.addresses,
    all.map((a) => (a.id === id ? { ...a, ...patch } : a)),
  );
}

// ----- Channels -----
export function getChannels(): Channel[] {
  return read<Channel[]>(KEYS.channels, []);
}
export function getChannel(id: string): Channel | null {
  return getChannels().find((c) => c.id === id) ?? null;
}
export function getChannelByScope(scopeKey: string): Channel | null {
  return getChannels().find((c) => c.scopeKey === scopeKey) ?? null;
}
export function addChannel(c: Channel) {
  const all = getChannels();
  if (all.find((x) => x.scopeKey === c.scopeKey)) return; // 중복 방지
  all.push(c);
  write(KEYS.channels, all);
}

// ----- Posts -----
export function getPosts(): Post[] {
  return read<Post[]>(KEYS.posts, []);
}
export function getPost(id: string): Post | null {
  return getPosts().find((p) => p.id === id) ?? null;
}
export function getPostsByChannel(channelId: string): Post[] {
  return getPosts()
    .filter((p) => p.channelId === channelId)
    .sort((a, b) => b.createdAt - a.createdAt);
}
export function addPost(p: Post) {
  const all = getPosts();
  all.push(p);
  write(KEYS.posts, all);
}
export function incrementView(id: string) {
  const all = getPosts();
  write(
    KEYS.posts,
    all.map((p) => (p.id === id ? { ...p, views: p.views + 1 } : p)),
  );
}
export function likePost(id: string) {
  const all = getPosts();
  write(
    KEYS.posts,
    all.map((p) => (p.id === id ? { ...p, likes: p.likes + 1 } : p)),
  );
}

// ----- Comments -----
export function getComments(postId: string): Comment[] {
  return read<Comment[]>(KEYS.comments, [])
    .filter((c) => c.postId === postId)
    .sort((a, b) => a.createdAt - b.createdAt);
}
export function addComment(c: Comment) {
  const all = read<Comment[]>(KEYS.comments, []);
  all.push(c);
  write(KEYS.comments, all);

  // 게시글 댓글 카운트 증가
  const posts = getPosts();
  write(
    KEYS.posts,
    posts.map((p) =>
      p.id === c.postId ? { ...p, commentCount: p.commentCount + 1 } : p,
    ),
  );
}

// ----- Seed -----
export function isSeeded(): boolean {
  return read<boolean>(KEYS.seeded, false);
}
export function markSeeded() {
  write(KEYS.seeded, true);
}
export function resetAll() {
  if (!isClient()) return;
  Object.values(KEYS).forEach((k) => window.localStorage.removeItem(k));
}

// ----- Notifications -----
export function getNotifications(recipientId: string): Notification[] {
  return read<Notification[]>(KEYS.notifications, [])
    .filter((n) => n.recipientId === recipientId)
    .sort((a, b) => b.createdAt - a.createdAt);
}
export function getUnreadCount(recipientId: string): number {
  return getNotifications(recipientId).filter((n) => !n.read).length;
}
export function addNotification(n: Notification) {
  const all = read<Notification[]>(KEYS.notifications, []);
  all.push(n);
  write(KEYS.notifications, all);
}
export function markAllRead(recipientId: string) {
  const all = read<Notification[]>(KEYS.notifications, []);
  write(
    KEYS.notifications,
    all.map((n) => (n.recipientId === recipientId ? { ...n, read: true } : n)),
  );
}

// ----- DM -----
export function getDMs(): DMMessage[] {
  return read<DMMessage[]>(KEYS.dms, []);
}
export function getDMBetween(meId: string, peerId: string): DMMessage[] {
  return getDMs()
    .filter(
      (m) =>
        (m.fromId === meId && m.toId === peerId) ||
        (m.fromId === peerId && m.toId === meId),
    )
    .sort((a, b) => a.createdAt - b.createdAt);
}
export function getDMThreads(meId: string) {
  const msgs = getDMs();
  const map = new Map<
    string,
    { peerId: string; peerNickname: string; peerRole: UserRole; lastMessage: string; lastAt: number; unread: number }
  >();
  for (const m of msgs) {
    const isOutgoing = m.fromId === meId;
    const peerId = isOutgoing ? m.toId : m.fromId;
    const peerNickname = isOutgoing ? m.toNickname : m.fromNickname;
    const actualRole = isOutgoing ? m.toRole : m.fromRole;
    const cur = map.get(peerId);
    const isUnread = !isOutgoing && !m.read;
    if (!cur || cur.lastAt < m.createdAt) {
      map.set(peerId, {
        peerId,
        peerNickname,
        peerRole: actualRole,
        lastMessage: m.content,
        lastAt: m.createdAt,
        unread: (cur?.unread || 0) + (isUnread ? 1 : 0),
      });
    } else if (isUnread) {
      cur.unread += 1;
    }
  }
  return Array.from(map.values()).sort((a, b) => b.lastAt - a.lastAt);
}
export function sendDM(m: DMMessage) {
  const all = getDMs();
  all.push(m);
  write(KEYS.dms, all);
}
export function markThreadRead(meId: string, peerId: string) {
  const all = getDMs();
  write(
    KEYS.dms,
    all.map((m) =>
      m.fromId === peerId && m.toId === meId ? { ...m, read: true } : m,
    ),
  );
}

// ----- Bookmarks -----
export function getBookmarks(): string[] {
  return read<string[]>(KEYS.bookmarked, []);
}
export function toggleBookmark(postId: string) {
  const all = getBookmarks();
  if (all.includes(postId)) {
    write(
      KEYS.bookmarked,
      all.filter((x) => x !== postId),
    );
  } else {
    all.push(postId);
    write(KEYS.bookmarked, all);
  }
}
export function isBookmarked(postId: string): boolean {
  return getBookmarks().includes(postId);
}

// ----- Liked posts (추가 좋아요 방지) -----
export function getLikedPosts(): string[] {
  return read<string[]>(KEYS.likedPosts, []);
}
export function hasLiked(postId: string): boolean {
  return getLikedPosts().includes(postId);
}
export function likePostOnce(id: string): boolean {
  if (hasLiked(id)) return false;
  const all = getLikedPosts();
  all.push(id);
  write(KEYS.likedPosts, all);
  const posts = getPosts();
  write(
    KEYS.posts,
    posts.map((p) => (p.id === id ? { ...p, likes: p.likes + 1 } : p)),
  );
  return true;
}
export function unlikePost(id: string): boolean {
  if (!hasLiked(id)) return false;
  const all = getLikedPosts();
  write(
    KEYS.likedPosts,
    all.filter((x) => x !== id),
  );
  const posts = getPosts();
  write(
    KEYS.posts,
    posts.map((p) => (p.id === id ? { ...p, likes: Math.max(0, p.likes - 1) } : p)),
  );
  return true;
}

// ----- Buildings -----
export function getBuildings(): Building[] {
  return read<Building[]>(KEYS.buildings, []);
}
export function getBuilding(id: string): Building | null {
  return getBuildings().find((b) => b.id === id) ?? null;
}
export function getBuildingByName(name: string): Building | null {
  return getBuildings().find((b) => b.name === name) ?? null;
}
export function addBuilding(b: Building) {
  const all = getBuildings();
  all.push(b);
  write(KEYS.buildings, all);
}
export function updateBuilding(id: string, patch: Partial<Building>) {
  const all = getBuildings();
  write(
    KEYS.buildings,
    all.map((b) => (b.id === id ? { ...b, ...patch } : b)),
  );
}

// ----- Reviews -----
export function getReviews(buildingId?: string): Review[] {
  const all = read<Review[]>(KEYS.reviews, []);
  return buildingId
    ? all.filter((r) => r.buildingId === buildingId).sort((a, b) => b.createdAt - a.createdAt)
    : all.sort((a, b) => b.createdAt - a.createdAt);
}
export function addReview(r: Review) {
  const all = read<Review[]>(KEYS.reviews, []);
  all.push(r);
  write(KEYS.reviews, all);
  // 건물 평점 재계산
  recomputeBuildingRating(r.buildingId);
}
export function recomputeBuildingRating(buildingId: string) {
  const reviews = getReviews(buildingId);
  if (reviews.length === 0) return;
  const avg = (k: keyof Review["ratings"]) =>
    reviews.reduce((s, r) => s + r.ratings[k], 0) / reviews.length;
  const ratingAvg =
    reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  updateBuilding(buildingId, {
    ratingAvg: Math.round(ratingAvg * 10) / 10,
    ratingCount: reviews.length,
    ratingNoise: Math.round(avg("noise") * 10) / 10,
    ratingClean: Math.round(avg("clean") * 10) / 10,
    ratingFacility: Math.round(avg("facility") * 10) / 10,
    ratingManagement: Math.round(avg("management") * 10) / 10,
    ratingSafety: Math.round(avg("safety") * 10) / 10,
  });
}

// ----- Profiles (임대인/관리인) -----
export function getProfiles(): Profile[] {
  return read<Profile[]>(KEYS.profiles, []);
}
export function getProfile(id: string): Profile | null {
  return getProfiles().find((p) => p.id === id) ?? null;
}
export function getProfileByName(kind: "landlord" | "manager", name: string): Profile | null {
  return getProfiles().find((p) => p.kind === kind && p.name === name) ?? null;
}
export function addProfile(p: Profile) {
  const all = getProfiles();
  all.push(p);
  write(KEYS.profiles, all);
}
export function updateProfile(id: string, patch: Partial<Profile>) {
  const all = getProfiles();
  write(
    KEYS.profiles,
    all.map((p) => (p.id === id ? { ...p, ...patch } : p)),
  );
}

// ----- Services -----
export function getServices(category?: string): Service[] {
  const all = read<Service[]>(KEYS.services, []);
  return category
    ? all.filter((s) => s.category === category).sort((a, b) => b.rating - a.rating)
    : all.sort((a, b) => b.rating - a.rating);
}
export function getService(id: string): Service | null {
  return getServices().find((s) => s.id === id) ?? null;
}
export function addService(s: Service) {
  const all = getServices();
  all.push(s);
  write(KEYS.services, all);
}

// ----- Building Links (사용자-건물) -----
export function getBuildingLinks(userId: string): BuildingLink[] {
  return read<BuildingLink[]>(KEYS.buildingLinks, [])
    .filter((l) => l.userId === userId);
}
export function linkBuilding(userId: string, buildingId: string, relation: BuildingLink["relation"]) {
  const all = read<BuildingLink[]>(KEYS.buildingLinks, []);
  // 이미 있으면 relation 갱신
  const existing = all.find((l) => l.userId === userId && l.buildingId === buildingId);
  if (existing) {
    write(
      KEYS.buildingLinks,
      all.map((l) =>
        l === existing ? { ...l, relation, createdAt: Date.now() } : l,
      ),
    );
  } else {
    all.push({ userId, buildingId, relation, createdAt: Date.now() });
    write(KEYS.buildingLinks, all);
  }
}
export function unlinkBuilding(userId: string, buildingId: string) {
  const all = read<BuildingLink[]>(KEYS.buildingLinks, []);
  write(
    KEYS.buildingLinks,
    all.filter((l) => !(l.userId === userId && l.buildingId === buildingId)),
  );
}

// ----- Review Replies -----
const K_REPLIES = "officelink:reviewReplies";
export function getReplies(reviewId: string): import("@/types").ReviewReply[] {
  return read<import("@/types").ReviewReply[]>(K_REPLIES, [])
    .filter((r) => r.reviewId === reviewId)
    .sort((a, b) => a.createdAt - b.createdAt);
}
export function getRepliesByBuilding(buildingId: string): import("@/types").ReviewReply[] {
  return read<import("@/types").ReviewReply[]>(K_REPLIES, [])
    .filter((r) => r.buildingId === buildingId)
    .sort((a, b) => a.createdAt - b.createdAt);
}
export function addReply(r: import("@/types").ReviewReply) {
  const all = read<import("@/types").ReviewReply[]>(K_REPLIES, []);
  all.push(r);
  write(K_REPLIES, all);
}
export function deleteReply(id: string) {
  const all = read<import("@/types").ReviewReply[]>(K_REPLIES, []);
  write(
    K_REPLIES,
    all.filter((r) => r.id !== id),
  );
}

// ----- AS Requests -----
const K_AS = "officelink:asRequests";
export function getASRequests(userId?: string): import("@/types").ASRequest[] {
  const all = read<import("@/types").ASRequest[]>(K_AS, []);
  return userId
    ? all.filter((a) => a.userId === userId).sort((a, b) => b.createdAt - a.createdAt)
    : all.sort((a, b) => b.createdAt - a.createdAt);
}
export function addASRequest(a: import("@/types").ASRequest) {
  const all = read<import("@/types").ASRequest[]>(K_AS, []);
  all.push(a);
  write(K_AS, all);
}

// ----- Notices -----
const K_NOTICES = "officelink:notices";
export function getNotices(): import("@/types").Notice[] {
  return read<import("@/types").Notice[]>(K_NOTICES, []).sort((a, b) => b.createdAt - a.createdAt);
}

// ----- Reports -----
const K_REPORTS = "officelink:reports";
export function addReport(r: import("@/types").Report) {
  const all = read<import("@/types").Report[]>(K_REPORTS, []);
  all.push(r);
  write(K_REPORTS, all);
}

// ----- Favorite Services -----
const K_FAV_SVC = "officelink:favServices";
export function getFavoriteServiceIds(userId: string): string[] {
  return read<import("@/types").FavoriteService[]>(K_FAV_SVC, [])
    .filter((f) => f.userId === userId)
    .map((f) => f.serviceId);
}
export function toggleFavoriteService(userId: string, serviceId: string): boolean {
  const all = read<import("@/types").FavoriteService[]>(K_FAV_SVC, []);
  const exists = all.find((f) => f.userId === userId && f.serviceId === serviceId);
  if (exists) {
    write(
      K_FAV_SVC,
      all.filter((f) => !(f.userId === userId && f.serviceId === serviceId)),
    );
    return false;
  }
  all.push({ userId, serviceId, createdAt: Date.now() });
  write(K_FAV_SVC, all);
  return true;
}

// ----- Pinned Channels -----
const K_PINNED = "officelink:pinned";
export function getPinnedChannels(userId: string): string[] {
  const all = read<{ userId: string; channelId: string }[]>(K_PINNED, []);
  return all.filter((p) => p.userId === userId).map((p) => p.channelId);
}
export function togglePinChannel(userId: string, channelId: string): boolean {
  const all = read<{ userId: string; channelId: string }[]>(K_PINNED, []);
  const exists = all.find((p) => p.userId === userId && p.channelId === channelId);
  if (exists) {
    write(
      K_PINNED,
      all.filter((p) => !(p.userId === userId && p.channelId === channelId)),
    );
    return false;
  }
  all.push({ userId, channelId });
  write(K_PINNED, all);
  return true;
}

// ----- Building Notices -----
const K_BUILDING_NOTICES = "officelink:buildingNotices";
export function getBuildingNotices(buildingId: string): import("@/types").BuildingNotice[] {
  return read<import("@/types").BuildingNotice[]>(K_BUILDING_NOTICES, [])
    .filter((n) => n.buildingId === buildingId)
    .sort((a, b) => b.createdAt - a.createdAt);
}
export function addBuildingNotice(n: import("@/types").BuildingNotice) {
  const all = read<import("@/types").BuildingNotice[]>(K_BUILDING_NOTICES, []);
  all.push(n);
  write(K_BUILDING_NOTICES, all);
}
export function deleteBuildingNotice(id: string) {
  const all = read<import("@/types").BuildingNotice[]>(K_BUILDING_NOTICES, []);
  write(
    K_BUILDING_NOTICES,
    all.filter((n) => n.id !== id),
  );
}

// ----- Polls -----
const K_POLLS = "officelink:polls";
export function getPolls(filter?: { postId?: string; buildingId?: string; channelId?: string }): import("@/types").Poll[] {
  let all = read<import("@/types").Poll[]>(K_POLLS, []);
  if (filter?.postId) all = all.filter((p) => p.postId === filter.postId);
  if (filter?.buildingId) all = all.filter((p) => p.buildingId === filter.buildingId);
  if (filter?.channelId) all = all.filter((p) => p.channelId === filter.channelId);
  return all.sort((a, b) => b.createdAt - a.createdAt);
}
export function getPoll(id: string): import("@/types").Poll | null {
  return read<import("@/types").Poll[]>(K_POLLS, []).find((p) => p.id === id) ?? null;
}
export function addPoll(p: import("@/types").Poll) {
  const all = read<import("@/types").Poll[]>(K_POLLS, []);
  all.push(p);
  write(K_POLLS, all);
}
export function votePoll(pollId: string, optionIds: string[], userId: string): boolean {
  const all = read<import("@/types").Poll[]>(K_POLLS, []);
  const idx = all.findIndex((p) => p.id === pollId);
  if (idx < 0) return false;
  const p = all[idx];
  if (p.voters.includes(userId)) return false;
  const updated: import("@/types").Poll = {
    ...p,
    voters: [...p.voters, userId],
    options: p.options.map((o) =>
      optionIds.includes(o.id) ? { ...o, votes: o.votes + 1 } : o,
    ),
  };
  all[idx] = updated;
  write(K_POLLS, all);
  return true;
}

// ----- Keyword Alerts -----
const K_KEYWORD = "officelink:keywordAlerts";
export function getKeywordAlerts(userId: string): string[] {
  return read<import("@/types").KeywordAlert[]>(K_KEYWORD, [])
    .filter((k) => k.userId === userId)
    .map((k) => k.keyword);
}
export function addKeywordAlert(userId: string, keyword: string) {
  const all = read<import("@/types").KeywordAlert[]>(K_KEYWORD, []);
  if (all.find((k) => k.userId === userId && k.keyword === keyword)) return;
  all.push({ userId, keyword, createdAt: Date.now() });
  write(K_KEYWORD, all);
}
export function removeKeywordAlert(userId: string, keyword: string) {
  const all = read<import("@/types").KeywordAlert[]>(K_KEYWORD, []);
  write(
    K_KEYWORD,
    all.filter((k) => !(k.userId === userId && k.keyword === keyword)),
  );
}

// ----- Management Fees -----
const K_FEES = "officelink:fees";
export function getManagementFees(buildingId: string): import("@/types").ManagementFee[] {
  return read<import("@/types").ManagementFee[]>(K_FEES, [])
    .filter((f) => f.buildingId === buildingId)
    .sort((a, b) => b.year - a.year || b.month - a.month);
}
export function addManagementFee(f: import("@/types").ManagementFee) {
  const all = read<import("@/types").ManagementFee[]>(K_FEES, []);
  all.push(f);
  write(K_FEES, all);
}

// ----- Short-term listings -----
const K_LISTINGS = "officelink:listings";
export function getListings(filter?: { buildingId?: string }): import("@/types").ShortTermListing[] {
  let all = read<import("@/types").ShortTermListing[]>(K_LISTINGS, []);
  if (filter?.buildingId) all = all.filter((l) => l.buildingId === filter.buildingId);
  return all.sort((a, b) => b.createdAt - a.createdAt);
}
export function getListing(id: string): import("@/types").ShortTermListing | null {
  return read<import("@/types").ShortTermListing[]>(K_LISTINGS, []).find((l) => l.id === id) ?? null;
}
export function addListing(l: import("@/types").ShortTermListing) {
  const all = read<import("@/types").ShortTermListing[]>(K_LISTINGS, []);
  all.push(l);
  write(K_LISTINGS, all);
}

// ----- Events -----
const K_EVENTS = "officelink:events";
export function getEvents(): import("@/types").CommunityEvent[] {
  return read<import("@/types").CommunityEvent[]>(K_EVENTS, []).sort((a, b) => a.startsAt - b.startsAt);
}
export function getEvent(id: string): import("@/types").CommunityEvent | null {
  return read<import("@/types").CommunityEvent[]>(K_EVENTS, []).find((e) => e.id === id) ?? null;
}
export function addEvent(e: import("@/types").CommunityEvent) {
  const all = read<import("@/types").CommunityEvent[]>(K_EVENTS, []);
  all.push(e);
  write(K_EVENTS, all);
}
export function joinEvent(eventId: string, userId: string, nickname: string) {
  const all = read<import("@/types").CommunityEvent[]>(K_EVENTS, []);
  write(
    K_EVENTS,
    all.map((e) => {
      if (e.id !== eventId) return e;
      if (e.participants.find((p) => p.userId === userId)) return e;
      return {
        ...e,
        participants: [...e.participants, { userId, nickname, joinedAt: Date.now() }],
      };
    }),
  );
}
export function leaveEvent(eventId: string, userId: string) {
  const all = read<import("@/types").CommunityEvent[]>(K_EVENTS, []);
  write(
    K_EVENTS,
    all.map((e) =>
      e.id === eventId
        ? { ...e, participants: e.participants.filter((p) => p.userId !== userId) }
        : e,
    ),
  );
}

// ----- Blocked users -----
const K_BLOCK = "officelink:blocked";
export function getBlockedUsers(userId: string): import("@/types").BlockedUser[] {
  return read<import("@/types").BlockedUser[]>(K_BLOCK, []).filter((b) => b.blockerId === userId);
}
export function isBlocked(blockerId: string, blockedId: string): boolean {
  return getBlockedUsers(blockerId).some((b) => b.blockedId === blockedId);
}
export function blockUser(blockerId: string, blockedId: string, blockedNickname: string) {
  if (isBlocked(blockerId, blockedId)) return;
  const all = read<import("@/types").BlockedUser[]>(K_BLOCK, []);
  all.push({ blockerId, blockedId, blockedNickname, createdAt: Date.now() });
  write(K_BLOCK, all);
}
export function unblockUser(blockerId: string, blockedId: string) {
  const all = read<import("@/types").BlockedUser[]>(K_BLOCK, []);
  write(
    K_BLOCK,
    all.filter((b) => !(b.blockerId === blockerId && b.blockedId === blockedId)),
  );
}

// ----- Group rooms -----
const K_GROUPS = "officelink:groups";
const K_GROUP_MSGS = "officelink:groupMsgs";
export function getGroupRooms(userId: string): import("@/types").GroupRoom[] {
  return read<import("@/types").GroupRoom[]>(K_GROUPS, [])
    .filter((r) => r.members.includes(userId))
    .sort((a, b) => b.lastMessageAt - a.lastMessageAt);
}
export function getGroupRoom(id: string): import("@/types").GroupRoom | null {
  return read<import("@/types").GroupRoom[]>(K_GROUPS, []).find((r) => r.id === id) ?? null;
}
export function addGroupRoom(r: import("@/types").GroupRoom) {
  const all = read<import("@/types").GroupRoom[]>(K_GROUPS, []);
  all.push(r);
  write(K_GROUPS, all);
}
export function sendGroupMessage(msg: import("@/types").GroupMessage) {
  const all = read<import("@/types").GroupMessage[]>(K_GROUP_MSGS, []);
  all.push(msg);
  write(K_GROUP_MSGS, all);
  // Update lastMessage
  const rooms = read<import("@/types").GroupRoom[]>(K_GROUPS, []);
  write(
    K_GROUPS,
    rooms.map((r) =>
      r.id === msg.roomId
        ? { ...r, lastMessageAt: msg.createdAt, lastMessagePreview: msg.content.slice(0, 30) }
        : r,
    ),
  );
}
export function getGroupMessages(roomId: string): import("@/types").GroupMessage[] {
  return read<import("@/types").GroupMessage[]>(K_GROUP_MSGS, [])
    .filter((m) => m.roomId === roomId)
    .sort((a, b) => a.createdAt - b.createdAt);
}
