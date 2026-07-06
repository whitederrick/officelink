import { ensureSeeded } from "@/server/seed.server";
import { listNotices } from "@/server/repo";
import { ok } from "@/server/http";

export const dynamic = "force-dynamic";

/** GET /api/notices */
export async function GET() {
  ensureSeeded();
  const list = listNotices();
  return ok(list, { count: list.length });
}
