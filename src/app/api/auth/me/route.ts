import { ensureSeeded } from "@/server/seed.server";
import { toPublicUser } from "@/server/auth";
import { currentUser } from "@/server/session";
import { ok } from "@/server/http";

export const dynamic = "force-dynamic";

/** GET /api/auth/me — 현재 로그인 사용자 (없으면 user: null) */
export async function GET() {
  ensureSeeded();
  const me = currentUser();
  return ok({ user: me ? toPublicUser(me) : null });
}
