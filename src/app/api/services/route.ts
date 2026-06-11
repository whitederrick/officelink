import { NextResponse } from "next/server";
import { getServices } from "@/lib/storage";

/**
 * GET /api/services?category=clean
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const category = url.searchParams.get("category") || undefined;
  const list = getServices(category);
  return NextResponse.json({ ok: true, count: list.length, data: list });
}
