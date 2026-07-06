import { cookies } from "next/headers";
import { ensureSeeded } from "@/server/seed.server";
import { signup, toPublicUser, SESSION_COOKIE, sessionCookieOptions } from "@/server/auth";
import { ok, fail, readJson } from "@/server/http";
import type { UserRole } from "@/types";

export const dynamic = "force-dynamic";

/** POST /api/auth/signup  body: { email, password, nickname, role } */
export async function POST(req: Request) {
  ensureSeeded();
  const body = await readJson<{
    email?: string;
    password?: string;
    nickname?: string;
    role?: UserRole;
  }>(req);
  if (!body?.email || !body.password || !body.nickname)
    return fail("이메일·비밀번호·닉네임은 필수예요");

  const result = signup({
    email: body.email,
    password: body.password,
    nickname: body.nickname,
    role: body.role ?? "tenant",
  });
  if ("error" in result) return fail(result.error, 409);

  cookies().set(SESSION_COOKIE, result.token, sessionCookieOptions);
  return ok({ user: toPublicUser(result.user) }, { status: 201 });
}
