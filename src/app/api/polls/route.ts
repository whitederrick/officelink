import { NextResponse } from "next/server";
import { getPolls, addPoll, getUser, uid } from "@/lib/storage";
import { getPolls as fetchPolls } from "@/lib/storage";
import type { Poll } from "@/types";

/**
 * GET /api/polls?buildingId=xxx
 * POST /api/polls  body: { question, options[], multiple, buildingId? }
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const buildingId = url.searchParams.get("buildingId") || undefined;
  const list = getPolls({ buildingId });
  return NextResponse.json({ ok: true, count: list.length, data: list });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const me = getUser();
    if (!me) {
      return NextResponse.json({ ok: false, error: "로그인이 필요해요" }, { status: 401 });
    }
    const poll: Poll = {
      id: uid(),
      question: body.question,
      options: (body.options || []).map((text: string) => ({ id: uid(), text, votes: 0 })),
      voters: [],
      multiple: !!body.multiple,
      buildingId: body.buildingId,
      createdAt: Date.now(),
    };
    addPoll(poll);
    return NextResponse.json({ ok: true, data: poll }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
  }
}
