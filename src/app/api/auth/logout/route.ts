import { cookies } from "next/headers";
import { destroySession, SESSION_COOKIE } from "@/server/auth";
import { ok } from "@/server/http";

export const dynamic = "force-dynamic";

/** POST /api/auth/logout */
export async function POST() {
  const jar = cookies();
  destroySession(jar.get(SESSION_COOKIE)?.value);
  jar.delete(SESSION_COOKIE);
  return ok({ loggedOut: true });
}
