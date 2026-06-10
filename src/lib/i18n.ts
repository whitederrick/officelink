"use client";

// 간단한 한/영 i18n 시스템
// - localStorage에 사용자 언어 저장
// - 데이터 속성으로 HTML lang 업데이트

export type Lang = "ko" | "en";

const KO = {
  appName: "OFFICELINK",
  tagline: "1인가구 오피스텔 라이프 플랫폼",
  home: "홈",
  feed: "피드",
  write: "글쓰기",
  profile: "내정보",
  services: "서비스",
  search: "검색",
  notifications: "알림",
  next: "다음",
  prev: "이전",
  save: "저장",
  cancel: "취소",
  delete: "삭제",
  edit: "수정",
  submit: "등록",
  loading: "로딩 중…",
  retry: "다시 시도",
  noResults: "결과가 없어요",
  welcome: "안녕하세요",
};

const EN: Record<keyof typeof KO, string> = {
  appName: "OFFICELINK",
  tagline: "1-person officetel life platform",
  home: "Home",
  feed: "Feed",
  write: "Write",
  profile: "Profile",
  services: "Services",
  search: "Search",
  notifications: "Notifications",
  next: "Next",
  prev: "Previous",
  save: "Save",
  cancel: "Cancel",
  delete: "Delete",
  edit: "Edit",
  submit: "Submit",
  loading: "Loading…",
  retry: "Retry",
  noResults: "No results",
  welcome: "Hello",
};

export const DICT = { ko: KO, en: EN };

const LANG_KEY = "officelink:lang";

export function getLang(): Lang {
  if (typeof window === "undefined") return "ko";
  const v = window.localStorage.getItem(LANG_KEY);
  return v === "en" ? "en" : "ko";
}

export function setLang(lang: Lang) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LANG_KEY, lang);
  if (typeof document !== "undefined") {
    document.documentElement.lang = lang;
  }
}

export function t(key: keyof typeof KO, lang: Lang = "ko"): string {
  return DICT[lang][key] || KO[key];
}
