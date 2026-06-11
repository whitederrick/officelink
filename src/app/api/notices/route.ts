import { NextResponse } from "next/server";
import { getNotices } from "@/lib/storage";

/**
 * GET /api/notices
 */
export async function GET() {
  const list = getNotices();
  return NextResponse.json({ ok: true, count: list.length, data: list });
}
