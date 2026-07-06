import { ensureSeeded } from "@/server/seed.server";
import { channels, listPostsByChannel } from "@/server/repo";
import { ok, fail } from "@/server/http";

export const dynamic = "force-dynamic";

/** GET /api/channels/:id — 채널 + 글 목록 */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  ensureSeeded();
  const channel = channels.byId(params.id);
  if (!channel) return fail("채널을 찾을 수 없어요", 404);
  const posts = listPostsByChannel(channel.id);
  return ok({ channel, posts, count: posts.length });
}
