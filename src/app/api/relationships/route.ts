import { ensureSeeded } from "@/server/seed.server";
import {
  findMatchableUsers,
  listRelationships,
  requestRelationship,
  users,
} from "@/server/repo";
import { currentUser } from "@/server/session";
import { ok, fail, readJson } from "@/server/http";

export const dynamic = "force-dynamic";

/**
 * GET /api/relationships         — 내 관계 목록
 * GET /api/relationships?matchable=1 — 같은 오피스텔의 관계 설정 후보
 */
export async function GET(req: Request) {
  ensureSeeded();
  const me = currentUser();
  if (!me) return fail("로그인이 필요해요", 401);

  const url = new URL(req.url);
  if (url.searchParams.get("matchable")) {
    const candidates = findMatchableUsers(me.id).map((c) => {
      const u = users.byId(c.userId);
      return {
        userId: c.userId,
        nickname: u?.nickname ?? "사용자",
        role: c.role,
        buildingScope: c.buildingScope,
        buildingLabel: c.buildingLabel,
      };
    });
    return ok(candidates, { count: candidates.length });
  }

  const list = listRelationships(me.id);
  return ok(list, { count: list.length });
}

/**
 * POST /api/relationships  body: { addresseeId, buildingScope, buildingLabel }
 * 관계 신청.
 */
export async function POST(req: Request) {
  ensureSeeded();
  const me = currentUser();
  if (!me) return fail("로그인이 필요해요", 401);

  const body = await readJson<{
    addresseeId?: string;
    buildingScope?: string;
    buildingLabel?: string;
  }>(req);
  if (!body?.addresseeId || !body.buildingScope)
    return fail("상대방과 오피스텔 정보가 필요해요");

  const addressee = users.byId(body.addresseeId);
  if (!addressee) return fail("상대방을 찾을 수 없어요", 404);

  const result = requestRelationship({
    requester: me,
    addressee,
    buildingScope: body.buildingScope,
    buildingLabel: body.buildingLabel ?? body.buildingScope.replace("building:", ""),
  });
  if ("error" in result) return fail(result.error, 409);
  return ok(result, { status: 201 });
}
