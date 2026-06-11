"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getDict, type Lang } from "@/lib/i18n";

type Dict = ReturnType<typeof getDict>;

interface I18nContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: keyof Dict) => string;
  dict: Dict;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ko");

  useEffect(() => {
    const saved = localStorage.getItem("officelink:lang") as Lang | null;
    if (saved && ["ko", "en", "ja", "zh"].includes(saved)) {
      setLangState(saved);
    } else if (typeof navigator !== "undefined") {
      const nav = navigator.language;
      if (nav.startsWith("en")) setLangState("en");
      else if (nav.startsWith("ja")) setLangState("ja");
      else if (nav.startsWith("zh")) setLangState("zh");
    }
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem("officelink:lang", l);
    } catch {}
  };

  const dict = getDict(lang);
  const t = (key: keyof Dict) => dict[key] ?? key.toString();

  return (
    <I18nContext.Provider value={{ lang, setLang, t, dict }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    // Fallback for SSR / static
    const d = getDict("ko");
    return {
      lang: "ko" as Lang,
      setLang: () => {},
      t: (key: keyof Dict) => d[key] ?? key.toString(),
      dict: d,
    };
  }
  return ctx;
}
