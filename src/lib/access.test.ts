import { describe, expect, it } from "vitest";
import { canAccessRole, roleHome } from "./access";

describe("role access", () => {
  it("allows only configured roles", () => {
    expect(canAccessRole("landlord", ["landlord"])).toBe(true);
    expect(canAccessRole("tenant", ["landlord"])).toBe(false);
  });

  it("returns the correct role home", () => {
    expect(roleHome("tenant")).toBe("/");
    expect(roleHome("landlord")).toBe("/landlord-dashboard");
    expect(roleHome("manager")).toBe("/manager-dashboard");
  });
});
