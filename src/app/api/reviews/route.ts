import { ensureSeeded } from "@/server/seed.server";
import { buildings, createReview, listReviews, uid } from "@/server/repo";
import { currentUser } from "@/server/session";
import { ok, fail, readJson } from "@/server/http";
import type { Review, ReviewCategory } from "@/types";

export const dynamic = "force-dynamic";

/** GET /api/reviews?buildingId=xxx */
export async function GET(req: Request) {
  ensureSeeded();
  const url = new URL(req.url);
  const buildingId = url.searchParams.get("buildingId") || undefined;
  const list = listReviews(buildingId);
  return ok(list, { count: list.length });
}

/**
 * POST /api/reviews
 * body: { buildingId, rating, ratings{noise,clean,facility,management,safety},
 *         summary, content, pros[], cons[], category, likedAs?, period?, images? }
 */
export async function POST(req: Request) {
  ensureSeeded();
  const me = currentUser();
  if (!me) return fail("로그인이 필요해요", 401);

  const body = await readJson<Partial<Review>>(req);
  if (!body?.buildingId || typeof body.rating !== "number" || !body.ratings)
    return fail("건물·별점·항목별 평점은 필수예요");
  if (!buildings.byId(body.buildingId)) return fail("건물을 찾을 수 없어요", 404);

  const review: Review = {
    id: uid(),
    buildingId: body.buildingId,
    authorId: me.id,
    authorNickname: me.nickname,
    authorRole: me.role,
    rating: body.rating,
    ratings: body.ratings,
    summary: body.summary ?? "",
    content: body.content ?? "",
    pros: body.pros ?? [],
    cons: body.cons ?? [],
    category: (body.category as ReviewCategory) ?? "시설",
    likedAs: body.likedAs,
    period: body.period,
    images: body.images,
    likes: 0,
    createdAt: Date.now(),
  };
  createReview(review);
  return ok(review, { status: 201 });
}
