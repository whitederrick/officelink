import { cookies } from "next/headers";
import { ensureSeeded } from "@/server/seed.server";
import { login, toPublicUser, SESSION_COOKIE, sessionCookieOptions } from "@/server/auth";
import { ok, fail, readJson } from "@/server/http";

export const dynamic = "force-dynamic";

/** POST /api/auth/login  body: { email, password } */
export async function POST(req: Request) {
  ensureSeeded();
  const body = await readJson<{ email?: string; password?: string }>(req);
  if (!body?.email || !body.password) return fail("이메일과 비밀번호를 입력해 주세요");

  const result = login({ email: body.email, password: body.password });
  if ("error" in result) return fail(result.error, 401);

  cookies().set(SESSION_COOKIE, result.token, sessionCookieOptions);
  return ok({ user: toPublicUser(result.user) });
}
