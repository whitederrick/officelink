import { ensureSeeded } from "@/server/seed.server";
import { acceptRelationship, endRelationship } from "@/server/repo";
import { currentUser } from "@/server/session";
import { ok, fail, readJson } from "@/server/http";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/relationships/:id  body: { action: "accept" | "end" }
 * 관계 수락 또는 종료.
 */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  ensureSeeded();
  const me = currentUser();
  if (!me) return fail("로그인이 필요해요", 401);

  const body = await readJson<{ action?: "accept" | "end" }>(req);
  if (body?.action !== "accept" && body?.action !== "end")
    return fail("action 은 accept 또는 end 여야 해요");

  const result =
    body.action === "accept"
      ? acceptRelationship(params.id, me.id)
      : endRelationship(params.id, me.id);

  if ("error" in result) return fail(result.error, 400);
  return ok(result);
}
