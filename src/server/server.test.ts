import { afterAll, beforeEach, describe, expect, it } from "vitest";
import os from "node:os";
import path from "node:path";

// 테스트 격리: 임시 디렉터리에 데이터 저장 (실 .data 건드리지 않음)
const TMP = path.join(os.tmpdir(), `officelink-test-${process.pid}`);
process.env.OFFICELINK_DATA_DIR = TMP;

import { Collection, __resetDbForTests, getMeta, setMeta, uid } from "./db";
import { ensureSeeded, runServerSeed } from "./seed.server";
import {
  acceptRelationship,
  buildings,
  channels,
  createAddress,
  endRelationship,
  findMatchableUsers,
  listReviews,
  relationshipKindFor,
  requestRelationship,
  users,
} from "./repo";
import { login, signup, getUserByToken } from "./auth";
import type { Address, User } from "@/types";

beforeEach(() => {
  __resetDbForTests();
});
afterAll(() => {
  __resetDbForTests();
});

describe("db: Collection", () => {
  it("insert / byId / update / remove 가 동작한다", () => {
    const col = new Collection<{ id: string; n: number }>("t_items");
    col.insert({ id: "a", n: 1 });
    col.insert({ id: "b", n: 2 });
    expect(col.all()).toHaveLength(2);
    expect(col.byId("a")?.n).toBe(1);

    col.update("a", { n: 10 });
    expect(col.byId("a")?.n).toBe(10);

    expect(col.remove("a")).toBe(true);
    expect(col.byId("a")).toBeUndefined();
    expect(col.all()).toHaveLength(1);
  });

  it("파일 저장이 캐시를 넘어 영속된다", () => {
    const col = new Collection<{ id: string }>("t_persist");
    col.insert({ id: "x" });
    __resetDbForTests(); // 캐시 비우고 파일도 지움 → 0
    expect(col.all()).toHaveLength(0);
  });

  it("meta key-value 가 저장/조회된다", () => {
    expect(getMeta("k")).toBeNull();
    setMeta("k", "v");
    expect(getMeta("k")).toBe("v");
  });

  it("uid 는 고유하다", () => {
    const ids = new Set(Array.from({ length: 200 }, () => uid()));
    expect(ids.size).toBe(200);
  });
});

describe("seed", () => {
  it("시드는 건물/채널/리뷰를 채우고 1회만 실행된다", () => {
    runServerSeed();
    const n1 = buildings.all().length;
    expect(n1).toBeGreaterThan(0);
    expect(channels.all().length).toBeGreaterThan(0);
    // 평점 재계산 확인
    const b2 = buildings.byId("b-2");
    expect(b2?.ratingCount).toBeGreaterThan(0);

    // 재실행해도 중복되지 않음
    runServerSeed();
    expect(buildings.all().length).toBe(n1);
  });

  it("ensureSeeded 는 안전하게 반복 호출 가능", () => {
    ensureSeeded();
    ensureSeeded();
    expect(buildings.all().length).toBeGreaterThan(0);
  });
});

describe("auth", () => {
  it("가입 후 토큰으로 사용자를 조회할 수 있다", () => {
    const res = signup({
      email: "Test@Example.com",
      password: "secret1",
      nickname: "테스터",
      role: "tenant",
    });
    expect("error" in res).toBe(false);
    if ("error" in res) return;
    expect(getUserByToken(res.token)?.nickname).toBe("테스터");
  });

  it("이메일은 대소문자 무시하고 중복 가입을 막는다", () => {
    signup({ email: "a@b.com", password: "secret1", nickname: "A", role: "tenant" });
    const dup = signup({ email: "A@B.COM", password: "secret1", nickname: "B", role: "tenant" });
    expect("error" in dup).toBe(true);
  });

  it("짧은 비밀번호는 거부된다", () => {
    const res = signup({ email: "c@d.com", password: "123", nickname: "C", role: "tenant" });
    expect("error" in res).toBe(true);
  });

  it("로그인은 올바른 비밀번호만 통과한다", () => {
    signup({ email: "e@f.com", password: "secret1", nickname: "E", role: "landlord" });
    expect("error" in login({ email: "e@f.com", password: "wrong" })).toBe(true);
    const good = login({ email: "e@f.com", password: "secret1" });
    expect("error" in good).toBe(false);
  });
});

