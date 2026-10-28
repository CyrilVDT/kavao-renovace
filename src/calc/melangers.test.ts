import { describe, expect, it } from "vitest";
import { defaultParams } from "./defaults";
import { computeEconomy } from "./economy";
import { compareAtVolume, payback, paybackPairs, recommend } from "./melangers";

const near = (a: number, b: number, eps = 0.01) => {
  expect(Math.abs(a - b)).toBeLessThan(eps);
};

describe("melanger comparison", () => {
  const p = defaultParams;

  it("uses the same model as the main plan", () => {
    const [, , m35] = compareAtVolume(p);
    near(m35.profit, computeEconomy(p).profit);
  });

  it("14 kg: 7 kg needs 2 batches, 25 and 35 need 1; all fit in 2 days", () => {
    const [m7, m25, m35] = compareAtVolume(p, 14);
    expect([m7.batches, m25.batches, m35.batches]).toEqual([2, 1, 1]);
    const rec = recommend([m7, m25, m35]);
    expect(rec.fitting).toHaveLength(3);
    expect(rec.cheapestFit?.melanger.id).toBe("m7");
  });

  it("30 kg: 7 kg needs 5 days and does not fit", () => {
    const [m7, m25, m35] = compareAtVolume(p, 30);
    expect(m7.batches).toBe(5);
    expect(m7.fits).toBe(false);
    expect(m25.fits).toBe(true);
    expect(m35.fits).toBe(true);
  });

  it("payback 7 → 25 at 14 kg = extra price / saved worker hours (not double-counting depreciation)", () => {
    const [m7, m25] = compareAtVolume(p, 14);
    const pb = payback(m7, m25);
    near(pb.extraCzk, (8900 - 4390) * 25);
    near(pb.weeklySaving, 1.5 * 200);
    near(pb.years!, 112750 / (300 * 52));
  });

  it("25 → 35 at 14 kg saves nothing, so it never pays back", () => {
    const [, m25, m35] = compareAtVolume(p, 14);
    expect(payback(m25, m35).years).toBeNull();
  });

  it("payback pairs skip a bowl that itself does not fit in the days", () => {
    const pairs = paybackPairs(compareAtVolume(p, 25));
    expect(pairs.map((x) => `${x.from.melanger.id}-${x.to.melanger.id}`)).toEqual(["m25-m35"]);
  });
});
