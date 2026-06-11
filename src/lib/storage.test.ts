import { describe, it, expect, beforeEach } from "vitest";
import { getReviews, addReview, uid } from "./storage";

const fullReview = (overrides: any = {}) => ({
  id: uid(),
  buildingId: "b-1",
  authorId: "u-1",
  authorNickname: "테스터",
  authorRole: "tenant" as const,
  rating: 5,
  ratings: { noise: 4, light: 4, water: 4, management: 4, transport: 4, safety: 4 },
  content: "좋아요",
  summary: "한 줄 요약",
  category: "overall" as const,
  pros: ["조용함"],
  cons: [],
  likes: 0,
  createdAt: Date.now(),
  ...overrides,
});

describe("storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("uid", () => {
    it("generates unique IDs", () => {
      expect(uid()).not.toBe(uid());
    });
    it("returns string", () => {
      expect(typeof uid()).toBe("string");
    });
  });

  describe("addReview + getReviews", () => {
    it("adds and retrieves a review", () => {
      addReview(fullReview({ content: "좋아요" }));
      const reviews = getReviews("b-1");
      expect(reviews).toHaveLength(1);
      expect(reviews[0].content).toBe("좋아요");
    });

    it("returns empty for unknown building", () => {
      expect(getReviews("unknown")).toEqual([]);
    });

    it("filters by buildingId", () => {
      addReview(fullReview({ id: "r1", buildingId: "b-1" }));
      addReview(fullReview({ id: "r2", buildingId: "b-2" }));
      expect(getReviews("b-1")).toHaveLength(1);
      expect(getReviews("b-2")).toHaveLength(1);
    });
  });
});