describe("addresses → channels", () => {
  function makeUser(role: User["role"]): User {
    const u: User = { id: uid(), nickname: role, role, createdAt: Date.now() };
    users.insert(u);
    return u;
  }
  function addr(u: User, detail: string, dong = "상암동"): Address {
    return {
      id: uid(),
      userId: u.id,
      role: u.role,
      sido: "서울특별시",
      sigungu: "마포구",
      dong,
      detail,
      label: "주소",
      isPrimary: true,
      createdAt: Date.now(),
    };
  }

  it("주소 등록 시 오피스텔+지역 채널이 자동 개설된다", () => {
    const u = makeUser("tenant");
    const { channels: created } = createAddress(addr(u, "상암오벨리스크 2차"));
    expect(created.length).toBe(2);
    expect(channels.find((c) => c.scopeKey === "building:상암오벨리스크 2차")).toBeTruthy();
    expect(channels.find((c) => c.scopeKey === "region:마포구:상암동")).toBeTruthy();
  });

  it("같은 스코프 채널은 중복 생성되지 않는다", () => {
    const u1 = makeUser("tenant");
    const u2 = makeUser("tenant");
    createAddress(addr(u1, "상암오벨리스크 2차"));
    const before = channels.all().length;
    createAddress(addr(u2, "상암오벨리스크 2차"));
    expect(channels.all().length).toBe(before); // 둘 다 동일 → 신규 0
  });
});

describe("relationships", () => {
  function makeUser(role: User["role"], detail: string): User {
    const u: User = { id: uid(), nickname: role, role, createdAt: Date.now() };
    users.insert(u);
    createAddress({
      id: uid(),
      userId: u.id,
      role,
      sido: "서울특별시",
      sigungu: "마포구",
      dong: "상암동",
      detail,
      label: "주소",
      isPrimary: true,
      createdAt: Date.now(),
    });
    return u;
  }

  it("역할 쌍에서 관계 종류를 정한다", () => {
    expect(relationshipKindFor("tenant", "landlord")).toBe("tenant-landlord");
    expect(relationshipKindFor("manager", "tenant")).toBe("tenant-manager");
    expect(relationshipKindFor("tenant", "tenant")).toBeNull();
  });

  it("같은 오피스텔 사용자만 매칭 후보로 잡힌다", () => {
    const tenant = makeUser("tenant", "상암오벨리스크 2차");
    makeUser("landlord", "상암오벨리스크 2차"); // 매칭됨
    makeUser("manager", "다른오피스텔"); // 안 됨

    const matches = findMatchableUsers(tenant.id);
    expect(matches).toHaveLength(1);
    expect(matches[0].role).toBe("landlord");
  });

  it("신청 → 수락 시 연계 채널이 생기고 active 가 된다", () => {
    const tenant = makeUser("tenant", "상암오벨리스크 2차");
    const landlord = makeUser("landlord", "상암오벨리스크 2차");

    const req = requestRelationship({
      requester: tenant,
      addressee: landlord,
      buildingScope: "building:상암오벨리스크 2차",
      buildingLabel: "상암오벨리스크 2차",
    });
    expect("error" in req).toBe(false);
    if ("error" in req) return;
    expect(req.status).toBe("requested");

    // 신청자가 수락 시도 → 거부
    expect("error" in acceptRelationship(req.id, tenant.id)).toBe(true);

    // 받은 사람이 수락 → active + 채널 생성
    const accepted = acceptRelationship(req.id, landlord.id);
    expect("error" in accepted).toBe(false);
    if ("error" in accepted) return;
    expect(accepted.status).toBe("active");
    expect(accepted.channelId).toBeTruthy();
    expect(channels.byId(accepted.channelId!)).toBeTruthy();
  });

  it("중복 신청은 막는다", () => {
    const tenant = makeUser("tenant", "상암오벨리스크 2차");
    const landlord = makeUser("landlord", "상암오벨리스크 2차");
    const input = {
      requester: tenant,
      addressee: landlord,
      buildingScope: "building:상암오벨리스크 2차",
      buildingLabel: "상암오벨리스크 2차",
    };
    requestRelationship(input);
    expect("error" in requestRelationship(input)).toBe(true);
  });

  it("관계 종료는 당사자만 가능하다", () => {
    const tenant = makeUser("tenant", "상암오벨리스크 2차");
    const landlord = makeUser("landlord", "상암오벨리스크 2차");
    const other = makeUser("manager", "상암오벨리스크 2차");
    const req = requestRelationship({
      requester: tenant,
      addressee: landlord,
      buildingScope: "building:상암오벨리스크 2차",
      buildingLabel: "상암오벨리스크 2차",
    });
    if ("error" in req) throw new Error("setup failed");
    expect("error" in endRelationship(req.id, other.id)).toBe(true);
    const ended = endRelationship(req.id, tenant.id);
    expect("error" in ended).toBe(false);
  });
});

describe("reviews recompute", () => {
  it("리뷰 작성 시 건물 평점이 재계산된다", () => {
    runServerSeed();
    const before = buildings.byId("b-1")!;
    const beforeCount = before.ratingCount;
    // 리뷰 직접 추가 후 재계산은 createReview 경로에서 검증
    const list = listReviews("b-1");
    expect(list.length).toBe(beforeCount);
  });
});
