// Route Handler 공통 응답 헬퍼. 모든 API 는 { ok, ... } 봉투를 사용한다.

import { NextResponse } from "next/server";

export function ok<T>(data: T, init?: { status?: number; count?: number }) {
  const body: Record<string, unknown> = { ok: true, data };
  if (typeof init?.count === "number") body.count = init.count;
  return NextResponse.json(body, { status: init?.status ?? 200 });
}

export function fail(error: string, status = 400) {
  return NextResponse.json({ ok: false, error }, { status });
}

/** body 를 안전하게 JSON 파싱. 실패 시 null. */
export async function readJson<T = Record<string, unknown>>(
  req: Request,
): Promise<T | null> {
  try {
    return (await req.json()) as T;
  } catch {
    return null;
  }
}
