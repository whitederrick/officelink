import { ensureSeeded } from "@/server/seed.server";
import { listBuildings } from "@/server/repo";
import { ok } from "@/server/http";

export const dynamic = "force-dynamic";

/**
 * GET /api/buildings?sigungu=마포구&dong=상암동&minRating=4
 */
export async function GET(req: Request) {
  ensureSeeded();
  const url = new URL(req.url);
  const sigungu = url.searchParams.get("sigungu") || undefined;
  const dong = url.searchParams.get("dong") || undefined;
  const minRating = parseFloat(url.searchParams.get("minRating") || "0") || undefined;

  const list = listBuildings({ sigungu, dong, minRating });
  return ok(list, { count: list.length });
}
