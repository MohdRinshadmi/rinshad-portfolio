import { describe, expect, it } from "vitest";
import { splitMetrics } from "./metrics";
import { experience } from "./profile";

const metricsOf = (text: string) =>
  splitMetrics(text)
    .filter((s) => s.isMetric)
    .map((s) => s.text);

describe("splitMetrics", () => {
  it("pulls percentages out of a sentence", () => {
    expect(metricsOf("cut average API response time by 35%")).toEqual(["35%"]);
  });

  it("handles a decimal percentage and a space before the sign", () => {
    expect(metricsOf("2.5% slower")).toEqual(["2.5%"]);
    expect(metricsOf("a 40 % increase")).toEqual(["40 %"]);
  });

  it("pulls counts written with a trailing plus", () => {
    expect(metricsOf("designed 40+ RESTful API endpoints")).toEqual(["40+"]);
  });

  it("keeps a thousands separator inside the token", () => {
    expect(metricsOf("handling 2,000+ monthly transactions")).toEqual(["2,000+"]);
    expect(metricsOf("over 1,250,000+ rows")).toEqual(["1,250,000+"]);
  });

  it("keeps a plus that trails a percentage", () => {
    expect(metricsOf("cutting build times 60%+")).toEqual(["60%+"]);
  });

  it("ignores a bare year with no unit", () => {
    expect(metricsOf("In 2023, we shipped the migration")).toEqual([]);
  });

  it("finds several metrics in one line, in order", () => {
    expect(
      metricsOf("40+ endpoints and 2000+ transactions cut latency 35%"),
    ).toEqual(["40+", "2000+", "35%"]);
  });

  it("matches the latency phrases", () => {
    expect(metricsOf("responses stay sub-second")).toEqual(["sub-second"]);
    expect(metricsOf("frames render sub-16ms")).toEqual(["sub-16ms"]);
  });

  it("matches 'zero' only as a whole word", () => {
    expect(metricsOf("zero downtime")).toEqual(["zero"]);
    // "zeroes" must not be highlighted — \b guards the tail.
    expect(metricsOf("the zeroes in the column")).toEqual([]);
  });

  it("returns a single non-metric segment when there is nothing to mark", () => {
    const segments = splitMetrics("Designed relational schemas in MySQL");
    expect(segments).toHaveLength(1);
    expect(segments[0].isMetric).toBe(false);
  });

  it("is lossless — segments rejoin to the original string", () => {
    const line =
      "Shipped 40+ endpoints, cut response time 35%, and held zero downtime.";
    expect(splitMetrics(line).map((s) => s.text).join("")).toBe(line);
  });

  it("drops the empty strings split produces around adjacent matches", () => {
    // A string that is nothing but a metric splits to ["", "35%", ""].
    expect(splitMetrics("35%")).toEqual([{ text: "35%", isMetric: true }]);
  });

  it("handles an empty string", () => {
    expect(splitMetrics("")).toEqual([]);
  });

  it("stays stateless across calls (no global regex flag)", () => {
    // A /g regex would alternate between hit and miss on repeated tests.
    for (let i = 0; i < 5; i++) {
      expect(metricsOf("cut latency 35%")).toEqual(["35%"]);
    }
  });
});

describe("the résumé lines it actually runs on", () => {
  const achievements = experience.flatMap((role) => role.achievements);

  it("is lossless over every achievement on the site", () => {
    for (const line of achievements) {
      expect(splitMetrics(line).map((s) => s.text).join("")).toBe(line);
    }
  });

  it("finds the headline proof numbers in the current résumé copy", () => {
    const all = achievements.flatMap(metricsOf);
    expect(all).toContain("40+");
    expect(all).toContain("35%");
    // Regression: the comma used to break the digit run, chipping this as
    // "000+" and stranding the "2," outside the highlight.
    expect(all).toContain("2,000+");
    expect(all).toContain("60%+");
  });
});
