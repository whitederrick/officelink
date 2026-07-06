// 인증: 이메일+비밀번호 가입/로그인, 세션 토큰(httpOnly 쿠키).
//
// 비밀번호는 scrypt 로 해시(평문 저장 안 함). 세션 토큰은 sessions 컬렉션 + 쿠키로 관리.
// PPTX 의 Pass/SMS 본인인증은 후속 단계 — 지금은 이메일/비밀번호 기본 인증.

import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import type { PublicUser, User, UserRole } from "@/types";
import { Collection, uid } from "./db";
import { users } from "./repo";

export const SESSION_COOKIE = "officelink_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30일

// 서버 전용 레코드 (공유 types 에 두지 않음)
interface Account {
  id: string; // = userId
  email: string;
  passwordHash: string; // salt:hash (hex)
  createdAt: number;
}
interface Session {
  id: string; // 토큰
  userId: string;
  createdAt: number;
  expiresAt: number;
}

const accounts = new Collection<Account>("accounts");
const sessions = new Collection<Session>("sessions");

// ----- 비밀번호 해시 -----
function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}
function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const hashBuf = Buffer.from(hash, "hex");
  const test = scryptSync(password, salt, 64);
  return hashBuf.length === test.length && timingSafeEqual(hashBuf, test);
}

export function toPublicUser(u: User & { email?: string }): PublicUser {
  return {
    id: u.id,
    nickname: u.nickname,
    role: u.role,
    email: u.email,
    createdAt: u.createdAt,
  };
}

// ----- 가입 -----
export function signup(input: {
  email: string;
  password: string;
  nickname: string;
  role: UserRole;
}): { user: User; token: string } | { error: string } {
  const email = input.email.trim().toLowerCase();
  if (!email || !input.password || !input.nickname)
    return { error: "이메일·비밀번호·닉네임은 필수예요" };
  if (input.password.length < 6)
    return { error: "비밀번호는 6자 이상이어야 해요" };
  if (accounts.find((a) => a.email === email))
    return { error: "이미 가입된 이메일이에요" };

  const userId = uid();
  const now = Date.now();
  const user: User = {
    id: userId,
    nickname: input.nickname.trim(),
    role: input.role,
    createdAt: now,
  };
  users.insert(user);
  accounts.insert({
    id: userId,
    email,
    passwordHash: hashPassword(input.password),
    createdAt: now,
  });
  const token = createSession(userId);
  return { user, token };
}

// ----- 로그인 -----
export function login(input: {
  email: string;
  password: string;
}): { user: User; token: string } | { error: string } {
  const email = input.email.trim().toLowerCase();
  const account = accounts.find((a) => a.email === email);
  if (!account) return { error: "이메일 또는 비밀번호가 올바르지 않아요" };
  if (!verifyPassword(input.password, account.passwordHash))
    return { error: "이메일 또는 비밀번호가 올바르지 않아요" };
  const user = users.byId(account.id);
  if (!user) return { error: "사용자 정보를 찾을 수 없어요" };
  const token = createSession(user.id);
  return { user, token };
}

// ----- 세션 -----
function createSession(userId: string): string {
  const token = randomBytes(24).toString("hex");
  const now = Date.now();
  sessions.insert({
    id: token,
    userId,
    createdAt: now,
    expiresAt: now + SESSION_TTL_MS,
  });
  return token;
}

export function getUserByToken(token: string | undefined): User | null {
  if (!token) return null;
  const session = sessions.byId(token);
  if (!session) return null;
  if (session.expiresAt < Date.now()) {
    sessions.remove(token);
    return null;
  }
  return users.byId(session.userId) ?? null;
}

export function destroySession(token: string | undefined): void {
  if (token) sessions.remove(token);
}

/** 이메일로 계정 존재 여부 (테스트/디버그용). */
export function accountEmail(userId: string): string | undefined {
  return accounts.byId(userId)?.email;
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_TTL_MS / 1000,
  secure: process.env.NODE_ENV === "production",
};
