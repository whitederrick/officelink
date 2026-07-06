import { ensureSeeded } from "@/server/seed.server";
import { polls, votePoll } from "@/server/repo";
import { currentUser } from "@/server/session";
import { ok, fail, readJson } from "@/server/http";

export const dynamic = "force-dynamic";

/** POST /api/polls/:id/vote  body: { optionIds: string[] } */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  ensureSeeded();
  const me = currentUser();
  if (!me) return fail("로그인이 필요해요", 401);
  if (!polls.byId(params.id)) return fail("투표를 찾을 수 없어요", 404);

  const body = await readJson<{ optionIds?: string[] }>(req);
  if (!body?.optionIds || body.optionIds.length === 0)
    return fail("선택한 보기가 없어요");

  const updated = votePoll(params.id, body.optionIds, me.id);
  if (!updated) return fail("투표 처리에 실패했어요");
  return ok(updated);
}
