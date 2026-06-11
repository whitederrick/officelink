import { describe, it, expect } from "vitest";
import { extractHashtags, renderHashtags, popularTags } from "./hashtag";

describe("hashtag", () => {
  describe("extractHashtags", () => {
    it("extracts simple hashtags", () => {
      expect(extractHashtags("조용하고 #깨끗한 #역세권 빌딩")).toEqual(["깨끗한", "역세권"]);
    });
    it("handles no hashtags", () => {
      expect(extractHashtags("태그 없음")).toEqual([]);
    });
    it("handles Korean characters", () => {
      expect(extractHashtags("#상암동 #디지털미디어시티")).toEqual(["상암동", "디지털미디어시티"]);
    });
  });

  describe("renderHashtags", () => {
    it("separates text and tags", () => {
      const parts = renderHashtags("조용 #역세권 빌딩");
      const tags = parts.filter((p) => p.type === "tag").map((p) => p.value);
      expect(tags.length).toBeGreaterThan(0);
      expect(tags).toContain("#역세권");
    });
  });

  describe("popularTags", () => {
    it("returns array", () => {
      expect(Array.isArray(popularTags())).toBe(true);
    });
  });
});
