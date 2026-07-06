import { ensureSeeded } from "@/server/seed.server";
import { channels, listPostsByChannel, posts, uid } from "@/server/repo";
import { currentUser } from "@/server/session";
import { ok, fail, readJson } from "@/server/http";
import type { Post, PostCategory } from "@/types";

export const dynamic = "force-dynamic";

/** GET /api/posts?channelId=xxx */
export async function GET(req: Request) {
  ensureSeeded();
  const url = new URL(req.url);
  const channelId = url.searchParams.get("channelId");
  if (!channelId) return fail("channelId 가 필요해요");
  const list = listPostsByChannel(channelId);
  return ok(list, { count: list.length });
}

/** POST /api/posts  body: { channelId, category, title, content, images? } */
export async function POST(req: Request) {
  ensureSeeded();
  const me = currentUser();
  if (!me) return fail("로그인이 필요해요", 401);

  const body = await readJson<{
    channelId?: string;
    category?: PostCategory;
    title?: string;
    content?: string;
    images?: string[];
  }>(req);
  if (!body?.channelId || !body.title || !body.content)
    return fail("채널·제목·내용은 필수예요");
  if (!channels.byId(body.channelId)) return fail("채널을 찾을 수 없어요", 404);

  const post: Post = {
    id: uid(),
    channelId: body.channelId,
    authorId: me.id,
    authorNickname: me.nickname,
    authorRole: me.role,
    category: body.category ?? "자유",
    title: body.title,
    content: body.content,
    images: body.images,
    likes: 0,
    commentCount: 0,
    views: 0,
    createdAt: Date.now(),
  };
  posts.insert(post);
  return ok(post, { status: 201 });
}
