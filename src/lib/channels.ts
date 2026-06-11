// 주소 기반 채널 자동 개설 로직

import type { Address, Channel, ChannelKind, UserRole } from "@/types";
import { addChannel, getChannelByScope, uid } from "./storage";

const ROLE_TO_KIND: Record<UserRole, { building: ChannelKind; region: ChannelKind }> = {
  tenant: { building: "tenant-building", region: "tenant-region" },
  landlord: { building: "landlord-building", region: "landlord-region" },
  manager: { building: "manager-building", region: "manager-region" },
};

const ROLE_LABEL: Record<UserRole, string> = {
  tenant: "임차인",
  landlord: "임대인",
  manager: "관리인",
};

/**
 * 주소가 등록되면 그 주소에 해당하는 두 개의 채널(오피스텔 + 지역)을
 * (이미 존재하지 않는 한) 자동으로 개설한다.
 */
export function ensureChannelsForAddress(addr: Address): Channel[] {
  const { building: buildingKind, region: regionKind } = ROLE_TO_KIND[addr.role];
  const roleLabel = ROLE_LABEL[addr.role];

  const created: Channel[] = [];

  // 오피스텔(건물) 채널
  const buildingScope = `building:${addr.detail}`;
  if (!getChannelByScope(buildingScope)) {
    const ch: Channel = {
      id: uid(),
      kind: buildingKind,
      scopeKey: buildingScope,
      title: `${addr.detail} ${roleLabel} 전용 채널`,
      description: `${addr.sido} ${addr.sigungu} ${addr.dong} · ${addr.detail}`,
      createdAt: Date.now(),
    };
    addChannel(ch);
    created.push(ch);
  }

  // 지역(동) 채널
  const regionScope = `region:${addr.sigungu}:${addr.dong}`;
  if (!getChannelByScope(regionScope)) {
    const ch: Channel = {
      id: uid(),
      kind: regionKind,
      scopeKey: regionScope,
      title: `${addr.sigungu} ${addr.dong} ${roleLabel} 전용 채널`,
      description: `${addr.sido} ${addr.sigungu} ${addr.dong}`,
      createdAt: Date.now(),
    };
    addChannel(ch);
    created.push(ch);
  }

  return created;
}

/**
 * 사용자의 주소에 해당하는 채널 id 목록을 반환한다.
 * (오피스텔 + 지역)
 */
export function channelIdsForAddresses(addrs: Address[]): string[] {
  const scopes = new Set<string>();
  for (const a of addrs) {
    scopes.add(`building:${a.detail}`);
    scopes.add(`region:${a.sigungu}:${a.dong}`);
  }
  // scopes -> ids 는 호출 측에서 getChannels로 매핑
  return Array.from(scopes);
}
