import { NextResponse } from "next/server";
import { getBuildings } from "@/lib/storage";

/**
 * GET /api/buildings
 * Query: ?sigungu=마포구&dong=상암동&minRating=4
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const sigungu = url.searchParams.get("sigungu");
  const dong = url.searchParams.get("dong");
  const minRating = parseFloat(url.searchParams.get("minRating") || "0");

  let list = getBuildings();
  if (sigungu) list = list.filter((b) => b.sigungu === sigungu);
  if (dong) list = list.filter((b) => b.dong === dong);
  if (minRating > 0) list = list.filter((b) => b.ratingAvg >= minRating);

  return NextResponse.json({
    ok: true,
    count: list.length,
    data: list,
  });
}
