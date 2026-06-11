"use client";

import { useEffect, useState, useCallback } from "react";
import { getLang, setLang as setLangRaw, t as tRaw, type Lang } from "./i18n";

/**
 * React에서 t()와 setLang() 사용
 */
export function useT() {
  const [lang, setLangState] = useState<Lang>("ko");

  useEffect(() => {
    setLangState(getLang());
    const onChange = (e: Event) => {
      setLangState((e as CustomEvent<Lang>).detail);
    };
    window.addEventListener("officelink:lang", onChange);
    // storage 변경 (다른 탭)
    const onStorage = (e: StorageEvent) => {
      if (e.key === "officelink:lang") setLangState(getLang());
    };
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("officelink:lang", onChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const t = useCallback(
    (key: string) => tRaw(key, lang),
    [lang],
  );

  const setLang = useCallback((l: Lang) => {
    setLangRaw(l);
    setLangState(l);
  }, []);

  return { t, lang, setLang };
}
