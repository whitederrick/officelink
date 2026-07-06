import { ensureSeeded } from "@/server/seed.server";
import { listPolls, polls, uid } from "@/server/repo";
import { currentUser } from "@/server/session";
import { ok, fail, readJson } from "@/server/http";
import type { Poll } from "@/types";

export const dynamic = "force-dynamic";

/** GET /api/polls?buildingId=&channelId=&postId= */
export async function GET(req: Request) {
  ensureSeeded();
  const url = new URL(req.url);
  const list = listPolls({
    buildingId: url.searchParams.get("buildingId") || undefined,
    channelId: url.searchParams.get("channelId") || undefined,
    postId: url.searchParams.get("postId") || undefined,
  });
  return ok(list, { count: list.length });
}

/** POST /api/polls  body: { question, options[], multiple?, buildingId?, channelId?, postId? } */
export async function POST(req: Request) {
  ensureSeeded();
  const me = currentUser();
  if (!me) return fail("로그인이 필요해요", 401);

  const body = await readJson<{
    question?: string;
    options?: string[];
    multiple?: boolean;
    buildingId?: string;
    channelId?: string;
    postId?: string;
  }>(req);
  if (!body?.question || !Array.isArray(body.options) || body.options.length < 2)
    return fail("질문과 2개 이상의 보기를 입력해 주세요");

  const poll: Poll = {
    id: uid(),
    question: body.question,
    options: body.options.map((text) => ({ id: uid(), text, votes: 0 })),
    voters: [],
    multiple: !!body.multiple,
    buildingId: body.buildingId,
    channelId: body.channelId,
    postId: body.postId,
    createdAt: Date.now(),
  };
  polls.insert(poll);
  return ok(poll, { status: 201 });
}
