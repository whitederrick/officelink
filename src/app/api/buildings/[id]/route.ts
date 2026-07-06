import { ensureSeeded } from "@/server/seed.server";
import { buildings, listReviews } from "@/server/repo";
import { ok, fail } from "@/server/http";

export const dynamic = "force-dynamic";

/** GET /api/buildings/:id */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  ensureSeeded();
  const building = buildings.byId(params.id);
  if (!building) return fail("건물을 찾을 수 없어요", 404);
  const reviews = listReviews(building.id);
  return ok({ building, reviews, reviewCount: reviews.length });
}
