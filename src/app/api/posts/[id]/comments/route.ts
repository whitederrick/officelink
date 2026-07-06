import { ensureSeeded } from "@/server/seed.server";
import { createComment, listComments, posts, uid } from "@/server/repo";
import { currentUser } from "@/server/session";
import { ok, fail, readJson } from "@/server/http";
import type { Comment } from "@/types";

export const dynamic = "force-dynamic";

/** GET /api/posts/:id/comments */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  ensureSeeded();
  const list = listComments(params.id);
  return ok(list, { count: list.length });
}

/** POST /api/posts/:id/comments  body: { content, parentId? } */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  ensureSeeded();
  const me = currentUser();
  if (!me) return fail("로그인이 필요해요", 401);
  if (!posts.byId(params.id)) return fail("글을 찾을 수 없어요", 404);

  const body = await readJson<{ content?: string; parentId?: string }>(req);
  if (!body?.content) return fail("내용을 입력해 주세요");

  const comment: Comment = {
    id: uid(),
    postId: params.id,
    authorId: me.id,
    authorNickname: me.nickname,
    authorRole: me.role,
    content: body.content,
    likes: 0,
    parentId: body.parentId,
    createdAt: Date.now(),
  };
  createComment(comment);
  return ok(comment, { status: 201 });
}
