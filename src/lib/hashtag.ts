"use client";

/**
 * 본문에서 해시태그(#한글/영문/숫자) 추출
 */
export function extractHashtags(text: string): string[] {
  const matches = text.match(/#[가-힣a-zA-Z0-9_]+/g) || [];
  const uniq = Array.from(new Set(matches.map((t) => t.slice(1).toLowerCase())));
  return uniq;
}

/**
 * 본문에서 해시태그를 클릭 가능한 span으로 변환 (간단 버전)
 */
export function renderHashtags(text: string): { type: "text" | "tag"; value: string }[] {
  const parts: { type: "text" | "tag"; value: string }[] = [];
  const regex = /#[가-힣a-zA-Z0-9_]+/g;
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > lastIndex) {
      parts.push({ type: "text", value: text.slice(lastIndex, m.index) });
    }
    parts.push({ type: "tag", value: m[0] });
    lastIndex = m.index + m[0].length;
  }
  if (lastIndex < text.length) {
    parts.push({ type: "text", value: text.slice(lastIndex) });
  }
  return parts;
}

/**
 * 인기 해시태그 (시드 + 사용자 생성)
 */
const SEED_TAGS = [
  "상암동", "1인가구", "월세", "보증금", "주차", "엘리베이터", "냉방", "난방",
  "관리비", "이사", "입주", "퇴거", "오피스텔", "원룸", "투룸",
];

export function popularTags(): string[] {
  return SEED_TAGS;
}
