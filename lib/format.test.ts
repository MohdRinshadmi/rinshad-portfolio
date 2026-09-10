import { describe, expect, it } from "vitest";
import { formatCount } from "./format";

describe("formatCount", () => {
  it("groups thousands the way the résumé writes them", () => {
    expect(formatCount(2000, 0, "", "+")).toBe("2,000+");
  });

  it("keeps prefix and suffix around the number", () => {
    expect(formatCount(35, 0, "", "%")).toBe("35%");
    expect(formatCount(60, 0, "", "%+")).toBe("60%+");
    expect(formatCount(5, 0, "~", "s")).toBe("~5s");
  });

  it("rounds intermediate animation frames to the requested precision", () => {
    expect(formatCount(1999.6)).toBe("2,000");
    expect(formatCount(2.46, 1)).toBe("2.5");
  });

  it("never renders a zero for a real final value", () => {
    // The production bug this module exists to prevent: "0+ REST endpoints".
    for (const target of [3, 35, 40, 60, 2000]) {
      expect(formatCount(target)).not.toBe("0");
    }
  });
});
