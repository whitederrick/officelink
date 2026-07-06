// 프론트엔드 API 클라이언트.
//
// 웹(PWA)과 향후 네이티브 앱(Android/iOS)이 동일하게 사용할 수 있는 타입드 fetch 래퍼.
// 모든 응답은 { ok, data, error?, count? } 봉투를 따른다.
//
// 네이티브에서 쓸 때는 NEXT_PUBLIC_API_BASE_URL(또는 빌드시 주입) 로 절대 URL 을 지정한다.
// 웹에서는 상대 경로(same-origin) 로 동작한다.

import type {
  Address,
  Building,
  Channel,
  Comment,
  Notice,
  Poll,
  Post,
  PostCategory,
  PublicUser,
  Relationship,
  Review,
  Service,
  UserRole,
} from "@/types";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export interface ApiOk<T> {
  ok: true;
  data: T;
  count?: number;
}
export interface ApiErr {
  ok: false;
  error: string;
}
export type ApiResponse<T> = ApiOk<T> | ApiErr;

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  init?: RequestInit & { json?: unknown },
): Promise<T> {
  const { json, headers, ...rest } = init ?? {};
  const res = await fetch(`${BASE}${path}`, {
    ...rest,
    headers: {
      ...(json !== undefined ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
    credentials: "include", // 세션 쿠키 전송
  });

  let payload: ApiResponse<T>;
  try {
    payload = (await res.json()) as ApiResponse<T>;
  } catch {
    throw new ApiError(`서버 응답을 해석할 수 없어요 (${res.status})`, res.status);
  }
  if (!payload.ok) throw new ApiError(payload.error, res.status);
  return payload.data;
}

const get = <T>(path: string) => request<T>(path, { method: "GET" });
const post = <T>(path: string, json?: unknown) =>
  request<T>(path, { method: "POST", json });
const patch = <T>(path: string, json?: unknown) =>
  request<T>(path, { method: "PATCH", json });
const del = <T>(path: string) => request<T>(path, { method: "DELETE" });

function qs(params: Record<string, string | number | undefined>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

// =============================================
// API 표면
// =============================================
export const api = {
  auth: {
    me: () => get<{ user: PublicUser | null }>("/api/auth/me"),
    signup: (input: {
      email: string;
      password: string;
      nickname: string;
      role?: UserRole;
    }) => post<{ user: PublicUser }>("/api/auth/signup", input),
    login: (input: { email: string; password: string }) =>
      post<{ user: PublicUser }>("/api/auth/login", input),
    logout: () => post<{ loggedOut: boolean }>("/api/auth/logout"),
  },

  buildings: {
    list: (filter?: { sigungu?: string; dong?: string; minRating?: number }) =>
      get<Building[]>(`/api/buildings${qs(filter ?? {})}`),
    get: (id: string) =>
      get<{ building: Building; reviews: Review[]; reviewCount: number }>(
        `/api/buildings/${id}`,
      ),
  },

  reviews: {
    listByBuilding: (buildingId: string) =>
      get<Review[]>(`/api/reviews${qs({ buildingId })}`),
    create: (input: Partial<Review> & { buildingId: string; rating: number }) =>
      post<Review>("/api/reviews", input),
  },

  channels: {
    list: (filter?: { kind?: string; scope?: string }) =>
      get<Channel[]>(`/api/channels${qs(filter ?? {})}`),
    get: (id: string) =>
      get<{ channel: Channel; posts: Post[]; count: number }>(
        `/api/channels/${id}`,
      ),
  },

  posts: {
    listByChannel: (channelId: string) =>
      get<Post[]>(`/api/posts${qs({ channelId })}`),
    get: (id: string) =>
      get<{ post: Post; comments: Comment[] }>(`/api/posts/${id}`),
    create: (input: {
      channelId: string;
      title: string;
      content: string;
      category?: PostCategory;
      images?: string[];
    }) => post<Post>("/api/posts", input),
    like: (id: string) => post<{ likes: number }>(`/api/posts/${id}/like`),
    comments: (id: string) => get<Comment[]>(`/api/posts/${id}/comments`),
    comment: (id: string, input: { content: string; parentId?: string }) =>
      post<Comment>(`/api/posts/${id}/comments`, input),
  },

  addresses: {
    list: () => get<Address[]>("/api/addresses"),
    create: (input: {
      role?: UserRole;
      sido?: string;
      sigungu: string;
      dong: string;
      detail: string;
      label?: string;
      isPrimary?: boolean;
    }) =>
      post<{ address: Address; createdChannels: Channel[] }>(
        "/api/addresses",
        input,
      ),
    remove: (id: string) => del<{ removed: boolean }>(`/api/addresses${qs({ id })}`),
  },

  relationships: {
    list: () => get<Relationship[]>("/api/relationships"),
    matchable: () =>
      get<
        {
          userId: string;
          nickname: string;
          role: UserRole;
          buildingScope: string;
          buildingLabel: string;
        }[]
      >("/api/relationships?matchable=1"),
    request: (input: {
      addresseeId: string;
      buildingScope: string;
      buildingLabel?: string;
    }) => post<Relationship>("/api/relationships", input),
    accept: (id: string) =>
      patch<Relationship>(`/api/relationships/${id}`, { action: "accept" }),
    end: (id: string) =>
      patch<Relationship>(`/api/relationships/${id}`, { action: "end" }),
  },

  polls: {
    list: (filter?: { buildingId?: string; channelId?: string; postId?: string }) =>
      get<Poll[]>(`/api/polls${qs(filter ?? {})}`),
    create: (input: {
      question: string;
      options: string[];
      multiple?: boolean;
      buildingId?: string;
      channelId?: string;
      postId?: string;
    }) => post<Poll>("/api/polls", input),
    vote: (id: string, optionIds: string[]) =>
      post<Poll>(`/api/polls/${id}/vote`, { optionIds }),
  },

  services: {
    list: (category?: string) => get<Service[]>(`/api/services${qs({ category })}`),
  },

  notices: {
    list: () => get<Notice[]>("/api/notices"),
  },
};
