import { ensureSeeded } from "@/server/seed.server";
import { createAddress, listAddresses, addresses, uid } from "@/server/repo";
import { currentUser } from "@/server/session";
import { ok, fail, readJson } from "@/server/http";
import type { Address, UserRole } from "@/types";

export const dynamic = "force-dynamic";

/** GET /api/addresses — 내 주소 목록 */
export async function GET() {
  ensureSeeded();
  const me = currentUser();
  if (!me) return fail("로그인이 필요해요", 401);
  const list = listAddresses(me.id);
  return ok(list, { count: list.length });
}

/**
 * POST /api/addresses
 * body: { role, sido, sigungu, dong, detail, label?, isPrimary? }
 * 주소 등록 시 해당 오피스텔 + 지역 채널을 자동 개설한다.
 */
export async function POST(req: Request) {
  ensureSeeded();
  const me = currentUser();
  if (!me) return fail("로그인이 필요해요", 401);

  const body = await readJson<{
    role?: UserRole;
    sido?: string;
    sigungu?: string;
    dong?: string;
    detail?: string;
    label?: string;
    isPrimary?: boolean;
  }>(req);
  if (!body?.sigungu || !body.dong || !body.detail)
    return fail("시군구·동·상세주소는 필수예요");

  const addr: Address = {
    id: uid(),
    userId: me.id,
    role: body.role ?? me.role,
    sido: body.sido ?? "서울특별시",
    sigungu: body.sigungu,
    dong: body.dong,
    detail: body.detail,
    label: body.label ?? "주소",
    isPrimary: !!body.isPrimary,
    createdAt: Date.now(),
  };
  const result = createAddress(addr);
  return ok({ address: result.address, createdChannels: result.channels }, { status: 201 });
}

/** DELETE /api/addresses?id=xxx */
export async function DELETE(req: Request) {
  ensureSeeded();
  const me = currentUser();
  if (!me) return fail("로그인이 필요해요", 401);
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return fail("id 가 필요해요");
  const addr = addresses.byId(id);
  if (!addr || addr.userId !== me.id) return fail("주소를 찾을 수 없어요", 404);
  addresses.remove(id);
  return ok({ removed: true });
}
