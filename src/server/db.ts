// 서버 전용 영속성 레이어.
//
// 파일 기반 JSON 컬렉션 저장소. 외부 DB 없이 `next dev` / `next start` 에서 동작하며,
// 나중에 Postgres(Drizzle 등)로 갈아끼울 때 이 파일과 repo.ts 만 교체하면 된다.
//
// ⚠️ 이 모듈은 절대 클라이언트 컴포넌트에서 import 하지 말 것. (Node fs 사용)
//    Route Handler / 서버 코드에서만 사용한다.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// 데이터 디렉터리. 배포 환경/테스트에서 OFFICELINK_DATA_DIR 로 덮어쓸 수 있다.
// 환경변수를 매번 읽어, 테스트가 격리된 임시 디렉터리를 지정할 수 있게 한다.
function getDataDir(): string {
  if (process.env.OFFICELINK_DATA_DIR) {
    return process.env.OFFICELINK_DATA_DIR;
  }

  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    return path.join(os.tmpdir(), "officelink-data");
  }

  return path.join(process.cwd(), ".data");
}

// 같은 프로세스 내 반복 읽기를 줄이기 위한 인메모리 캐시.
// (개발 서버 / 단일 인스턴스 기준. 멀티 인스턴스 영속성이 필요해지면 실 DB로 전환.)
const cache = new Map<string, unknown[]>();

let ensuredDir: string | null = null;
function ensureDir() {
  const dir = getDataDir();
  if (ensuredDir === dir) return;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  ensuredDir = dir;
}

function fileFor(name: string): string {
  return path.join(getDataDir(), `${name}.json`);
}

/** 컬렉션 전체를 읽어온다. 파일이 없으면 빈 배열. */
export function readCollection<T>(name: string): T[] {
  if (cache.has(name)) {
    return cache.get(name) as T[];
  }
  ensureDir();
  const file = fileFor(name);
  let rows: T[] = [];
  try {
    if (fs.existsSync(file)) {
      const raw = fs.readFileSync(file, "utf8");
      rows = raw ? (JSON.parse(raw) as T[]) : [];
    }
  } catch {
    rows = [];
  }
  cache.set(name, rows as unknown[]);
  return rows;
}

/** 컬렉션 전체를 덮어쓴다(write-through). */
export function writeCollection<T>(name: string, rows: T[]): void {
  ensureDir();
  cache.set(name, rows as unknown[]);
  const file = fileFor(name);
  const tmp = `${file}.tmp`;
  // 임시 파일에 먼저 쓰고 교체해 부분 쓰기로 인한 손상을 피한다.
  fs.writeFileSync(tmp, JSON.stringify(rows, null, 2), "utf8");
  fs.renameSync(tmp, file);
}

/**
 * 하나의 컬렉션에 대한 타입드 헬퍼.
 * id 필드를 가진 레코드를 가정한다.
 */
export interface HasId {
  id: string;
}

export class Collection<T extends HasId> {
  constructor(private readonly name: string) {}

  all(): T[] {
    return readCollection<T>(this.name);
  }

  find(predicate: (row: T) => boolean): T | undefined {
    return this.all().find(predicate);
  }

  filter(predicate: (row: T) => boolean): T[] {
    return this.all().filter(predicate);
  }

  byId(id: string): T | undefined {
    return this.all().find((r) => r.id === id);
  }

  insert(row: T): T {
    const rows = this.all();
    rows.push(row);
    writeCollection(this.name, rows);
    return row;
  }

  /** 여러 건을 한 번에 삽입 (시드 등에서 사용). */
  insertMany(newRows: T[]): void {
    const rows = this.all();
    rows.push(...newRows);
    writeCollection(this.name, rows);
  }

  update(id: string, patch: Partial<T>): T | undefined {
    const rows = this.all();
    const idx = rows.findIndex((r) => r.id === id);
    if (idx < 0) return undefined;
    rows[idx] = { ...rows[idx], ...patch };
    writeCollection(this.name, rows);
    return rows[idx];
  }

  /** predicate 로 찾은 첫 레코드를 patch. */
  updateWhere(predicate: (row: T) => boolean, patch: Partial<T>): T | undefined {
    const rows = this.all();
    const idx = rows.findIndex(predicate);
    if (idx < 0) return undefined;
    rows[idx] = { ...rows[idx], ...patch };
    writeCollection(this.name, rows);
    return rows[idx];
  }

  remove(id: string): boolean {
    const rows = this.all();
    const next = rows.filter((r) => r.id !== id);
    if (next.length === rows.length) return false;
    writeCollection(this.name, next);
    return true;
  }

  removeWhere(predicate: (row: T) => boolean): number {
    const rows = this.all();
    const next = rows.filter((r) => !predicate(r));
    const removed = rows.length - next.length;
    if (removed > 0) writeCollection(this.name, next);
    return removed;
  }

  /** 전체 교체. */
  replaceAll(rows: T[]): void {
    writeCollection(this.name, rows);
  }
}

/** 단순 key-value 메타 저장 (시드 플래그 등). */
const META = "_meta";
type MetaRow = { id: string; value: string };
export function getMeta(key: string): string | null {
  const row = readCollection<MetaRow>(META).find((r) => r.id === key);
  return row ? row.value : null;
}
export function setMeta(key: string, value: string): void {
  const rows = readCollection<MetaRow>(META);
  const idx = rows.findIndex((r) => r.id === key);
  if (idx >= 0) rows[idx] = { id: key, value };
  else rows.push({ id: key, value });
  writeCollection(META, rows);
}

/** 짧은 고유 id. storage.uid 와 동일 포맷. */
export function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** 테스트용: 인메모리 캐시 + 데이터 디렉터리 비우기. */
export function __resetDbForTests(): void {
  cache.clear();
  ensuredDir = null;
  const dir = getDataDir();
  try {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  } catch {
    /* noop */
  }
}
