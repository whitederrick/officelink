// 쿠키 기반 현재 사용자 조회. next/headers 에 의존하므로 Route Handler 에서만 사용.
// (순수 인증 로직은 auth.ts 에 있고, 테스트는 그쪽만 import 한다.)

import { cookies } from "next/headers";
import type { User } from "@/types";
import { getUserByToken, SESSION_COOKIE } from "./auth";

/** 요청 쿠키에서 현재 로그인 사용자를 읽는다. 없으면 null. */
export function currentUser(): User | null {
  const token = cookies().get(SESSION_COOKIE)?.value;
  return getUserByToken(token);
}
