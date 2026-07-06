import { ensureSeeded } from "@/server/seed.server";
import { getPostAndIncrementView, listComments } from "@/server/repo";
import { ok, fail } from "@/server/http";

export const dynamic = "force-dynamic";

/** GET /api/posts/:id — 글 상세 (조회수 +1) + 댓글 */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  ensureSeeded();
  const post = getPostAndIncrementView(params.id);
  if (!post) return fail("글을 찾을 수 없어요", 404);
  const comments = listComments(post.id);
  return ok({ post, comments });
}
