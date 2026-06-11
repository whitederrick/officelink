import { describe, it, expect } from "vitest";
import { getDict, LANG_LABEL, type Lang } from "./i18n";

describe("i18n", () => {
  describe("LANG_LABEL", () => {
    it("has all 4 languages", () => {
      expect(Object.keys(LANG_LABEL)).toEqual(expect.arrayContaining(["ko", "en", "ja", "zh"]));
    });

    it("each lang has flag + native + english name", () => {
      (["ko", "en", "ja", "zh"] as Lang[]).forEach((l) => {
        expect(LANG_LABEL[l].flag).toBeTruthy();
        expect(LANG_LABEL[l].native).toBeTruthy();
        expect(LANG_LABEL[l].english).toBeTruthy();
      });
    });
  });

  describe("getDict", () => {
    it("returns Korean dict for 'ko'", () => {
      const d = getDict("ko");
      expect(d.home).toBe("홈");
    });

    it("returns English dict for 'en'", () => {
      const d = getDict("en");
      expect(d.home).toBe("Home");
    });

    it("returns Japanese dict for 'ja'", () => {
      const d = getDict("ja");
      expect(d.home).toBe("ホーム");
    });

    it("returns Chinese dict for 'zh'", () => {
      const d = getDict("zh");
      expect(d.home).toBe("首页");
    });

    it("falls back to Korean for unknown lang", () => {
      const d = getDict("xx" as Lang);
      expect(d.home).toBe("홈");
    });

    it("all dicts have same keys", () => {
      const ko = getDict("ko");
      const en = getDict("en");
      const ja = getDict("ja");
      const zh = getDict("zh");
      const koKeys = Object.keys(ko).sort();
      expect(Object.keys(en).sort()).toEqual(koKeys);
      expect(Object.keys(ja).sort()).toEqual(koKeys);
      expect(Object.keys(zh).sort()).toEqual(koKeys);
    });
  });
});
