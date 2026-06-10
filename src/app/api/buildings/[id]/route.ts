import { NextResponse } from "next/server";
import { getBuilding, getReviews } from "@/lib/storage";

/**
 * GET /api/buildings/:id
 */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const b = getBuilding(params.id);
  if (!b) {
    return NextResponse.json({ ok: false, error: "건물을 찾을 수 없어요" }, { status: 404 });
  }
  const reviews = getReviews(b.id);
  return NextResponse.json({
    ok: true,
    data: { building: b, reviewCount: reviews.length },
  });
}
