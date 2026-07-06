import { ensureSeeded } from "@/server/seed.server";
import { listServices } from "@/server/repo";
import { ok } from "@/server/http";

export const dynamic = "force-dynamic";

/** GET /api/services?category=clean */
export async function GET(req: Request) {
  ensureSeeded();
  const url = new URL(req.url);
  const category = url.searchParams.get("category") || undefined;
  const list = listServices(category);
  return ok(list, { count: list.length });
}
