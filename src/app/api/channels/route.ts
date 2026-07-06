import { ensureSeeded } from "@/server/seed.server";
import { channels } from "@/server/repo";
import { ok } from "@/server/http";
import type { ChannelKind } from "@/types";

export const dynamic = "force-dynamic";

/** GET /api/channels?kind=public&scope=region:마포구:상암동 */
export async function GET(req: Request) {
  ensureSeeded();
  const url = new URL(req.url);
  const kind = url.searchParams.get("kind") as ChannelKind | null;
  const scope = url.searchParams.get("scope");

  let list = channels.all();
  if (kind) list = list.filter((c) => c.kind === kind);
  if (scope) list = list.filter((c) => c.scopeKey === scope);
  list = list.sort((a, b) => b.createdAt - a.createdAt);
  return ok(list, { count: list.length });
}
