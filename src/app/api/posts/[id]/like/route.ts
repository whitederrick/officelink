import { ensureSeeded } from "@/server/seed.server";
import { likePost } from "@/server/repo";
import { currentUser } from "@/server/session";
import { ok, fail } from "@/server/http";

export const dynamic = "force-dynamic";

/** POST /api/posts/:id/like */
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  ensureSeeded();
  const me = currentUser();
  if (!me) return fail("로그인이 필요해요", 401);
  const post = likePost(params.id);
  if (!post) return fail("글을 찾을 수 없어요", 404);
  return ok({ likes: post.likes });
}
